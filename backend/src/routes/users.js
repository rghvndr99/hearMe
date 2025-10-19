import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { sendMail } from '../services/email.js';
import { buildResetPasswordEmail } from '../templates/resetPasswordEmail.js';

const router = express.Router();

// Rate limiters
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per window per key
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Please try again later.' },
  keyGenerator: (req, res) => {
    try {
      const id = (req.body?.usernameOrEmail || '').toString().toLowerCase();
      return `${ipKeyGenerator(req, res)}:${id}`;
    } catch {
      return ipKeyGenerator(req, res);
    }
  }
});

// Helpers
function hashPassword(password, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512');
  return hash.toString('hex');
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  return { salt, passwordHash };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(u) {
  return {
    id: u._id,
    username: u.username,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    language: u.language || 'en-US',
    selectedVoiceId: u.selectedVoiceId || 'browser',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, name, email, phone, language } = req.body || {};

    if (!username || !password || !confirmPassword || !name || !email) {
      return res.status(400).json({ error: 'username, password, confirmPassword, name and email are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const { salt, passwordHash } = createPasswordRecord(password);

    const user = await User.create({
      username,
      name,
      email,
      phone: phone || '',
      language: language || 'en-US',
      passwordSalt: salt,
      passwordHash,
    });

    const token = jwt.sign({ sub: user._id, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body || {};
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'usernameOrEmail and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const incomingHash = hashPassword(password, user.passwordSalt);
    if (incomingHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user._id, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    // auth middleware sets req.user; we used `sub` for user id
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/users/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { usernameOrEmail } = req.body || {};
    if (!usernameOrEmail) return res.status(400).json({ error: 'usernameOrEmail is required' });

    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: String(usernameOrEmail).toLowerCase() },
      ],
    });

    // Always return success message to avoid user enumeration
    const frontendOrigin = process.env.FRONTEND_ORIGIN || req.headers.origin || 'http://localhost:5174';

    if (!user) {
      const payload = { message: 'If an account exists, a reset link has been sent.' };
      if (process.env.NODE_ENV !== 'production') {
        payload.devNote = 'User not found; in production this remains generic';
      }
      return res.json(payload);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetTokenExpires = expires;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${frontendOrigin.replace(/\/$/, '')}/reset-password?token=${token}`;

    // Send reset email (provider configured via EMAIL_PROVIDER)
    try {
      const { subject, html, text } = buildResetPasswordEmail({ name: user.name || user.username, resetUrl, appName: process.env.APP_NAME || 'HearMe' });
      await sendMail({ to: user.email, subject, html, text });
    } catch (mailErr) {
      console.error('sendMail error:', mailErr?.message || mailErr);
      // Do not reveal email send errors to prevent enumeration; still return generic success
    }

    const response = { message: 'If an account exists, a reset link has been sent.' };
    if (process.env.NODE_ENV !== 'production') {
      response.resetUrl = resetUrl;
    }
    return res.json(response);
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/users/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'token, password and confirmPassword are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpires: { $gt: now },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const { salt, passwordHash } = createPasswordRecord(password);
    user.passwordSalt = salt;
    user.passwordHash = passwordHash;
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset-password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/users/change-password (authenticated)
router.post('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'currentPassword, newPassword and confirmPassword are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const currentHash = hashPassword(currentPassword, user.passwordSalt);
    if (currentHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { salt, passwordHash } = createPasswordRecord(newPassword);
    user.passwordSalt = salt;
    user.passwordHash = passwordHash;
    await user.save({ validateBeforeSave: false });

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change-password error:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/users/change-email (authenticated)
router.post('/change-email', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { newEmail, currentPassword } = req.body || {};
    if (!newEmail || !currentPassword) {
      return res.status(400).json({ error: 'newEmail and currentPassword are required' });
    }
    const email = String(newEmail).toLowerCase().trim();
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const currentHash = hashPassword(currentPassword, user.passwordSalt);
    if (currentHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Ensure email is unique (exclude self)
    const exists = await User.findOne({ _id: { $ne: userId }, email });
    if (exists) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    user.email = email;
    await user.save({ validateBeforeSave: false });

    return res.json({ message: 'Email updated successfully', user: publicUser(user) });
  } catch (err) {
    console.error('Change-email error:', err);
    return res.status(500).json({ error: 'Failed to change email' });
  }
});

// PATCH /api/users/voice-preference (authenticated)
router.patch('/voice-preference', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { selectedVoiceId } = req.body || {};
    if (!selectedVoiceId) {
      return res.status(400).json({ error: 'selectedVoiceId is required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.selectedVoiceId = selectedVoiceId;
    await user.save({ validateBeforeSave: false });

    return res.json({ message: 'Voice preference updated successfully', selectedVoiceId: user.selectedVoiceId });
  } catch (err) {
    console.error('Voice-preference error:', err);
    return res.status(500).json({ error: 'Failed to update voice preference' });
  }
});

export default router;


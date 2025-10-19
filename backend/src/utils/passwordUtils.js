const crypto = require('crypto');

/**
 * Password hashing and verification utilities
 */

/**
 * Derive a password hash using PBKDF2
 * @param {string} password - Plain text password
 * @param {Buffer|string} salt - Salt (Buffer or hex string)
 * @param {number} iterations - Number of iterations (default: 120000)
 * @returns {Promise<string>} - Hex-encoded hash
 */
function deriveHash(password, salt, iterations = 120000) {
  return new Promise((resolve, reject) => {
    const saltBuffer = Buffer.isBuffer(salt) ? salt : Buffer.from(salt, 'hex');
    crypto.pbkdf2(password, saltBuffer, iterations, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
}

/**
 * Hash a password with a random salt
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - Object with salt and hash
 */
async function hashPassword(password) {
  const salt = crypto.randomBytes(32);
  const hash = await deriveHash(password, salt, 120000);
  return {
    salt: salt.toString('hex'),
    hash,
  };
}

/**
 * Verify a password against stored hash and salt
 * Supports multiple legacy formats for backward compatibility
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Stored hash from database
 * @param {string} storedSalt - Stored salt from database
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, storedHash, storedSalt) {
  // Try current format: 120k iterations, salt as hex string
  try {
    const hash1 = await deriveHash(password, storedSalt, 120000);
    if (hash1 === storedHash) return true;
  } catch (e) {
    console.error('Error verifying with current format:', e);
  }

  // Try legacy format 1: 100k iterations, salt as hex string
  try {
    const hash2 = await deriveHash(password, storedSalt, 100000);
    if (hash2 === storedHash) return true;
  } catch (e) {
    console.error('Error verifying with legacy format 1:', e);
  }

  // Try legacy format 2: 120k iterations, salt as Buffer
  try {
    const saltBuffer = Buffer.from(storedSalt, 'hex');
    const hash3 = await deriveHash(password, saltBuffer, 120000);
    if (hash3 === storedHash) return true;
  } catch (e) {
    console.error('Error verifying with legacy format 2:', e);
  }

  // Try legacy format 3: 100k iterations, salt as Buffer
  try {
    const saltBuffer = Buffer.from(storedSalt, 'hex');
    const hash4 = await deriveHash(password, saltBuffer, 100000);
    if (hash4 === storedHash) return true;
  } catch (e) {
    console.error('Error verifying with legacy format 3:', e);
  }

  return false;
}

/**
 * Generate a random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Hex-encoded token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage
 * @param {string} token - Plain token
 * @returns {string} - SHA-256 hash of token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  hashToken,
  deriveHash,
};


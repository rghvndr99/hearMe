import User from '../models/User.js';

/**
 * Admin authentication middleware
 * Requires user to be authenticated AND have isAdmin: true
 * Use this after the regular auth middleware
 */
export default async function adminAuth(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('isAdmin').lean();
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // User is admin, proceed
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}


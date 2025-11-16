import express from 'express';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/admin/subscriptions/pending - Get all pending verification subscriptions
router.get('/subscriptions/pending', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await Subscription.find({ status: 'pending_verification' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Populate user details
    const subsWithUsers = await Promise.all(
      subscriptions.map(async (sub) => {
        const user = await User.findById(sub.userId).select('name email username phone').lean();
        return {
          ...sub,
          user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone
          } : null
        };
      })
    );

    const total = await Subscription.countDocuments({ status: 'pending_verification' });

    res.json({
      subscriptions: subsWithUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get pending subscriptions error:', err);
    res.status(500).json({ error: 'Failed to fetch pending subscriptions' });
  }
});

// POST /api/admin/subscriptions/approve - Approve subscriptions in bulk
router.post('/subscriptions/approve', auth, adminAuth, async (req, res) => {
  try {
    const { subscriptionIds } = req.body;
    const adminId = req.user?.sub || req.user?.id;

    if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
      return res.status(400).json({ error: 'subscriptionIds array is required' });
    }

    const now = new Date();
    const result = await Subscription.updateMany(
      {
        _id: { $in: subscriptionIds },
        status: 'pending_verification'
      },
      {
        $set: {
          status: 'active',
          verifiedAt: now,
          verifiedBy: adminId,
          activatedAt: now
        }
      }
    );

    res.json({
      success: true,
      approved: result.modifiedCount,
      message: `${result.modifiedCount} subscription(s) approved successfully`
    });
  } catch (err) {
    console.error('Approve subscriptions error:', err);
    res.status(500).json({ error: 'Failed to approve subscriptions' });
  }
});

// POST /api/admin/subscriptions/:id/reject - Reject a subscription
router.post('/subscriptions/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.sub || req.user?.id;

    const sub = await Subscription.findById(id);
    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (sub.status !== 'pending_verification') {
      return res.status(400).json({ error: 'Only pending subscriptions can be rejected' });
    }

    sub.status = 'failed';
    sub.verifiedAt = new Date();
    sub.verifiedBy = adminId;
    sub.metadata = {
      ...sub.metadata,
      rejectionReason: reason || 'Payment verification failed',
      rejectedAt: new Date()
    };

    await sub.save();

    res.json({
      success: true,
      message: 'Subscription rejected'
    });
  } catch (err) {
    console.error('Reject subscription error:', err);
    res.status(500).json({ error: 'Failed to reject subscription' });
  }
});

// GET /api/admin/stats - Get admin dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [pendingCount, activeCount, totalRevenue] = await Promise.all([
      Subscription.countDocuments({ status: 'pending_verification' }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    res.json({
      pendingVerifications: pendingCount,
      activeSubscriptions: activeCount,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;


import express from 'express';
import crypto from 'crypto';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import WalletPack from '../models/WalletPack.js';
import Order from '../models/Order.js';

const router = express.Router();

function userSelectorFromJwt(userJwt) {
  const user_id = userJwt?.user_id;
  const mongoId = userJwt?.id || userJwt?.sub;
  if (user_id) return { user_id };
  if (mongoId) return { _id: mongoId };
  return null;
}

// POST /api/wallet/topup
// body: { pack_id }
router.post('/wallet/topup', auth, async (req, res) => {
  try {
    const userJwt = req.user; // { id, ... }
    const userSel = userSelectorFromJwt(userJwt);
    if (!userSel) return res.status(401).json({ error: 'Unauthenticated' });

    const { pack_id } = req.body || {};
    if (!pack_id) return res.status(400).json({ error: 'pack_id required' });

    const pack = await WalletPack.findOne({ pack_id }).lean();
    if (!pack) return res.status(400).json({ error: 'invalid pack' });

    // Create an order with payment gateway (placeholder local token)
    const orderId = 'ord_' + Date.now();

    await Order.create({
      order_id: orderId,
      user_id: userSel.user_id || String(userSel._id || ''),
      pack_id,
      amount: pack.price,
      currency: pack.currency || 'INR',
      status: 'created',
      gateway: 'razorpay',
      metadata: { credits_minutes: pack.credits_minutes },
    });

    res.json({ order_token: orderId, amount: pack.price, currency: pack.currency || 'INR' });
  } catch (err) {
    console.error('POST /api/wallet/topup error', err);
    res.status(500).json({ error: 'Failed to create topup order' });
  }
});

// GET /api/wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const userJwt = req.user;
    const userSel = userSelectorFromJwt(userJwt);
    if (!userSel) return res.status(401).json({ error: 'Unauthenticated' });

    const user = await User.findOne(userSel, { wallet: 1, _id: 0 }).lean();
    res.json({ balance_minutes: user?.wallet?.balance_minutes || 0, transactions: user?.wallet?.transactions?.slice(-25) || [] });
  } catch (err) {
    console.error('GET /api/wallet error', err);
    res.status(500).json({ error: 'Failed to load wallet' });
  }
});

// POST /api/webhook/payment
// Expected headers: x-gateway-signature: HMAC_SHA256(body, PAYMENT_WEBHOOK_SECRET)
router.post('/webhook/payment', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'test_secret';
    const signature = req.headers['x-gateway-signature'];
    const bodyStr = JSON.stringify(req.body || {});
    const computed = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
    if (!signature || signature !== computed) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { order_id, status } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'order_id required' });

    const order = await Order.findOne({ order_id });
    if (!order) return res.status(404).json({ error: 'order not found' });

    if (status === 'paid' && order.status !== 'paid') {
      const pack = await WalletPack.findOne({ pack_id: order.pack_id }).lean();
      const minutes = pack?.credits_minutes || order?.metadata?.credits_minutes || 0;
      const txn_id = 'txn_' + Date.now();

      // Atomically credit minutes and append transaction
      const userSel = order.user_id && order.user_id.startsWith('usr_')
        ? { user_id: order.user_id }
        : { _id: order.user_id };

      await User.updateOne(
        userSel,
        {
          $inc: { 'wallet.balance_minutes': minutes },
          $push: {
            'wallet.transactions': {
              txn_id,
              type: 'credit',
              minutes,
              amount: order.amount,
              currency: order.currency || 'INR',
              source: 'wallet_topup',
              pack_id: order.pack_id,
              note: 'Top-up credited',
              at: new Date(),
            },
          },
        }
      );

      order.status = 'paid';
      order.txn_id = txn_id;
      await order.save();
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/webhook/payment error', err);
    res.status(500).json({ error: 'webhook processing failed' });
  }
});

export default router;


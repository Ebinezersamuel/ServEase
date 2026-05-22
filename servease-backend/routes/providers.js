const express = require('express');
const auth = require('../middleware/auth');
const Provider = require('../models/Provider');
const Payment = require('../models/Payment');
const router = express.Router();

// Get all providers
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find().populate('userId', 'firstName lastName');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get provider by ID (using provider's own _id)
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('userId');
    if (!provider) return res.status(404).json({ message: 'Not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get own provider profile
router.get('/me/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') return res.status(403).json({ message: 'Access denied' });
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Profile not completed' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/update provider profile
router.post('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') return res.status(403).json({ message: 'Access denied' });
    let provider = await Provider.findOne({ userId: req.user.id });
    if (provider) {
      Object.assign(provider, req.body);
      await provider.save();
    } else {
      provider = new Provider({ userId: req.user.id, ...req.body });
      await provider.save();
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/providers/:id – update provider by ID (used by account page)
router.put('/:id', auth, async (req, res) => {
  try {
    // Only provider can update their own profile
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    if (provider.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    Object.assign(provider, req.body);
    await provider.save();
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/providers/:id/wallet – get wallet balance and transactions
router.get('/:id/wallet', auth, async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    if (provider.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Sum of all successful payments for this provider
    const payments = await Payment.aggregate([
      { $match: { providerId: provider._id, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarnings = payments[0]?.total || 0;

    // You can extend this with more advanced logic (withdrawals, pending payouts)
    // For now return demo data plus real earnings
    const balance = totalEarnings; // simplified: all earnings are balance
    const transactions = await Payment.find({ providerId: provider._id, status: 'success' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      balance: balance,
      totalEarnings: totalEarnings,
      monthEarnings: 1250, // optional – can be calculated from last 30 days
      pendingPayout: 0,
      withdrawn: 0,
      transactions: transactions.map(t => ({
        date: t.createdAt.toISOString().split('T')[0],
        description: `Booking ${t.bookingId}`,
        amount: t.amount,
        status: 'Completed'
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
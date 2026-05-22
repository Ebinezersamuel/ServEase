const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ userId: req.user.id });
    const completedTasks = await Booking.countDocuments({ userId: req.user.id, status: 'completed' });
    res.json({ totalBookings, completedTasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/provider', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') return res.status(403).json({ message: 'Access denied' });
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Profile not found' });

    const totalOrders = await Booking.countDocuments({ providerId: provider._id });
    const pendingOrders = await Booking.countDocuments({ providerId: provider._id, status: { $in: ['pending','confirmed'] } });
    const completedOrders = await Booking.countDocuments({ providerId: provider._id, status: 'completed' });
    const earningsAgg = await Booking.aggregate([
      { $match: { providerId: provider._id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const earnings = earningsAgg[0]?.total || 0;

    res.json({
      provider,
      totalOrders,
      pendingOrders,
      completedOrders,
      earnings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
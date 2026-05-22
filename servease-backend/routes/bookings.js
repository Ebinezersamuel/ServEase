const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const router = express.Router();

// Get single booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('providerId')
      .populate('serviceId')
      .populate('userId');
    if (!booking) return res.status(404).json({ message: 'Not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const booking = new Booking({ userId: req.user.id, ...req.body });
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('providerId', 'businessName hourlyRate')
      .populate('serviceId', 'name basePrice')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Provider bookings
router.get('/provider-bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') return res.status(403).json({ message: 'Access denied' });
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    const bookings = await Booking.find({ providerId: provider._id })
      .populate('userId', 'firstName lastName email')
      .populate('serviceId', 'name basePrice')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booking status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    booking.status = status;
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
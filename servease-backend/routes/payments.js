const express = require('express');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const transactionId = 'TXN_' + Date.now() + Math.floor(Math.random() * 10000);
    const payment = new Payment({
      bookingId, userId: req.user.id, providerId: booking.providerId,
      amount, paymentMethod, transactionId, status: 'success'
    });
    await payment.save();
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
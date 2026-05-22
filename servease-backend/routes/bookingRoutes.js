const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getProviderBookings, getBookingById, updateBookingStatus, cancelBooking } = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getUserBookings);
router.get('/provider-bookings', auth, getProviderBookings);
router.get('/:id', auth, getBookingById);
router.put('/:id/status', auth, updateBookingStatus);
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;

const express = require("express");
const auth = require("../middleware/auth");
const createRateLimiter = require("../middleware/rateLimit");
const {
  getProfile,
  getActiveBookings,
  getBookingHistory,
  getStats,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
} = require("../controllers/dashboardController");

const router = express.Router();

router.use(auth);
router.use(createRateLimiter({ windowMs: 60_000, max: 120 }));

router.get("/profile", getProfile);
router.get("/bookings/active", getActiveBookings);
router.get("/bookings/history", getBookingHistory);
router.get("/stats", getStats);
router.get("/bookings/:bookingId", getBookingById);
router.patch("/bookings/:bookingId/cancel", cancelBooking);
router.patch("/bookings/:bookingId/reschedule", rescheduleBooking);

module.exports = router;

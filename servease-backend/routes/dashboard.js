const express = require("express");
const { rateLimit } = require("express-rate-limit");
const auth = require("../middleware/auth");
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

const dashboardRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.use(dashboardRateLimiter);
router.use(auth);

router.get("/profile", getProfile);
router.get("/bookings/active", getActiveBookings);
router.get("/bookings/history", getBookingHistory);
router.get("/stats", getStats);
router.get("/bookings/:bookingId", getBookingById);
router.patch("/bookings/:bookingId/cancel", cancelBooking);
router.patch("/bookings/:bookingId/reschedule", rescheduleBooking);

module.exports = router;

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateToken } = require("../middleware/auth");

// Protected routes
router.post("/", authenticateToken, bookingController.createBooking);
router.get("/user", authenticateToken, bookingController.getUserBookings);
router.get("/provider", authenticateToken, bookingController.getProviderTasks);
router.get("/:bookingId", authenticateToken, bookingController.getBookingDetails);
router.put("/:bookingId/status", authenticateToken, bookingController.updateBookingStatus);
router.put("/:bookingId/cancel", authenticateToken, bookingController.cancelBooking);
router.post("/:bookingId/rate", authenticateToken, bookingController.rateBooking);

module.exports = router;

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getDashboardData,
  getBookingHistory,
  getTaskDetails,
  getActiveChores,
  getCompletedServices,
  cancelTask,
} = require("../controllers/dashboardController");

// All dashboard routes require authentication
router.use(auth);

// Dashboard overview
router.get("/", getDashboardData);

// Booking history with filters
router.get("/bookings", getBookingHistory);

// Active chores (pending + in-progress)
router.get("/chores", getActiveChores);

// Completed services
router.get("/services", getCompletedServices);

// Task details
router.get("/task/:id", getTaskDetails);

// Cancel task
router.post("/task/:id/cancel", cancelTask);

module.exports = router;

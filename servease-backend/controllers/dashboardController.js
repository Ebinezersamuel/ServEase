const User = require("../models/User");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const ACTIVE_STATUSES = ["pending", "in-progress"];

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ profile: user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const activeBookings = await Booking.find({
      user: req.user.id,
      status: { $in: ACTIVE_STATUSES },
    })
      .sort({ scheduledAt: 1, createdAt: -1 })
      .lean();

    return res.json({ bookings: activeBookings });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active bookings", error: error.message });
  }
};

exports.getBookingHistory = async (req, res) => {
  try {
    const history = await Booking.find({
      user: req.user.id,
      status: "completed",
    })
      .sort({ completedAt: -1, createdAt: -1 })
      .lean();

    return res.json({ bookings: history });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch booking history", error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const [totalBookings, activeBookings, completedBookings, spentAgg, ratingAgg] =
      await Promise.all([
        Booking.countDocuments({ user: userId }),
        Booking.countDocuments({ user: userId, status: { $in: ACTIVE_STATUSES } }),
        Booking.countDocuments({ user: userId, status: "completed" }),
        Booking.aggregate([
          { $match: { user: objectUserId, status: "completed" } },
          { $group: { _id: null, totalSpent: { $sum: "$price" } } },
        ]),
        Booking.aggregate([
          { $match: { user: objectUserId, status: "completed", rating: { $gt: 0 } } },
          { $group: { _id: null, averageRating: { $avg: "$rating" } } },
        ]),
      ]);

    return res.json({
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent: spentAgg[0]?.totalSpent || 0,
        rating: Number((ratingAgg[0]?.averageRating || 0).toFixed(1)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user: req.user.id,
    }).lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({ booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch booking details", error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, user: req.user.id, status: { $in: ACTIVE_STATUSES } },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Active booking not found" });
    }

    return res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

exports.rescheduleBooking = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const { scheduledAt } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required" });
    }
    const parsedDate = new Date(scheduledAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Valid scheduledAt date is required" });
    }
    if (parsedDate.getTime() < Date.now()) {
      return res.status(400).json({ message: "scheduledAt cannot be in the past" });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, user: req.user.id, status: { $in: ACTIVE_STATUSES } },
      { $set: { scheduledAt: parsedDate } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Active booking not found" });
    }

    return res.json({ message: "Booking rescheduled", booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reschedule booking", error: error.message });
  }
};

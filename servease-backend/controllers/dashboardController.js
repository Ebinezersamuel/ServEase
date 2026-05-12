const Booking = require("../models/Booking");

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getBookingQueryForUser = (req) => {
  if (req.user.userType === "provider") {
    return { providerId: req.user.id };
  }
  return { customerId: req.user.id };
};

exports.getDashboardData = async (req, res) => {
  try {
    const baseQuery = getBookingQueryForUser(req);
    const activeStatuses = ["pending", "accepted", "in-progress"];

    const [allBookings, activeTasks, upcomingBookings] = await Promise.all([
      Booking.find(baseQuery).sort({ createdAt: -1 }).limit(50),
      Booking.find({ ...baseQuery, status: { $in: activeStatuses } })
        .sort({ scheduledTime: 1 })
        .limit(20),
      Booking.find({
        ...baseQuery,
        scheduledTime: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
        .sort({ scheduledTime: 1 })
        .limit(20),
    ]);

    const completed = allBookings.filter((booking) => booking.status === "completed");
    const totalSpent = allBookings.reduce(
      (sum, booking) => sum + (booking.price?.totalAmount || 0),
      0
    );

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        userType: req.user.userType,
      },
      stats: {
        totalBookings: allBookings.length,
        completedBookings: completed.length,
        activeBookings: activeTasks.length,
        totalSpent,
      },
      activeTasks,
      upcomingBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard data", error: error.message });
  }
};

exports.getBookingHistory = async (req, res) => {
  try {
    const { status, limit = 10, skip = 0 } = req.query;
    const query = getBookingQueryForUser(req);

    if (status) {
      query.status = status;
    }

    const parsedLimit = parseInteger(limit, 10);
    const parsedSkip = parseInteger(skip, 0);

    const [tasks, total] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).limit(parsedLimit).skip(parsedSkip),
      Booking.countDocuments(query),
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        limit: parsedLimit,
        skip: parsedSkip,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load booking history", error: error.message });
  }
};

exports.getTaskDetails = async (req, res) => {
  try {
    const task = await Booking.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const allowedUser =
      task.customerId.toString() === req.user.id || task.providerId.toString() === req.user.id;

    if (!allowedUser) {
      return res.status(403).json({ message: "Not authorized to view this task" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to load task details", error: error.message });
  }
};

exports.getActiveChores = async (req, res) => {
  try {
    const chores = await Booking.find({
      ...getBookingQueryForUser(req),
      status: { $in: ["pending", "accepted", "in-progress"] },
    }).sort({ scheduledTime: 1 });

    res.json({
      chores,
      count: chores.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load active chores", error: error.message });
  }
};

exports.getCompletedServices = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const query = {
      ...getBookingQueryForUser(req),
      status: "completed",
    };

    const parsedLimit = parseInteger(limit, 10);
    const parsedSkip = parseInteger(skip, 0);

    const [services, total] = await Promise.all([
      Booking.find(query).sort({ completedTime: -1, updatedAt: -1 }).limit(parsedLimit).skip(parsedSkip),
      Booking.countDocuments(query),
    ]);

    res.json({
      services,
      pagination: {
        total,
        limit: parsedLimit,
        skip: parsedSkip,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load completed services", error: error.message });
  }
};

exports.cancelTask = async (req, res) => {
  try {
    const { reason } = req.body;
    const task = await Booking.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const allowedUser =
      task.customerId.toString() === req.user.id || task.providerId.toString() === req.user.id;

    if (!allowedUser) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "accepted"].includes(task.status)) {
      return res.status(400).json({ message: "Can only cancel pending or accepted tasks" });
    }

    task.status = "cancelled";
    task.cancellationReason = reason;
    task.updatedAt = Date.now();
    await task.save();

    res.json({
      message: "Task cancelled successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel task", error: error.message });
  }
};

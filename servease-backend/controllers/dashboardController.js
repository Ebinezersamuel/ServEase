const User = require("../models/User");
const Task = require("../models/Task");

const getRequestUserId = (req) => req.user?.id || req.userId;

// Get user dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get active tasks (pending, assigned, in-progress)
    const activeTasks = await Task.find({
      customerId: userId,
      status: { $in: ["open", "accepted", "in-progress", "pending", "assigned"] },
    })
      .populate("providerId", "firstName lastName avatar rating")
      .sort({ createdAt: -1 });

    // Get statistics
    const allTasks = await Task.find({ customerId: userId });
    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const totalSpent = allTasks.reduce(
      (sum, t) => sum + (t.finalPrice || t.budget || t.price?.totalAmount || 0),
      0
    );

    // Get upcoming bookings (next 7 days)
    const upcomingBookings = await Task.find({
      customerId: userId,
      scheduledDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
      .populate("providerId", "firstName lastName avatar rating")
      .sort({ scheduledTime: 1 });

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
      },
      stats: {
        totalBookings: allTasks.length,
        completedBookings: completedTasks.length,
        activeBookings: activeTasks.length,
        totalSpent: totalSpent.toFixed(2),
        averageRating: Number(user.rating || 0).toFixed(1),
      },
      activeTasks,
      upcomingBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's booking history
exports.getBookingHistory = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const { status, limit = 10, skip = 0 } = req.query;

    const query = { customerId: userId };
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate("providerId", "firstName lastName avatar rating phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific task details
exports.getTaskDetails = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const task = await Task.findById(req.params.id)
      .populate("customerId", "firstName lastName name phone address")
      .populate("providerId", "firstName lastName phone avatar rating");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check authorization
    if (
      task.customerId?.toString() !== userId &&
      task.providerId?.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this task" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active chores (pending + in-progress)
exports.getActiveChores = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const chores = await Task.find({
      customerId: userId,
      status: { $in: ["open", "accepted", "in-progress", "pending", "assigned"] },
    })
      .populate("providerId", "firstName lastName avatar rating")
      .sort({ scheduledTime: 1 });

    res.json({
      chores,
      count: chores.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get completed services
exports.getCompletedServices = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const { limit = 10, skip = 0 } = req.query;

    const services = await Task.find({
      customerId: userId,
      status: "completed",
    })
      .populate("providerId", "firstName lastName avatar rating")
      .sort({ completionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Task.countDocuments({
      customerId: userId,
      status: "completed",
    });

    res.json({
      services,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel task
exports.cancelTask = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const { reason } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.customerId?.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "assigned"].includes(task.status)) {
      return res
        .status(400)
        .json({
          message: "Can only cancel pending or assigned tasks",
        });
    }

    task.status = "cancelled";
    task.cancelledAt = new Date();
    task.cancelReason = reason;
    await task.save();

    res.json({
      message: "Task cancelled successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

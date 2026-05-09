const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, category, budget, scheduledDate, location } = req.body;

    if (!title || !description || !category || !budget || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const task = await Task.create({
      title,
      description,
      category,
      budget,
      scheduledDate,
      location,
      customerId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getTasks = async (req, res, next) => {
  try {
    const { status, category, city } = req.query;

    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');

    const tasks = await Task.find(query)
      .populate('customerId', 'name email phone rating')
      .populate('providerId', 'name email phone rating');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('customerId', 'name email phone rating')
      .populate('providerId', 'name email phone rating');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's tasks
// @route   GET /api/tasks/user/mytasks
// @access  Private
exports.getUserTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      $or: [
        { customerId: req.user.id },
        { providerId: req.user.id }
      ]
    })
      .populate('customerId', 'name email phone rating')
      .populate('providerId', 'name email phone rating');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user is task owner or provider
    if (task.customerId.toString() !== req.user.id && task.providerId?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a task (Provider action)
// @route   PUT /api/tasks/:id/accept
// @access  Private
exports.acceptTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Task is not available for acceptance'
      });
    }

    task.providerId = req.user.id;
    task.status = 'accepted';
    task.updatedAt = Date.now();

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task accepted successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a task
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.providerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned provider can complete this task'
      });
    }

    task.status = 'completed';
    task.completionDate = Date.now();
    task.finalPrice = req.body.finalPrice || task.budget;
    task.updatedAt = Date.now();

    await task.save();

    // Update provider's totalBookings
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalBookings: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Task completed successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel task
// @route   PUT /api/tasks/:id/cancel
// @access  Private
exports.cancelTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only task owner can cancel'
      });
    }

    task.status = 'cancelled';
    task.updatedAt = Date.now();

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task cancelled successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

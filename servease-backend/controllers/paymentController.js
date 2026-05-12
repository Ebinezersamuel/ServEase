const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Booking = require('../models/Booking');

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const { taskId, bookingId, amount, paymentMethod } = req.body;

    if ((!taskId && !bookingId) || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    let providerId;
    let payerAllowed = false;
    let resolvedAmount = amount;

    if (taskId) {
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      providerId = task.providerId;
      payerAllowed = task.customerId.toString() === req.user.id;
      resolvedAmount = resolvedAmount || task.finalPrice || task.budget;
    } else {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      providerId = booking.providerId;
      payerAllowed = booking.customerId.toString() === req.user.id;
      resolvedAmount = resolvedAmount || booking.price?.totalAmount;
    }

    if (!payerAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Only booking/task owner can create payment'
      });
    }

    if (!resolvedAmount || Number(resolvedAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    const commission = Number(resolvedAmount) * 0.1;
    const providerEarnings = Number(resolvedAmount) - commission;

    const payment = await Payment.create({
      taskId,
      bookingId,
      customerId: req.user.id,
      providerId,
      amount: Number(resolvedAmount),
      paymentMethod,
      commission,
      providerEarnings,
      transactionId: `TXN-${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin only)
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('taskId', 'title')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payments
// @route   GET /api/payments/user/mypayments
// @access  Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      $or: [
        { customerId: req.user.id },
        { providerId: req.user.id }
      ]
    })
      .populate('taskId', 'title')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('taskId')
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private (Admin only)
exports.updatePayment = async (req, res, next) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, completedAt: status === 'completed' ? Date.now() : null },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment (simulate payment gateway)
// @route   POST /api/payments/:id/process
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Simulate payment processing
    // In real app, integrate with Stripe, PayPal, etc.
    payment.status = 'completed';
    payment.completedAt = Date.now();
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats/analytics
// @access  Private
exports.getPaymentStats = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCommission: { $sum: '$commission' },
          totalProviderEarnings: { $sum: '$providerEarnings' },
          totalTransactions: { $sum: 1 },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        totalProviderEarnings: 0,
        totalTransactions: 0,
        completedTransactions: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

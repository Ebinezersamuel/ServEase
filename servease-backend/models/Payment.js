const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'wallet', 'bank_transfer', 'card', 'upi', 'cash'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    default: ''
  },
  commission: {
    type: Number,
    default: 0
  },
  providerEarnings: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('validate', function(next) {
  const hasTask = Boolean(this.taskId);
  const hasBooking = Boolean(this.bookingId);

  if ((hasTask && hasBooking) || (!hasTask && !hasBooking)) {
    this.invalidate('taskId', 'Provide exactly one of taskId or bookingId');
    this.invalidate('bookingId', 'Provide exactly one of taskId or bookingId');
  }

  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

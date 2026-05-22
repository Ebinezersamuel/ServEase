const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  scheduledTime: Date,
  location: { address: String },
  notes: String,
  status: { type: String, enum: ['pending','confirmed','in_progress','completed','cancelled'], default: 'pending' },
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
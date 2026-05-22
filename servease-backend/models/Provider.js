const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: String,
  category: String,
  experience: String,
  skills: [String],
  languages: [String],
  hourlyRate: Number,
  bio: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifsc: String
  },
  location: { address: String },
  avatar: String,
  verificationStatus: { type: String, default: 'pending' },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Provider', ProviderSchema);
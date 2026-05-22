const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  basePrice: Number,
  icon: String,
  badge: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Service', ServiceSchema);
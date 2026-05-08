const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  service: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "assigned", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  payment: {
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    method: {
      type: String,
      default: "card",
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  completedAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancelReason: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: null,
  },
  review: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", taskSchema);
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceName: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    scheduledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    price: { type: Number, min: 0, default: 0 },
    providerName: { type: String, default: "", trim: true },
    providerContact: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

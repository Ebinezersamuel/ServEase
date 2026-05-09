const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    service: {
      type: String, // service name for quick access
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    completedTime: {
      type: Date,
      default: null,
    },
    location: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      latitude: Number,
      longitude: Number,
    },
    description: String,
    notes: String,
    price: {
      servicePrice: Number,
      platformFee: Number,
      tax: Number,
      totalAmount: Number,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "wallet", "cash", "upi"],
      default: "card",
    },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
    cancellationReason: String,
    cancellationPolicy: {
      canCancelUpto: Number, // hours before scheduled time
      cancellationCharge: Number, // percentage
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);

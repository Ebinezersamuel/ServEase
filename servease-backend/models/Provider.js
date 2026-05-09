const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    specializations: [String],
    yearsExperience: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalCompletedJobs: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        type: String, // URLs to verification documents
      },
    ],
    availability: {
      monday: { start: "09:00", end: "18:00", available: true },
      tuesday: { start: "09:00", end: "18:00", available: true },
      wednesday: { start: "09:00", end: "18:00", available: true },
      thursday: { start: "09:00", end: "18:00", available: true },
      friday: { start: "09:00", end: "18:00", available: true },
      saturday: { start: "10:00", end: "16:00", available: true },
      sunday: { start: "00:00", end: "00:00", available: false },
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      serviceRadius: {
        type: Number,
        default: 10, // km
      },
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
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

module.exports = mongoose.model("Provider", ProviderSchema);

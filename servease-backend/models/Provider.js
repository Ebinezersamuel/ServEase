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
      monday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
        available: { type: Boolean, default: true },
      },
      tuesday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
        available: { type: Boolean, default: true },
      },
      wednesday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
        available: { type: Boolean, default: true },
      },
      thursday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
        available: { type: Boolean, default: true },
      },
      friday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
        available: { type: Boolean, default: true },
      },
      saturday: {
        start: { type: String, default: "10:00" },
        end: { type: String, default: "16:00" },
        available: { type: Boolean, default: true },
      },
      sunday: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
        available: { type: Boolean, default: false },
      },
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

const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Cleaning",
        "Plumbing",
        "Electrical",
        "Appliances",
        "Carpentry",
        "Painting",
        "AC Repair",
        "Pest Control",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // emoji or icon URL
      default: "🔧",
    },
    basePrice: {
      type: Number,
      required: true,
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);

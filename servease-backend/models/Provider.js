const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: { type: String, required: true },
    service: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    price: { type: String, default: "₹0" },
    priceValue: { type: Number, default: 0 },
    address: { type: String, default: "" },
    available: { type: Boolean, default: true },
    distance: { type: Number, default: 0 },
    premium: { type: Boolean, default: false },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", providerSchema);
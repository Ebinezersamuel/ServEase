const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    desc: { type: String, default: "" },
    basePrice: { type: Number, default: 0 },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
const express = require("express");
const Service = require("../models/Service");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services", error: err.message });
  }
});

module.exports = router;
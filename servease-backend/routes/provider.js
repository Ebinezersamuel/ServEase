const express = require("express");
const Provider = require("../models/Provider");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/providers (public)
router.get("/", async (req, res) => {
  try {
    const { service, q, priceBand, sort, available } = req.query;
    const filter = {};

    if (service && service !== "all") filter.service = service;

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { service: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } }
      ];
    }

    if (priceBand && priceBand !== "all") {
      if (priceBand === "budget") filter.priceValue = { $lte: 500 };
      else if (priceBand === "mid") filter.priceValue = { $gt: 500, $lte: 1000 };
      else filter.priceValue = { $gt: 1000 };
    }

    if (available === "true") filter.available = true;
    if (available === "false") filter.available = false;

    let query = Provider.find(filter);

    if (sort === "nearest") query = query.sort({ distance: 1 });
    else if (sort === "rating") query = query.sort({ rating: -1 });
    else if (sort === "price") query = query.sort({ priceValue: 1 });
    else query = query.sort({ createdAt: -1 });

    const providers = await query.limit(100);
    return res.json({ providers });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch providers", error: err.message });
  }
});

// GET /api/providers/me (provider only)
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can access this" });
    }

    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider) return res.status(404).json({ message: "Provider profile not found" });

    return res.json({ provider });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});

// PUT /api/providers/me (provider only)
router.put("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can update this" });
    }

    const allowedFields = [
      "name",
      "service",
      "price",
      "priceValue",
      "address",
      "available",
      "distance",
      "premium",
      "image"
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const provider = await Provider.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!provider) return res.status(404).json({ message: "Provider profile not found" });

    return res.json({ message: "Profile updated", provider });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

module.exports = router;
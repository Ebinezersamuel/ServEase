const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

// Public routes
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.get("/category/:category", serviceController.getServicesByCategory);

// Admin routes (can add auth middleware later)
router.post("/", serviceController.createService);

module.exports = router;

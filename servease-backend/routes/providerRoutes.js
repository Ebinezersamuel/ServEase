const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const { authenticateToken } = require("../middleware/auth");

// Public routes
router.get("/", providerController.getAllProviders);
router.get("/:id", providerController.getProviderById);

// Protected routes
router.post("/register", authenticateToken, providerController.registerProvider);
router.put("/profile", authenticateToken, providerController.updateProviderProfile);
router.get("/tasks/list", authenticateToken, providerController.getProviderTasks);

module.exports = router;

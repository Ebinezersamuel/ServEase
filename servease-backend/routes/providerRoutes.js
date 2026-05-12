const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const { authenticateToken } = require("../middleware/auth");

router.use(authenticateToken);

router.get("/", providerController.getAllProviders);
router.get("/tasks/list", providerController.getProviderTasks);
router.post("/register", providerController.registerProvider);
router.put("/profile", providerController.updateProviderProfile);
router.get("/:id", providerController.getProviderById);

module.exports = router;

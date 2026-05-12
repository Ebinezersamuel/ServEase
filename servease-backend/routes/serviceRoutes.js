const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/", serviceController.getAllServices);
router.get("/category/:category", serviceController.getServicesByCategory);
router.get("/:id", serviceController.getServiceById);

router.post("/", serviceController.createService);

module.exports = router;

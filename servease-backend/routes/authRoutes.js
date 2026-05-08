const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
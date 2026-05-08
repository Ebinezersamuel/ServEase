const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Provider = require("../models/Provider");
// token helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === "provider" ? "provider" : "customer",
    });
    let providerProfile = null;
    if (user.role === "provider") {
      providerProfile = await Provider.create({
        user: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        service: "General Service",
        rating: 4.5,
        reviews: 0,
        price: "₹0",
        priceValue: 0,
        address: "",
        available: true,
        distance: 0,
        premium: false,
        image: "",
      });
    }
    const token = generateToken(user);
    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      provider: providerProfile,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    let providerProfile = null;
    if (user.role === "provider") {
      providerProfile = await Provider.findOne({ user: user._id });
      if (!providerProfile) {
        providerProfile = await Provider.create({
          user: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          service: "General Service",
          rating: 4.5,
          reviews: 0,
          price: "₹0",
          priceValue: 0,
          address: "",
          available: true,
          distance: 0,
          premium: false,
          image: "",
        });
      }
    }
    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      provider: providerProfile,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
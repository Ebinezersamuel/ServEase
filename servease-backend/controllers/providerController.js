const Provider = require("../models/Provider");
const User = require("../models/User");
const Booking = require("../models/Booking");

// Register as Provider
exports.registerProvider = async (req, res) => {
  try {
    const {
      businessName,
      services,
      specializations,
      yearsExperience,
      hourlyRate,
      availability,
      location,
    } = req.body;

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ userId: req.user.id });
    if (existingProvider) {
      return res.status(400).json({ message: "Provider account already exists" });
    }

    const newProvider = new Provider({
      userId: req.user.id,
      businessName,
      services,
      specializations,
      yearsExperience,
      hourlyRate,
      availability,
      location,
    });

    await newProvider.save();

    // Update user role
    await User.findByIdAndUpdate(req.user.id, { role: "provider" });

    res.status(201).json({
      message: "Provider registered successfully",
      provider: newProvider,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// Get all providers
exports.getAllProviders = async (req, res) => {
  try {
    const { category, rating, verified } = req.query;

    let query = { isVerified: true };

    if (category) {
      query.services = { $in: [category] };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const providers = await Provider.find(query)
      .populate("userId", "firstName lastName phone email")
      .populate("services");

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching providers", error: error.message });
  }
};

// Get provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("userId", "firstName lastName phone email")
      .populate("services");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Get provider stats
    const completedBookings = await Booking.countDocuments({
      providerId: req.params.id,
      status: "completed",
    });

    res.json({
      ...provider.toObject(),
      totalCompletedJobs: completedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching provider", error: error.message });
  }
};

// Update provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const {
      businessName,
      services,
      specializations,
      yearsExperience,
      hourlyRate,
      availability,
      location,
    } = req.body;

    const provider = await Provider.findOneAndUpdate(
      { userId: req.user.id },
      {
        businessName,
        services,
        specializations,
        yearsExperience,
        hourlyRate,
        availability,
        location,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json({ message: "Profile updated successfully", provider });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// Get provider's tasks
exports.getProviderTasks = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const tasks = await Booking.find({ providerId: provider._id })
      .populate("customerId", "firstName lastName email phone")
      .populate("serviceId")
      .sort({ scheduledTime: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

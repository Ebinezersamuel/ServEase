const Service = require("../models/Service");

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(query);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service", error: error.message });
  }
};

// Create service (Admin only)
exports.createService = async (req, res) => {
  try {
    const { name, category, description, icon, basePrice, estimatedDuration } =
      req.body;

    const newService = new Service({
      name,
      category,
      description,
      icon,
      basePrice,
      estimatedDuration,
    });

    await newService.save();
    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.find({
      category,
      isActive: true,
    });

    if (services.length === 0) {
      return res.status(404).json({ message: "No services found in this category" });
    }

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

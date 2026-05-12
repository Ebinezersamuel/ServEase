const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const Service = require("../models/Service");

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      scheduledTime,
      location,
      description,
      notes,
      paymentMethod,
    } = req.body;

    // Fetch service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Fetch provider details
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Calculate pricing
    const servicePrice = service.basePrice;
    const platformFee = Math.round(servicePrice * 0.05);
    const tax = Math.round((servicePrice + platformFee) * 0.18);
    const totalAmount = servicePrice + platformFee + tax;

    const newBooking = new Booking({
      customerId: req.user.id,
      providerId,
      serviceId,
      service: service.name,
      scheduledTime,
      location,
      description,
      notes,
      paymentMethod,
      price: {
        servicePrice,
        platformFee,
        tax,
        totalAmount,
      },
      cancellationPolicy: {
        canCancelUpto: 2, // 2 hours before
        cancellationCharge: 50, // 50%
      },
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { customerId: req.user.id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("providerId")
      .populate("serviceId")
      .sort({ scheduledTime: -1 });

    res.json({ tasks: bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get provider's tasks
exports.getProviderTasks = async (req, res) => {
  try {
    const { status } = req.query;

    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    let query = { providerId: provider._id };

    if (status) {
      query.status = status;
    }

    const tasks = await Booking.find(query)
      .populate("customerId", "name email phone")
      .populate("serviceId")
      .sort({ scheduledTime: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled", cancellationReason: reason, updatedAt: Date.now() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

// Add rating and review
exports.rateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { score, review } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        rating: {
          score,
          review,
          ratedAt: Date.now(),
        },
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update provider rating
    const provider = await Provider.findById(booking.providerId);
    if (provider) {
      const allRatings = await Booking.find({
        providerId: booking.providerId,
        "rating.score": { $exists: true },
      });

      const averageRating =
        allRatings.reduce((sum, b) => sum + (b.rating?.score || 0), 0) /
        allRatings.length;

      await Provider.findByIdAndUpdate(booking.providerId, {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews: allRatings.length,
      });
    }

    res.json({ message: "Rating added successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error adding rating", error: error.message });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("customerId")
      .populate("providerId")
      .populate("serviceId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
};

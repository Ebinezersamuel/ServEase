const User = require('../models/User');

// @desc    Get all users/providers
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get providers by service/category
// @route   GET /api/users/search/providers
// @access  Public
exports.searchProviders = async (req, res, next) => {
  try {
    const { category, city, rating, sortBy } = req.query;

    let query = { userType: 'provider', availability: true };

    if (category) {
      query.services = { $in: [category] };
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (rating) {
      query.rating = { $gte: parseInt(rating) };
    }

    let sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sortBy === 'price') {
      sortOptions = { hourlyRate: 1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const providers = await User.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user rating and reviews count
// @route   GET /api/users/:id/stats
// @access  Public
exports.getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        rating: user.rating,
        totalReviews: user.totalReviews,
        totalBookings: user.totalBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

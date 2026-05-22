const express = require('express');
const router = express.Router();
const { userRegister, userLogin, providerRegister, providerLogin, getProfile, verifyToken } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// User routes
router.post('/user/register', userRegister);
router.post('/user/login', userLogin);

// Provider routes
router.post('/provider/register', providerRegister);
router.post('/provider/login', providerLogin);

// Protected routes
router.get('/profile', auth, getProfile);
router.get('/verify', auth, verifyToken);

module.exports = router;

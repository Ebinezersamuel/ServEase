const express = require('express');
const router = express.Router();
const { getProviderProfile, updateProviderProfile, getEarnings, searchProviders } = require('../controllers/providerController');
const { auth } = require('../middleware/auth');

router.get('/:id', getProviderProfile);
router.get('/search', searchProviders);
router.put('/profile', auth, updateProviderProfile);
router.get('/earnings', auth, getEarnings);

module.exports = router;

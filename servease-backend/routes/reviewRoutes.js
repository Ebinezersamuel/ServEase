const express = require('express');
const { 
  createReview, 
  getProviderReviews, 
  getTaskReview,
  getReview,
  updateReview,
  deleteReview 
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/task/:taskId', getTaskReview);
router.get('/:id', getReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;

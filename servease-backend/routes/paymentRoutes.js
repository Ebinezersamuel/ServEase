const express = require('express');
const { 
  createPayment, 
  getPayments, 
  getUserPayments,
  getPayment,
  updatePayment,
  processPayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createPayment);
router.get('/user/mypayments', auth, getUserPayments);
router.get('/stats/analytics', auth, getPaymentStats);
router.get('/', auth, getPayments);
router.get('/:id', auth, getPayment);
router.put('/:id', auth, updatePayment);
router.post('/:id/process', auth, processPayment);

module.exports = router;

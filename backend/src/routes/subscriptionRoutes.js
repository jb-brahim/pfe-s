const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/subscription/checkout
// @desc    Simulated payment checkout and subscription creation
// @access  Private (Admin)
router.post('/checkout', protect, checkout);

module.exports = router;

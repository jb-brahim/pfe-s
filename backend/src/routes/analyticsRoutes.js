const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyStats } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Dashboard overview
router.get('/dashboard', protect, authorize('MANAGER', 'ADMIN'), getDashboardStats);

// Monthly stats for charts
router.get('/monthly', protect, authorize('MANAGER', 'ADMIN'), getMonthlyStats);

module.exports = router;

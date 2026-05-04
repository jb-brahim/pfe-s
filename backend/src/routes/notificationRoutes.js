const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Get my notifications
router.get('/', protect, getMyNotifications);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);

// Mark one as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;

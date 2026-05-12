const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  createUser, 
  updateUserRole, 
  deleteUser, 
  getUserStats,
  getProfile,
  updatePreferences
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Profile & Preferences (Current User)
router.get('/profile', protect, getProfile);
router.put('/preferences', protect, updatePreferences);

// All team management routes
router.get('/', protect, authorize('ADMIN'), getAllUsers);
router.post('/', protect, authorize('ADMIN'), createUser);
router.get('/stats', protect, authorize('ADMIN'), getUserStats);
router.put('/:id/role', protect, authorize('ADMIN'), updateUserRole);
router.delete('/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;

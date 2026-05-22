const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  createUser, 
  updateUserRole, 
  updateUserLevel,
  deleteUser, 
  getUserStats,
  getProfile,
  updatePreferences,
  updateCompanyDetails,
  generateApiKey,
  updateIntegrations,
  uploadProfileImage
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Profile & Preferences (Current User)
router.get('/profile', protect, getProfile);
router.post('/profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.put('/preferences', protect, updatePreferences);
router.post('/company', protect, updateCompanyDetails);
router.post('/apikeys', protect, generateApiKey);
router.post('/integrations', protect, updateIntegrations);

// All team management routes
router.get('/', protect, authorize('ADMIN', 'ACCOUNTANT'), getAllUsers);
router.post('/', protect, authorize('ADMIN'), createUser);
router.get('/stats', protect, authorize('ADMIN', 'ACCOUNTANT'), getUserStats);
router.put('/:id/role', protect, authorize('ADMIN'), updateUserRole);
router.put('/:id/level', protect, authorize('ADMIN'), updateUserLevel);
router.delete('/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile, 
  updateProfile, 
  updatePreferences, 
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected (require login)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/change-password', protect, changePassword);

module.exports = router;

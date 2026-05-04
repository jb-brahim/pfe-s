const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, updatePreferences, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected (require login)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/change-password', protect, changePassword);

module.exports = router;

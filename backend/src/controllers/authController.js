const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // AUTH LOGIC FOR HIERARCHY
    const authHeader = req.headers.authorization;
    let creator = null;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        creator = await User.findById(decoded.id);
      } catch (err) {}
    }

    // 1. PUBLIC REGISTRATION (No valid creator)
    if (!creator) {
      if (role && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Public registration is only allowed for ADMIN role.' });
      }
    } 
    // 2. INTERNAL REGISTRATION (Creator exists)
    else {
      if (creator.role === 'ADMIN') {
        if (!['ACCOUNTANT', 'ADMIN'].includes(role)) {
          return res.status(400).json({ message: 'Admins can only create Accountants or Admins.' });
        }
      } else {
        return res.status(403).json({ message: 'Accountants are not authorized to create users.' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate Verification Code
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || (creator ? 'ACCOUNTANT' : 'ADMIN'),
      managedBy: creator ? creator._id : null,
      isEmailVerified: creator ? true : false,
      verificationCode,
      verificationCodeExpires
    });

    if (user) {
      // Send Email (Non-blocking)
      sendMail(
        user.email,
        'Verify your Aura Finance Account',
        `Your verification code is: ${verificationCode}`,
        `<p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code expires in 15 minutes.</p>`
      );

      res.status(201).json({
        message: 'Verification code sent to email',
        requiresVerification: true,
        email: user.email
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verificationCode !== code || !user.verificationCodeExpires || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        token: generateToken(user._id),
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (!user.isEmailVerified) {
        return res.status(403).json({ message: 'Please verify your email first', requiresVerification: true });
      }

      res.json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage || '',
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetPasswordCode = generateOTP();
    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    sendMail(
      user.email,
      'Password Reset Code - Aura Finance',
      `Your password reset code is: ${resetPasswordCode}`,
      `<p>Your password reset code is: <strong>${resetPasswordCode}</strong></p><p>This code expires in 15 minutes.</p>`
    );

    res.json({ message: 'Password reset code sent to email' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetPasswordCode !== code || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET PROFILE
// ──────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// UPDATE PROFILE
// ──────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;
    await user.save();

    res.json({
      data: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// CHANGE PASSWORD
// ──────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be 6+ chars' });

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile, 
  updateProfile, 
  updatePreferences, 
  changePassword 
};

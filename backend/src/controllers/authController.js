const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // AUTH LOGIC FOR HIERARCHY
    // If a token is provided, we check for internal creation
    const authHeader = req.headers.authorization;
    let creator = null;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        creator = await User.findById(decoded.id);
      } catch (err) {
        // Token invalid, treat as public attempt
      }
    }

    // 1. PUBLIC REGISTRATION (No valid creator)
    if (!creator) {
      if (role && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Public registration is only allowed for ADMIN role.' });
      }
    } 
    // 2. INTERNAL REGISTRATION (Creator exists)
    else {
      // ADMIN can create MANAGER or EMPLOYEE
      if (creator.role === 'ADMIN') {
        if (!['MANAGER', 'EMPLOYEE'].includes(role)) {
          return res.status(400).json({ message: 'Admins can only create Managers or Employees.' });
        }
      }
      // MANAGER can only create EMPLOYEE
      else if (creator.role === 'MANAGER') {
        if (role !== 'EMPLOYEE') {
          return res.status(403).json({ message: 'Managers can only create Employees.' });
        }
      }
      // EMPLOYEE cannot create anyone
      else {
        return res.status(403).json({ message: 'Employees are not authorized to create users.' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || (creator ? 'EMPLOYEE' : 'ADMIN'),
      managedBy: creator?.role === 'MANAGER' ? creator._id : (req.body.managedBy || null)
    });

    if (user) {
      res.status(201).json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
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

// ──────────────────────────────────────────────
// GET PROFILE — NEW
// ──────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user }); // Standardizing response with 'data' wrapper
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
// UPDATE PROFILE — NEW
// ──────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email is already taken by someone else
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// CHANGE PASSWORD — NEW
// ──────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, updatePreferences, changePassword };

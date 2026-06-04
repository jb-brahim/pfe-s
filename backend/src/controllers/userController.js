const User = require('../models/User');
const Invoice = require('../models/Invoice');
const ExtractedData = require('../models/ExtractedData');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// ──────────────────────────────────────────────
// GET ALL USERS (Admin & Manager)
// ──────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const rootAdminId = req.user.managedBy || req.user._id;
    let query = {
      $or: [
        { _id: rootAdminId },
        { managedBy: rootAdminId }
      ]
    };
    console.log(`[getAllUsers] Role: ${req.user.role}, ID: ${req.user._id}`);
    
    console.log(`[getAllUsers] Query:`, query);

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 });
      
    console.log(`[getAllUsers] Found ${users.length} users`);
    res.json({ data: users });
  } catch (error) {
    console.error('[getAllUsers] Error:', error);
    next(error);
  }
};

// ──────────────────────────────────────────────
// CREATE USER (Admin only)
// ──────────────────────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'ACCOUNTANT',
      approvalLevel: level || 1,
      managedBy: req.user._id,
      isEmailVerified: true
    });

    try {
      await AuditLog.create({
        userId: req.user._id,
        action: `Added New Employee (${role || 'ACCOUNTANT'})`,
        entityType: 'User',
        entityId: user._id,
        details: `Name: ${name}, Email: ${email}`
      });
    } catch (err) {
      console.error('Failed to create audit log for employee creation:', err);
    }

    // Send an email with the auto-generated password
    const { sendMail } = require('../utils/mailer');
    const emailSubject = 'Welcome to aura Invoice AI - Your Account Details';
    const emailHtml = `
      <h3>Welcome to the Team, ${name}!</h3>
      <p>An administrator has invited you to access the aura Invoice AI platform as a(n) <strong>${role || 'ACCOUNTANT'}</strong>.</p>
      <p>Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password as soon as possible.</p>
      <br/>
      <p>Best regards,<br/>The aura Invoice AI Team</p>
    `;
    
    // We run it asynchronously without blocking the response
    sendMail(email, emailSubject, '', emailHtml).catch(err => console.error(err));


    res.status(201).json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// UPDATE USER ROLE (Admin only)
// ──────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ACCOUNTANT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be ACCOUNTANT or ADMIN' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// UPDATE USER LEVEL (Admin only)
// ──────────────────────────────────────────────
const updateUserLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { level } = req.body;

    if (![1, 2].includes(level)) {
      return res.status(400).json({ message: 'Invalid level. Must be 1 or 2' });
    }

    const user = await User.findByIdAndUpdate(id, { approvalLevel: level }, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// DELETE USER (Admin only)
// ──────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// USER STATISTICS (per-user invoice stats)
// ──────────────────────────────────────────────
const getUserStats = async (req, res, next) => {
  try {
    const rootAdminId = req.user.managedBy || req.user._id;
    let query = {
      $or: [
        { _id: rootAdminId },
        { managedBy: rootAdminId }
      ]
    };

    const users = await User.find(query).select('-passwordHash');

    const stats = await Promise.all(users.map(async (user) => {
      const totalInvoices = await Invoice.countDocuments({ userId: user._id });
      const approved = await Invoice.countDocuments({ userId: user._id, status: 'APPROVED' });
      const rejected = await Invoice.countDocuments({ userId: user._id, status: 'REJECTED' });
      const pending = await Invoice.countDocuments({ userId: user._id, status: 'SUBMITTED' }); // Changed from VERIFIED to match new status

      // Total amount from approved invoices
      const approvedInvoices = await Invoice.find({ userId: user._id, status: 'APPROVED' }).select('_id');
      const approvedIds = approvedInvoices.map(i => i._id);

      const expenseAgg = await ExtractedData.aggregate([
        { $match: { invoiceId: { $in: approvedIds } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
      const approvalRate = totalInvoices > 0 ? Math.round((approved / totalInvoices) * 100) : 0;

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalLevel: user.approvalLevel || 1,
        profileImage: user.profileImage || '',
        totalInvoices,
        approved,
        rejected,
        pending,
        totalExpenses,
        approvalRate
      };
    }));

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET CURRENT PROFILE
// ──────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// UPDATE USER PREFERENCES
// ──────────────────────────────────────────────
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
// UPDATE COMPANY DETAILS
// ──────────────────────────────────────────────
const updateCompanyDetails = async (req, res, next) => {
  try {
    const { companyDetails } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { companyDetails },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GENERATE API KEY
// ──────────────────────────────────────────────
const generateApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    const crypto = require('crypto');
    const key = 'sk_live_' + crypto.randomBytes(16).toString('hex');
    
    const user = await User.findById(req.user._id);
    if (!user.apiKeys) {
      user.apiKeys = [];
    }
    user.apiKeys.push({ name: name || 'New API Key', key });
    await user.save();
    
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// UPDATE INTEGRATIONS
// ──────────────────────────────────────────────
const updateIntegrations = async (req, res, next) => {
  try {
    const { integrations } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { integrations },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// UPLOAD PROFILE IMAGE
// ──────────────────────────────────────────────
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Normalize path for Windows compatibility
    const profileImage = req.file.path.replace(/\\/g, '/');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage },
      { new: true }
    ).select('-passwordHash');

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAllUsers, 
  createUser, 
  updateUserRole, 
  deleteUser, 
  getUserStats,
  getProfile,
  updatePreferences,
  updateCompanyDetails,
  generateApiKey,
  updateIntegrations,
  updateUserLevel,
  uploadProfileImage
};

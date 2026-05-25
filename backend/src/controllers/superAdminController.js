const User = require('../models/User');
const Announcement = require('../models/Announcement');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// ----------------------------------------------------
// SYSTEM STATS
// ----------------------------------------------------
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'ADMIN' });
    const accountantUsers = await User.countDocuments({ role: 'ACCOUNTANT' });
    const superAdminUsers = await User.countDocuments({ role: 'SUPER_ADMIN' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        breakdown: { admins: adminUsers, accountants: accountantUsers, superAdmins: superAdminUsers },
        systemStatus: 'Healthy',
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ----------------------------------------------------
// TENANT / USER MANAGEMENT
// ----------------------------------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, plan } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'User exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('TempPassword123!', salt);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'ADMIN', // Organization Owner
      companyDetails: { name },
      billing: { plan: plan || 'Pro' }
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'Tenant Organization Created',
      entityType: 'User',
      entityId: newUser._id
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { plan, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    if (plan) user.billing.plan = plan;
    if (status) user.status = status;

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    await AuditLog.create({
      userId: req.user._id,
      action: 'Tenant Organization Deleted',
      entityType: 'User',
      entityId: user._id
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.toggleUserLock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    user.status = user.status === 'Locked' ? 'Active' : 'Locked';
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: user.status === 'Locked' ? 'User Locked' : 'User Unlocked',
      entityType: 'User',
      entityId: user._id
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ----------------------------------------------------
// BILLING STATS
// ----------------------------------------------------
exports.getBillingStats = async (req, res) => {
  try {
    const orgs = await User.find({ role: 'ADMIN' });
    let totalMRR = 0;
    const planCounts = { Enterprise: 0, Pro: 0, Basic: 0 };

    orgs.forEach(org => {
      const plan = org.billing?.plan || 'Basic';
      if (plan.includes('Enterprise')) { totalMRR += 299; planCounts.Enterprise++; }
      else if (plan.includes('Pro')) { totalMRR += 99; planCounts.Pro++; }
      else { planCounts.Basic++; }
    });

    res.status(200).json({
      success: true,
      data: {
        mrr: totalMRR,
        activeSubscriptions: orgs.length,
        avgRevenuePerUser: orgs.length ? (totalMRR / orgs.length).toFixed(2) : 0,
        distribution: planCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ----------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, severity } = req.body;
    const announcement = await Announcement.create({
      title, message, severity, createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
    
    announcement.active = !announcement.active;
    await announcement.save();
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ----------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'email name').sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ----------------------------------------------------
// SYSTEM SETTINGS
// ----------------------------------------------------
exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings({});
    
    const { platformName, maintenanceMode, allowPublicRegistration } = req.body;
    if (platformName !== undefined) settings.platformName = platformName;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowPublicRegistration !== undefined) settings.allowPublicRegistration = allowPublicRegistration;
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

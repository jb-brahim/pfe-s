const User = require('../models/User');
const Announcement = require('../models/Announcement');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

const os = require('os');
const mongoose = require('mongoose');

// ----------------------------------------------------
// SYSTEM STATS
// ----------------------------------------------------
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'ADMIN' });
    const accountantUsers = await User.countDocuments({ role: 'ACCOUNTANT' });
    const superAdminUsers = await User.countDocuments({ role: 'SUPER_ADMIN' });

    const memUsage = (1 - os.freemem() / os.totalmem()) * 100;
    const serverLoad = memUsage.toFixed(0) + '%';
    const systemStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Degraded';
    const securityAlerts = await User.countDocuments({ status: 'Locked' });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const growthData = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = growthData.map(d => ({
      name: `${monthNames[d._id.month - 1]} ${d._id.year}`,
      users: d.count
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        breakdown: { admins: adminUsers, accountants: accountantUsers, superAdmins: superAdminUsers },
        systemStatus,
        serverLoad,
        securityAlerts,
        chartData,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error("Stats Error:", error);
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

exports.getCompanies = async (req, res) => {
  try {
    const admins = await User.find({ role: 'ADMIN' }, '-passwordHash').lean();
    const companies = [];

    for (const admin of admins) {
      const employees = await User.find({ managedBy: admin._id }, 'name email role status').lean();
      companies.push({
        ...admin,
        employees
      });
    }

    res.status(200).json({ success: true, data: companies });
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
    const { plan, amount, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    if (plan) user.billing.plan = plan;
    if (amount !== undefined) user.billing.amount = amount;
    if (status) user.status = status;

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.generateApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    const crypto = require('crypto');
    const newApiKey = crypto.randomBytes(32).toString('hex');
    const keyName = 'SuperAdmin Generated Key - ' + new Date().toLocaleDateString();

    if (!user.apiKeys) {
      user.apiKeys = [];
    }
    user.apiKeys.push({ name: keyName, key: newApiKey });
    // Also store it in user.apiKey for backward compatibility if needed by externalController
    user.apiKey = newApiKey; 

    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'Generated API Key for Tenant',
      entityType: 'User',
      entityId: user._id
    });

    res.status(200).json({ success: true, apiKey: newApiKey });
  } catch (error) {
    console.error('Error generating API key:', error);
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

exports.sendSubscriptionReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Organization not found' });

    const { sendMail } = require('../utils/mailer');
    const daysLeft = Math.ceil((new Date(user.billing.renewalDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    const finalSubject = subject || `Urgent: Your Subscription to Aura Finance is ending soon!`;
    const finalMessage = message || `Hello ${user.name},\n\nYour subscription plan (${user.billing.plan}) is set to expire in ${daysLeft} days. Please renew your subscription to avoid service interruption.\n\nThank you,\nAura Finance Team`;
    
    const emailRes = await sendMail(user.email, finalSubject, finalMessage);

    if (emailRes.success) {
      await AuditLog.create({
        userId: req.user._id,
        action: 'Sent Subscription Reminder',
        entityType: 'User',
        entityId: user._id
      });
      res.status(200).json({ success: true, message: 'Reminder sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send reminder via SMTP' });
    }
  } catch (error) {
    console.error('Error in sendSubscriptionReminder:', error);
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
    const announcements = await Announcement.find()
      .populate('targetUsers', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, severity, targetAudience, targetUsers } = req.body;
    const announcement = await Announcement.create({
      title, message, severity, 
      targetAudience: targetAudience || 'ALL',
      targetUsers: targetUsers || [],
      createdBy: req.user._id
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
    
    const { 
      platformName, maintenanceMode, allowPublicRegistration,
      mfaRequired, passwordExpiryDays, dbBackupFrequency, 
      googleVisionApiKey, emailAlerts 
    } = req.body;

    if (platformName !== undefined) settings.platformName = platformName;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowPublicRegistration !== undefined) settings.allowPublicRegistration = allowPublicRegistration;
    if (mfaRequired !== undefined) settings.mfaRequired = mfaRequired;
    if (passwordExpiryDays !== undefined) settings.passwordExpiryDays = passwordExpiryDays;
    if (dbBackupFrequency !== undefined) settings.dbBackupFrequency = dbBackupFrequency;
    if (googleVisionApiKey !== undefined) settings.googleVisionApiKey = googleVisionApiKey;
    if (emailAlerts !== undefined) settings.emailAlerts = emailAlerts;
    
    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

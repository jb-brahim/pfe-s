const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profileImage: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'DELIVERY'], 
    default: 'ACCOUNTANT' 
  },
  status: {
    type: String,
    enum: ['Active', 'Locked', 'Suspended', 'Pending Deletion'],
    default: 'Active'
  },
  isEmailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  approvalLevel: {
    type: Number,
    default: 1
  },
  preferences: {
    darkMode: { type: Boolean, default: true },
    notifications: {
      invoiceAlerts: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      systemUpdates: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      directMentions: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      weeklyReports: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } }
    },
    mfa: { type: Boolean, default: false }
  },
  companyDetails: {
    name: { type: String, default: '' },
    taxId: { type: String, default: '' }
  },
  apiKeys: [{
    name: { type: String, required: true },
    key: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  integrations: {
    ttnAccountId: { type: String, default: '' },
    ttnIntegrationKey: { type: String, default: '' },
    slackActive: { type: Boolean, default: false },
    quickbooksActive: { type: Boolean, default: false }
  },
  billing: {
    plan: { type: String, default: 'Pro Quarterly' },
    aiScansUsed: { type: Number, default: 0 },
    aiScansLimit: { type: Number, default: 5000 },
    storageUsedGB: { type: Number, default: 0 },
    storageLimitGB: { type: Number, default: 50 },
    renewalDate: { type: Date, default: () => new Date(new Date().setMonth(new Date().getMonth() + 3)) }
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

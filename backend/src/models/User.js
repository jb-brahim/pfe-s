const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profileImage: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'], 
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
    name: String,
    key: String,
    createdAt: { type: Date, default: Date.now }
  }],
  telegramId: { type: String, default: null },
  telegramLinkToken: { type: String, default: null },
  integrations: {
    ttnAccountId: { type: String, default: '' },
    ttnIntegrationKey: { type: String, default: '' },
    slackActive: { type: Boolean, default: false },
    quickbooksActive: { type: Boolean, default: false }
  },
  billing: {
    plan: { type: String, enum: ['Free', 'Basic', 'Normal', 'Pro', 'Premium'], default: 'Free' },
    status: { type: String, enum: ['Trialing', 'Active', 'Suspended', 'Canceled'], default: 'Trialing' },
    aiScansUsed: { type: Number, default: 0 },
    aiScansLimit: { type: Number, default: 50 },
    storageUsedGB: { type: Number, default: 0 },
    storageLimitGB: { type: Number, default: 1 },
    amount: { type: Number, default: 49 },
    renewalDate: { type: Date, default: () => new Date(new Date().setMonth(new Date().getMonth() + 1)) }
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

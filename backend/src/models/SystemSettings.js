const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'Aura Finance' },
  maintenanceMode: { type: Boolean, default: false },
  allowPublicRegistration: { type: Boolean, default: true },
  
  // Security
  mfaRequired: { type: Boolean, default: false },
  passwordExpiryDays: { type: Number, default: 90 },
  
  // Database
  dbBackupFrequency: { type: String, default: 'Daily' },
  
  // API Keys
  googleVisionApiKey: { type: String, default: '' },
  
  // Notifications
  emailAlerts: { type: Boolean, default: true },

  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

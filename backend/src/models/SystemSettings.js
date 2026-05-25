const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'Aura Finance' },
  maintenanceMode: { type: Boolean, default: false },
  allowPublicRegistration: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

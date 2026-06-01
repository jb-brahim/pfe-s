const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  active: { type: Boolean, default: true },
  targetAudience: { type: String, enum: ['ALL', 'SPECIFIC'], default: 'ALL' },
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

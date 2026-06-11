const mongoose = require('mongoose');

const reportScheduleSchema = new mongoose.Schema({
  reportType: { 
    type: String, 
    required: true,
    enum: ['Tax Compliance Audit', 'Vendor Spend Analysis', 'AI Extraction Accuracy']
  },
  frequency: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'], 
    required: true 
  },
  format: { 
    type: String, 
    required: true,
    enum: ['PDF', 'CSV', 'XLSX']
  },
  recipients: { type: String, required: true }, // Comma-separated list of email addresses
  active: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReportSchedule', reportScheduleSchema);

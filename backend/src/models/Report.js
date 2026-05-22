const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Profit & Loss Statement', 'Tax Compliance Audit', 'Vendor Spend Analysis', 'AI Extraction Accuracy'] 
  },
  format: { 
    type: String, 
    required: true,
    enum: ['PDF', 'CSV', 'XLSX'] 
  },
  dateRange: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Static relative URL to access/download
  size: { type: String, required: true }, // e.g., '1.2 MB'
  status: { 
    type: String, 
    enum: ['Processing', 'Ready', 'Failed'], 
    default: 'Ready' 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

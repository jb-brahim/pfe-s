const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'PROCESSING', 'EXTRACTED', 'VERIFIED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'FAILED'],
    default: 'DRAFT'
  },
  rejectionReason: { type: String },
  isSuspicious: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);

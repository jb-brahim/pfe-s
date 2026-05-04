const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['INVOICE_UPLOADED', 'INVOICE_PROCESSED', 'INVOICE_APPROVED', 'INVOICE_REJECTED', 'INVOICE_FAILED', 'NEEDS_REVIEW'],
    required: true
  },
  message: { type: String, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

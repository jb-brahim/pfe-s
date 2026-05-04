const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 },
  type: {
    type: String,
    enum: ['NOTE', 'APPROVAL_NOTE', 'REJECTION_REASON', 'CORRECTION'],
    default: 'NOTE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);

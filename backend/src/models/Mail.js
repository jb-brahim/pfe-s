const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  name: { type: String },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
  hasAttachment: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['extracted', 'processing', 'ignored'], 
    default: 'processing' 
  },
  invoiceId: { type: String },
  snippet: { type: String },
  body: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Mail', mailSchema);

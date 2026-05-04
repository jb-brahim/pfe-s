const mongoose = require('mongoose');

const systemRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['MAX_AMOUNT', 'REQUIRED_FIELDS', 'TVA_CHECK', 'VENDOR_WHITELIST'],
    required: true 
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SystemRule', systemRuleSchema);

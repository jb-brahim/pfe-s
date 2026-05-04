const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  monthlyLimit: { type: Number, required: true },
  alertThreshold: { type: Number, default: 80 }, // Alert at 80% of limit
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Unique constraint: one budget per month
budgetSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

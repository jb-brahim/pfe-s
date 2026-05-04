const mongoose = require('mongoose');

const validationResultSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  rules: [{
    ruleName: String,
    passed: Boolean,
    message: String
  }],
  overallStatus: {
    type: String,
    enum: ['PASS', 'WARNING', 'FAIL'],
    required: true
  }
});

module.exports = mongoose.model('ValidationResult', validationResultSchema);

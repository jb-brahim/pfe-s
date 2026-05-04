const mongoose = require('mongoose');

const extractedDataSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  companyName: { type: String },
  invoiceNumber: { type: String },
  matriculeFiscal: { type: String },
  date: { type: Date },
  totalAmount: { type: Number },
  totalHT: { type: Number },
  tvaAmount: { type: Number },
  timbre: { type: Number },
  tva: { type: Number },
  client: { type: String },
  confidenceScores: { type: Object },
  rawText: { type: String },
  isManualEntry: { type: Boolean, default: false },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ExtractedData', extractedDataSchema);

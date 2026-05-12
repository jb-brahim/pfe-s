const express = require('express');
const router = express.Router();
const {
  uploadInvoice,
  manualEntry,
  updateExtractedData,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  exportInvoices,
  batchUpload,
  submitInvoice,
  approveInvoice,
  rejectInvoice
} = require('../controllers/invoiceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Upload invoice (AI extraction)
router.post('/upload', protect, upload.single('invoiceFile'), uploadInvoice);

// Batch upload
router.post('/batch-upload', protect, upload.array('invoiceFiles', 10), batchUpload);

// Manual entry
router.post('/manual', protect, manualEntry);

// Workflow Actions
router.post('/:id/submit', protect, submitInvoice);
router.post('/:id/approve', protect, authorize('ADMIN'), approveInvoice);
router.post('/:id/reject', protect, authorize('ADMIN'), rejectInvoice);

// Export
router.get('/export', protect, authorize('ADMIN'), exportInvoices);

// Queries
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);

// Management
router.put('/:id/extracted', protect, updateExtractedData);
router.delete('/:id', protect, deleteInvoice);

module.exports = router;

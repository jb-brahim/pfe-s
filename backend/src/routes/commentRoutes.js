const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// Get comments for an invoice
router.get('/:invoiceId', protect, getComments);

// Add a comment to an invoice
router.post('/:invoiceId', protect, addComment);

// Delete a comment
router.delete('/remove/:id', protect, deleteComment);

module.exports = router;

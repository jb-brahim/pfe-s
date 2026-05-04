const Comment = require('../models/Comment');
const AuditLog = require('../models/AuditLog');

// Add a comment to an invoice
const addComment = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { text, type } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = await Comment.create({
      invoiceId,
      userId: req.user._id,
      text: text.trim(),
      type: type || 'NOTE'
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'ADD_COMMENT',
      entityType: 'Invoice',
      entityId: invoiceId
    });

    const populated = await Comment.findById(comment._id).populate('userId', 'name role');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// Get all comments for an invoice
const getComments = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const comments = await Comment.find({ invoiceId })
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// Delete a comment (only the author or admin)
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments, deleteComment };

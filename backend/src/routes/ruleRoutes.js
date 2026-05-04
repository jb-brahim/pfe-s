const express = require('express');
const router = express.Router();
const SystemRule = require('../models/SystemRule');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Get all rules
router.get('/', protect, async (req, res) => {
  try {
    const rules = await SystemRule.find().sort({ createdAt: -1 });
    res.json({ data: rules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/Update rule
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, type, value, isActive } = req.body;
    const rule = await SystemRule.findOneAndUpdate(
      { type }, 
      { name, value, isActive, createdBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ data: rule });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete rule
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const rule = await SystemRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json({ message: 'Rule deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

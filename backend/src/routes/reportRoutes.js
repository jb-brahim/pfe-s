const express = require('express');
const router = express.Router();
const {
  getReports,
  generateReport,
  deleteReport,
  getSchedules,
  createSchedule,
  deleteSchedule
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

// Report Actions
router.get('/', protect, getReports);
router.post('/generate', protect, generateReport);
router.delete('/:id', protect, deleteReport);

// Schedule Actions
router.get('/schedules', protect, getSchedules);
router.post('/schedules', protect, createSchedule);
router.delete('/schedules/:id', protect, deleteSchedule);

module.exports = router;

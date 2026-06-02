const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { 
  getSystemStats, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserLock,
  getBillingStats,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  getCompanies,
  sendSubscriptionReminder,
  generateApiKey
} = require('../controllers/superAdminController');

// All routes here are protected and require SUPER_ADMIN role
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.get('/companies', getCompanies);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/lock', toggleUserLock);
router.post('/users/:id/send-reminder', sendSubscriptionReminder);

// Generate API Key
router.post('/users/:id/generate-api-key', generateApiKey);

router.get('/billing-stats', getBillingStats);

router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id/toggle', toggleAnnouncement);

router.get('/audit-logs', getAuditLogs);

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

module.exports = router;

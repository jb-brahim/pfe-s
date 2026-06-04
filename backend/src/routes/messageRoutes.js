const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const messageController = require('../controllers/messageController');

router.use(protect);

router.post('/send', messageController.sendMessage);
router.get('/inbox', messageController.getInbox);
router.get('/outbox', messageController.getOutbox);
router.get('/contacts', messageController.getMessagingContacts);
router.put('/:id/read', messageController.markAsRead);

module.exports = router;

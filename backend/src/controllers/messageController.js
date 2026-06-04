const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverIds, subject, body } = req.body;
    const senderId = req.user._id;

    if (!receiverIds || receiverIds.length === 0 || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const messages = [];
    const notifications = [];

    for (const receiverId of receiverIds) {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        subject,
        body
      });
      await message.save();
      messages.push(message);

      const notification = new Notification({
        userId: receiverId,
        type: 'NEW_MESSAGE',
        message: `New message from ${req.user.name || 'someone'}: ${subject}`,
        messageId: message._id
      });
      await notification.save();
      notifications.push(notification);
    }

    res.status(201).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'name email role profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getOutbox = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate('receiver', 'name email role profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching outbox:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: id, receiver: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    // Also mark related notification as read
    await Notification.updateMany(
      { messageId: id, userId: req.user._id },
      { isRead: true }
    );

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getMessagingContacts = async (req, res) => {
  try {
    const userRole = req.user.role;
    let contacts = [];

    if (userRole === 'SUPER_ADMIN') {
      // Super Admin can message all Admins
      contacts = await User.find({ role: 'ADMIN', status: 'Active' })
        .select('name email role profileImage companyDetails');
    } else if (userRole === 'ADMIN') {
      // Admin can message Super Admins and their own Accountants
      const superAdmins = await User.find({ role: 'SUPER_ADMIN', status: 'Active' })
        .select('name email role profileImage companyDetails');
      const accountants = await User.find({ role: 'ACCOUNTANT', managedBy: req.user._id, status: 'Active' })
        .select('name email role profileImage companyDetails');
      contacts = [...superAdmins, ...accountants];
    } else if (userRole === 'ACCOUNTANT') {
      // Accountant can message their managing Admin
      if (req.user.managedBy) {
        contacts = await User.find({ _id: req.user.managedBy, status: 'Active' })
          .select('name email role profileImage companyDetails');
      }
    }

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

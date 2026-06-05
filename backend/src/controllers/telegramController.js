const User = require('../models/User');

const linkAccount = async (req, res, next) => {
  try {
    const { token, telegramId } = req.body;

    if (!token || !telegramId) {
      return res.status(400).json({ success: false, message: 'Token and Telegram ID are required' });
    }

    const user = await User.findOne({ telegramLinkToken: token });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid or expired linking token' });
    }

    user.telegramId = telegramId;
    user.telegramLinkToken = null; // Ensure one-time use
    await user.save();

    res.json({ success: true, message: 'Telegram account successfully linked', userId: user._id });
  } catch (error) {
    next(error);
  }
};

module.exports = { linkAccount };

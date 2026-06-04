const User = require('../models/User');
const crypto = require('crypto');

// @desc    Checkout / Subscribe to a plan
// @route   POST /api/subscription/checkout
// @access  Private (Admin only)
const checkout = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const userId = req.user._id;

    if (!['Basic', 'Pro', 'Ultra'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only Admins can manage subscriptions' });
    }

    // Generate an API Key if they don't have one
    let newApiKey = user.apiKey;
    if (!newApiKey) {
      newApiKey = crypto.randomBytes(32).toString('hex');
      user.apiKey = newApiKey;
    }

    // Update billing details
    user.billing.plan = plan;
    // Set some arbitrary limits based on plan
    if (plan === 'Basic') {
      user.billing.aiScansLimit = 500;
      user.billing.storageLimitGB = 5;
    } else if (plan === 'Pro') {
      user.billing.aiScansLimit = 5000;
      user.billing.storageLimitGB = 50;
    } else if (plan === 'Ultra') {
      user.billing.aiScansLimit = 50000;
      user.billing.storageLimitGB = 500;
    }
    
    // Set renewal date to 1 month from now
    user.billing.renewalDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan} plan.`,
      apiKey: newApiKey,
      billing: user.billing
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout
};

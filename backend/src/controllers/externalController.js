const Invoice = require('../models/Invoice');
const User = require('../models/User');

// @desc    Export all organization data
// @route   GET /api/external/sync
// @access  Private (API Key)
const syncData = async (req, res, next) => {
  try {
    const adminUser = req.user;

    // Fetch all users managed by this admin (and the admin themselves)
    const users = await User.find({
      $or: [
        { _id: adminUser._id },
        { managedBy: adminUser._id }
      ]
    }).select('-passwordHash -apiKey'); // Don't expose sensitive info

    // Fetch all invoices uploaded by these users
    const userIds = users.map(u => u._id);
    const invoices = await Invoice.find({ uploadedBy: { $in: userIds } })
      .populate('uploadedBy', 'name email')
      .populate('extractedData');

    res.status(200).json({
      success: true,
      data: {
        organization: {
          name: adminUser.companyDetails?.name || 'Unknown',
          taxId: adminUser.companyDetails?.taxId || 'Unknown',
          subscription: adminUser.billing?.plan || 'Free'
        },
        users,
        invoices
      }
    });
  } catch (error) {
    console.error('[EXTERNAL SYNC API ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to sync data' });
  }
};

module.exports = {
  syncData
};

const AuditLog = require('../models/AuditLog');

// Get audit trail for a specific invoice
const getAuditTrail = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const logs = await AuditLog.find({
      entityId: invoiceId,
      entityType: 'Invoice'
    })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// Get all audit logs (admin only)
const getAllAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { getTeamUserIds } = require('../utils/tenant');
    const { role, _id: userId } = req.user;
    let filter = {};
    
    if (role === 'ADMIN' || req.user.approvalLevel >= 2) {
      const teamUserIds = await getTeamUserIds(req.user);
      filter.userId = { $in: teamUserIds };
    } else {
      filter.userId = userId;
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditTrail, getAllAuditLogs };

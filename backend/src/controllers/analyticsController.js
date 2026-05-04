const ExtractedData = require('../models/ExtractedData');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');
const Budget = require('../models/Budget');

// ──────────────────────────────────────────────
// Main Dashboard Stats (Role-Aware)
// ──────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = {};
    
    // Isolation: Employees only see their own data
    if (role === 'EMPLOYEE') {
      filter.userId = userId;
    }

    // 1. Metric: Status Counts
    const statusAgg = await Invoice.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    statusAgg.forEach(s => {
      if (s._id === 'SUBMITTED') stats.pending = s.count;
      if (s._id === 'APPROVED') stats.approved = s.count;
      if (s._id === 'REJECTED') stats.rejected = s.count;
      stats.total += s.count;
    });

    // 2. Metric: Total Spending (Approved only)
    const approvedInvoices = await Invoice.find({ ...filter, status: 'APPROVED' }).select('_id');
    const approvedIds = approvedInvoices.map(i => i._id);
    
    const spendingAgg = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: approvedIds } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalAmount = spendingAgg.length > 0 ? spendingAgg[0].total : 0;

    // 3. Recent Activity (Audit Logs)
    const auditEntries = await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5);

    // 4. Budget Status (Current month)
    const now = new Date();
    const budget = await Budget.findOne({ 
      year: now.getFullYear(), 
      month: now.getMonth() + 1 
    });

    // 5. Metric: Active Suppliers Count
    const vendorCountAgg = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: approvedIds } } },
      { $group: { _id: "$companyName" } },
      { $count: "total" }
    ]);
    const activeSuppliers = vendorCountAgg.length > 0 ? vendorCountAgg[0].total : 0;

    // 6. Top Vendors (Spending per supplier)
    const topVendors = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: approvedIds } } },
      { $group: { 
          _id: "$companyName", 
          totalSpent: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 }
        } 
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);

    // Assemble metrics for the frontend CommandCenter
    const metrics = [
      { 
        label: role === 'EMPLOYEE' ? 'My Submissions' : 'Total Invoices', 
        value: stats.total.toString(), 
        trend: 'neutral', 
        icon: 'FileText' 
      },
      { 
        label: 'Active Suppliers', 
        value: activeSuppliers.toString(), 
        trend: 'positive', 
        icon: 'Users' 
      },
      { 
        label: 'Approved', 
        value: stats.approved.toString(), 
        trend: 'positive', 
        icon: 'CheckCircle2' 
      },
      { 
        label: role === 'EMPLOYEE' ? 'Rejected' : 'Avg. Processing', 
        value: role === 'EMPLOYEE' ? stats.rejected.toString() : '1.2d', 
        trend: role === 'EMPLOYEE' ? (stats.rejected > 0 ? 'negative' : 'positive') : 'positive', 
        icon: role === 'EMPLOYEE' ? 'XCircle' : 'Activity' 
      }
    ];

    res.json({
      data: {
        metrics,
        totalAmount,
        topVendors,
        auditEntries: auditEntries.map(e => ({
          id: e._id,
          timestamp: e.timestamp,
          action: e.action.replace(/_/g, ' '),
          user: req.user.name,
          details: `Entity: ${e.entityType}`,
          status: e.action.includes('REJECT') ? 'error' : e.action.includes('APPROVE') ? 'success' : 'info'
        })),
        budgets: budget ? [
          { category: 'Monthly Budget', spent: totalAmount, limit: budget.monthlyLimit, severity: totalAmount > budget.monthlyLimit ? 'critical' : 'info' }
        ] : []
      }
    });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// Monthly Stats (for charts)
// ──────────────────────────────────────────────
const getMonthlyStats = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { role, _id: userId } = req.user;
    let filter = {
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31T23:59:59`)
      }
    };
    
    if (role === 'EMPLOYEE') filter.userId = userId;

    const monthlyData = await Invoice.aggregate([
      { $match: filter },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const approvedInvoices = await Invoice.find({ 
      ...filter, 
      status: 'APPROVED' 
    }).select('_id');
    const approvedIds = approvedInvoices.map(i => i._id);

    const monthlyExpenses = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: approvedIds } } },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice'
        }
      },
      { $unwind: '$invoice' },
      { $group: { _id: { $month: "$invoice.createdAt" }, total: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = months.map((name, i) => {
      const monthNum = i + 1;
      const invoiceData = monthlyData.find(d => d._id === monthNum);
      const expenseData = monthlyExpenses.find(d => d._id === monthNum);
      return {
        month: name,
        invoiceCount: invoiceData ? invoiceData.count : 0,
        totalExpenses: expenseData ? expenseData.total : 0
      };
    });

    res.json({ year, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getMonthlyStats };

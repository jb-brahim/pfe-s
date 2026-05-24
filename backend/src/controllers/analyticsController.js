const ExtractedData = require('../models/ExtractedData');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');
const Budget = require('../models/Budget');
const { getTeamUserIds } = require('../utils/tenant');

// ──────────────────────────────────────────────
// Main Dashboard Stats (Role-Aware)
// ──────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = {};
    
    // Isolation: Accountants only see their own data, Admins see their team's data
    if (role === 'ADMIN' || req.user.approvalLevel >= 2) {
      const teamUserIds = await getTeamUserIds(req.user);
      filter.userId = { $in: teamUserIds };
    } else {
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
    const rootAdminId = req.user.managedBy || req.user._id;
    const now = new Date();
    const budget = await Budget.findOne({ 
      year: now.getFullYear(), 
      month: now.getMonth() + 1,
      createdBy: rootAdminId
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
        label: role === 'ACCOUNTANT' ? 'My Submissions' : 'Total Invoices', 
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
        label: role === 'ACCOUNTANT' ? 'Rejected' : 'Avg. Processing', 
        value: role === 'ACCOUNTANT' ? stats.rejected.toString() : '1.2d', 
        trend: role === 'ACCOUNTANT' ? (stats.rejected > 0 ? 'negative' : 'positive') : 'positive', 
        icon: role === 'ACCOUNTANT' ? 'XCircle' : 'Activity' 
      }
    ];

    // 7. Recent Invoices (For AI Telegram Assistant Q&A)
    const allInvoices = await Invoice.find(filter).select('_id');
    const allInvoiceIds = allInvoices.map(i => i._id);

    const recentInvoices = await ExtractedData.find({ invoiceId: { $in: allInvoiceIds } })
      .populate('invoiceId', 'status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      data: {
        metrics,
        totalAmount,
        topVendors,
        recentInvoices,
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
    
    if (role === 'ADMIN' || req.user.approvalLevel >= 2) {
      const teamUserIds = await getTeamUserIds(req.user);
      filter.userId = { $in: teamUserIds };
    } else {
      filter.userId = userId;
    }

    // 1. Monthly invoice count
    const monthlyData = await Invoice.aggregate([
      { $match: filter },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 2. Approved Invoices & Expenses
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

    // 3. Pending Invoices & Expenses (Submitted, Processing, Extracted, Verified)
    const pendingInvoices = await Invoice.find({ 
      ...filter, 
      status: { $in: ['SUBMITTED', 'PROCESSING', 'EXTRACTED', 'VERIFIED'] } 
    }).select('_id');
    const pendingIds = pendingInvoices.map(i => i._id);

    const monthlyPendingExpenses = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: pendingIds } } },
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

    // 4. Budgets
    const rootAdminId = req.user.managedBy || req.user._id;
    const budgets = await Budget.find({ year, createdBy: rootAdminId });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = months.map((name, i) => {
      const monthNum = i + 1;
      const invoiceData = monthlyData.find(d => d._id === monthNum);
      const expenseData = monthlyExpenses.find(d => d._id === monthNum);
      const pendingExpenseData = monthlyPendingExpenses.find(d => d._id === monthNum);
      const budgetData = budgets.find(b => b.month === monthNum);
      
      return {
        month: name,
        invoiceCount: invoiceData ? invoiceData.count : 0,
        totalExpenses: expenseData ? expenseData.total : 0,
        pendingExpenses: pendingExpenseData ? pendingExpenseData.total : 0,
        budgetLimit: budgetData ? budgetData.monthlyLimit : 0
      };
    });

    res.json({ year, data: result });
  } catch (error) {
    next(error);
  }
};

const getSuppliers = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = {};
    
    if (role === 'ADMIN' || req.user.approvalLevel >= 2) {
      const teamUserIds = await getTeamUserIds(req.user);
      filter.userId = { $in: teamUserIds };
    } else {
      filter.userId = userId;
    }
    
    const invoices = await Invoice.find(filter).select('_id');
    const invoiceIds = invoices.map(i => i._id);
    
    const suppliers = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: invoiceIds } } },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice'
        }
      },
      { $unwind: '$invoice' },
      { $sort: { "invoice.createdAt": -1 } },
      {
        $group: {
          _id: { $ifNull: ["$companyName", "Unknown Vendor"] },
          totalSpend: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 },
          recentInvoices: {
            $push: {
              id: "$invoice._id",
              amount: "$totalAmount",
              date: "$invoice.createdAt",
              status: "$invoice.status"
            }
          }
        }
      },
      {
        $project: {
          name: "$_id",
          totalSpend: 1,
          invoiceCount: 1,
          recentInvoices: { $slice: ["$recentInvoices", 5] },
          _id: 0
        }
      },
      { $sort: { totalSpend: -1 } }
    ]);

    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getMonthlyStats, getSuppliers };

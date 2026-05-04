const Budget = require('../models/Budget');
const Invoice = require('../models/Invoice');
const ExtractedData = require('../models/ExtractedData');

// ──────────────────────────────────────────────
// SET MONTHLY BUDGET
// ──────────────────────────────────────────────
const setBudget = async (req, res, next) => {
  try {
    const { monthlyLimit, alertThreshold, year, month } = req.body;

    if (!monthlyLimit || !year || !month) {
      return res.status(400).json({ message: 'monthlyLimit, year, and month are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { year, month },
      { monthlyLimit, alertThreshold: alertThreshold || 80, createdBy: req.user._id },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET BUDGET STATUS FOR A MONTH
// ──────────────────────────────────────────────
const getBudgetStatus = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);

    const budget = await Budget.findOne({ year, month });
    if (!budget) {
      return res.json({ message: 'No budget set for this month', budget: null });
    }

    // Calculate current spending
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const approvedInvoices = await Invoice.find({
      status: 'APPROVED',
      createdAt: { $gte: monthStart, $lte: monthEnd }
    }).select('_id');

    const approvedIds = approvedInvoices.map(i => i._id);

    const expenseAgg = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: approvedIds } } },
      { $group: { _id: '$category', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    // Map to categories format
    const categories = expenseAgg.map(item => ({
      category: item._id || 'Uncategorized',
      spent: item.total,
      limit: (budget.monthlyLimit / 5), // Mock limit per category for now or fetch from a category-limit model
      itemsCount: item.count
    }));

    const currentSpending = expenseAgg.reduce((sum, item) => sum + item.total, 0);
    const percentage = Math.round((currentSpending / budget.monthlyLimit) * 100);
    const remaining = budget.monthlyLimit - currentSpending;

    res.json({
      data: {
        budget: {
          monthlyLimit: budget.monthlyLimit,
          alertThreshold: budget.alertThreshold,
          year,
          month
        },
        currentSpending,
        remaining,
        percentage,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { setBudget, getBudgetStatus };

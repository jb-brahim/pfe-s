const Invoice = require('../models/Invoice');
const Approval = require('../models/Approval');
const AuditLog = require('../models/AuditLog');
const { getTeamUserIds } = require('../utils/tenant');

async function isInvoiceInAdminOrganization(invoice, user) {
  if (user.role === 'ACCOUNTANT') {
    const userId = invoice.userId._id ? invoice.userId._id.toString() : invoice.userId.toString();
    return userId === user._id.toString();
  }
  const teamUserIds = await getTeamUserIds(user);
  const invoiceUserId = invoice.userId._id ? invoice.userId._id.toString() : invoice.userId.toString();
  return teamUserIds.some(id => id.toString() === invoiceUserId);
}

const processApproval = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { decision, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status !== 'VERIFIED') {
      return res.status(400).json({ message: 'Invoice must be VERIFIED before approval' });
    }

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED' });
    }

    const isAuthorized = await isInvoiceInAdminOrganization(invoice, req.user);
    const isLevel2 = req.user.role === 'ACCOUNTANT' && req.user.approvalLevel >= 2;
    const canApprove = req.user.role === 'ADMIN' || isLevel2;

    if (!isAuthorized || !canApprove) {
      return res.status(403).json({ message: 'Not authorized to ' + decision.toLowerCase() + ' this invoice' });
    }

    if (decision === 'APPROVED' && isLevel2 && invoice.totalAmount > 5000) {
      return res.status(403).json({ message: 'Level 2 Accountants can only approve invoices up to 5,000 TND' });
    }

    await Approval.create({
      invoiceId,
      managerId: req.user._id,
      decision,
      notes
    });

    invoice.status = decision;
    await invoice.save();

    await AuditLog.create({
      userId: req.user._id,
      action: `ADMIN_${decision}`,
      entityType: 'Invoice',
      entityId: invoice._id
    });

    res.json({ message: `Invoice ${decision.toLowerCase()} successfully`, invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = { processApproval };

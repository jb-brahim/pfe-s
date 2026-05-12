const Invoice = require('../models/Invoice');
const Approval = require('../models/Approval');
const AuditLog = require('../models/AuditLog');

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

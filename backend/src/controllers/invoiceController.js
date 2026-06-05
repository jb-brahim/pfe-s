const Invoice = require('../models/Invoice');
const ExtractedData = require('../models/ExtractedData');
const ValidationResult = require('../models/ValidationResult');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Budget = require('../models/Budget');
const { extractInvoiceData } = require('../services/AiService');
const { validateInvoice } = require('../services/ValidationEngine');
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

// ──────────────────────────────────────────────
// HELPER: Notify all managers
// ──────────────────────────────────────────────
async function notifyManagers(type, message, invoiceId) {
  try {
    const managers = await User.find({ role: 'ADMIN' });
    const notifications = managers.map(m => ({
      userId: m._id,
      type,
      message,
      invoiceId
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}

// ──────────────────────────────────────────────
// HELPER: Check for duplicate invoices
// ──────────────────────────────────────────────
async function checkDuplicate(invoiceNumber, companyName, user) {
  if (!invoiceNumber) return null;

  const teamUserIds = await getTeamUserIds(user);

  const existingRecords = await ExtractedData.find({
    invoiceNumber: invoiceNumber,
    ...(companyName && { companyName: companyName })
  }).populate({
    path: 'invoiceId',
    match: { userId: { $in: teamUserIds }, status: { $ne: 'FAILED' } }
  });

  const duplicate = existingRecords.find(record => record.invoiceId != null);
  return duplicate || null;
}

// ──────────────────────────────────────────────
// HELPER: Check budget alerts
// ──────────────────────────────────────────────
async function checkBudgetAlert(invoiceAmount, user) {
  try {
    const now = new Date();
    const rootAdminId = user.managedBy || user._id;
    const budget = await Budget.findOne({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      createdBy: rootAdminId
    });

    if (!budget) return null;
    
    const teamUserIds = await getTeamUserIds(user);

    // Calculate current month's approved expenses
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const approvedInvoices = await Invoice.find({
      userId: { $in: teamUserIds },
      status: 'APPROVED',
      createdAt: { $gte: monthStart, $lte: monthEnd }
    }).select('_id');

    const approvedIds = approvedInvoices.map(i => i._id);

    const expenseAgg = await ExtractedData.aggregate([
      { $match: { invoiceId: { $in: approvedIds } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const currentTotal = (expenseAgg.length > 0 ? expenseAgg[0].total : 0) + invoiceAmount;
    const percentage = (currentTotal / budget.monthlyLimit) * 100;

    if (percentage >= 100) {
      return { alert: 'EXCEEDED', percentage: Math.round(percentage), limit: budget.monthlyLimit, current: currentTotal };
    } else if (percentage >= budget.alertThreshold) {
      return { alert: 'WARNING', percentage: Math.round(percentage), limit: budget.monthlyLimit, current: currentTotal };
    }
    return null;
  } catch (err) {
    console.error('Budget check error:', err.message);
    return null;
  }
}

// ──────────────────────────────────────────────
// 1. UPLOAD INVOICE (AI Extraction)
// ──────────────────────────────────────────────
const uploadInvoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ownerId = req.user.managedBy || req.user._id;
    const owner = await User.findById(ownerId);
    
    if (owner && owner.billing && owner.billing.aiScansUsed >= owner.billing.aiScansLimit) {
      return res.status(403).json({ message: 'LIMIT_REACHED' });
    }

    let source = 'WEB_APP';
    if (req.headers['x-telegram-id']) source = 'TELEGRAM';
    else if (req.user.email === 'n8n-bot@system.com' || (req.body && req.body.sender)) source = 'EMAIL';

    const invoice = await Invoice.create({
      userId: req.user._id,
      fileUrl: req.file.path,
      status: 'DRAFT',
      source
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'UPLOAD_INVOICE',
      entityType: 'Invoice',
      entityId: invoice._id
    });

    invoice.status = 'PROCESSING';
    await invoice.save();

    let extractedData;
    try {
      console.log('🔍 Starting AI Extraction...');
      const aiResponse = await extractInvoiceData(req.file.path);
      console.log('✅ AI Extraction Done.');

      // DUPLICATE DETECTION
      console.log('🕵️ Checking for duplicates...');
      const duplicate = await checkDuplicate(aiResponse.invoiceNumber, aiResponse.companyName, req.user);
      if (duplicate) {
        console.log('⚠️ Duplicate found!');
        invoice.status = 'FAILED';
        await invoice.save();
        return res.status(409).json({
          message: 'Duplicate invoice detected',
          existingInvoiceId: duplicate.invoiceId?._id || duplicate.invoiceId,
          existingNumber: duplicate.invoiceNumber,
          existingVendor: duplicate.companyName
        });
      }

      console.log('💾 Saving extracted data to database...');
      extractedData = await ExtractedData.create({
        invoiceId: invoice._id,
        ...aiResponse
      });

      invoice.status = 'EXTRACTED';
      await invoice.save();

      if (owner && owner.billing) {
        await User.updateOne(
          { _id: owner._id },
          { $inc: { 'billing.aiScansUsed': 1 } }
        );
      }

      // If this request came from n8n (via API key) or has email data, create a Mail record
      const isFromN8n = req.user.email === 'n8n-bot@system.com';
      if (isFromN8n || (req.body.sender && req.body.subject)) {
        const Mail = require('../models/Mail');
        
        // Handle cases where n8n sends "undefined" as a string or empty values
        const sender = (req.body.sender && req.body.sender !== 'undefined') ? req.body.sender : 'n8n-automation@system.com';
        const subject = (req.body.subject && req.body.subject !== 'undefined' && req.body.subject !== '[empty]') ? req.body.subject : 'Scanned Invoice';
        const name = (req.body.name && req.body.name !== 'undefined') ? req.body.name : 'N8N Scanner';
        const body = (req.body.body && req.body.body !== 'undefined') ? req.body.body : 'Automated upload via n8n.';

        await Mail.create({
          sender,
          name,
          subject,
          body,
          hasAttachment: true,
          status: 'extracted',
          snippet: body.substring(0, 100),
          invoiceId: invoice._id
        }).catch(e => console.error('Failed to create mail record from n8n:', e));
      }

      console.log('📝 Creating audit log...');
      await AuditLog.create({
        userId: req.user._id,
        action: 'AI_EXTRACTION',
        entityType: 'Invoice',
        entityId: invoice._id
      });

      console.log('🔔 Notifying managers...');
      await notifyManagers('NEEDS_REVIEW', `New invoice ${aiResponse.invoiceNumber || ''} needs review`, invoice._id);
      console.log('✅ Workflow steps completed.');

    } catch (err) {
      console.error('❌ AI Pipeline Error:', err);
      invoice.status = 'FAILED';
      await invoice.save();

      await Notification.create({
        userId: req.user._id,
        type: 'INVOICE_FAILED',
        message: `AI extraction failed: ${err.message}`,
        invoiceId: invoice._id
      }).catch(e => console.error('Failed to create error notification:', e));

      return res.status(500).json({ message: 'AI processing failed', error: err.message });
    }

    const { rulesResult, overallStatus } = validateInvoice(extractedData);

    await ValidationResult.create({
      invoiceId: invoice._id,
      rules: rulesResult,
      overallStatus
    });

    // ROLE-BASED FLOW:
    // ADMIN or LEVEL 2 ACCOUNTANT → auto-approve (no review needed)
    // LEVEL 1 ACCOUNTANT → needs admin/L2 review
    if (req.user.role === 'ADMIN' || req.user.approvalLevel >= 2) {
      invoice.status = 'APPROVED';
      await invoice.save();

      await AuditLog.create({
        userId: req.user._id,
        action: 'AUTO_APPROVE',
        entityType: 'Invoice',
        entityId: invoice._id
      });
    } else {
      invoice.status = 'VERIFIED';
      await invoice.save();

      await AuditLog.create({
        userId: req.user._id,
        action: 'VALIDATION',
        entityType: 'Invoice',
        entityId: invoice._id
      });

      // Only notify managers when an accountant uploads
      await notifyManagers('NEEDS_REVIEW', `New invoice ${extractedData.invoiceNumber || ''} from ${req.user.name} needs review`, invoice._id);
    }

    // Budget alert check
    const budgetAlert = await checkBudgetAlert(extractedData.totalAmount || 0, req.user);

    res.status(201).json({
      message: req.user.role === 'ADMIN' 
        ? 'Invoice uploaded, processed and auto-approved' 
        : 'Invoice uploaded and sent for review',
      data: {
        _id: invoice._id,
        status: invoice.status,
        extractedData: extractedData,
        validationOverall: overallStatus,
        budgetAlert
      }
    });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 2. MANUAL INVOICE ENTRY
// ──────────────────────────────────────────────
const manualEntry = async (req, res, next) => {
  try {
    const { companyName, invoiceNumber, matriculeFiscal, date, totalAmount, totalHT, tvaAmount, timbre, tva, client } = req.body;

    if (!companyName || !invoiceNumber || !totalAmount) {
      return res.status(400).json({ message: 'companyName, invoiceNumber, and totalAmount are required' });
    }

    // DUPLICATE DETECTION
    const duplicate = await checkDuplicate(invoiceNumber, companyName);
    if (duplicate) {
      return res.status(409).json({
        message: 'Duplicate invoice detected',
        existingInvoiceId: duplicate.invoiceId?._id || duplicate.invoiceId,
        existingNumber: duplicate.invoiceNumber
      });
    }

    const invoice = await Invoice.create({
      userId: req.user._id,
      fileUrl: 'MANUAL_ENTRY',
      status: 'EXTRACTED',
      source: 'WEB_APP'
    });

    const extractedData = await ExtractedData.create({
      invoiceId: invoice._id,
      companyName,
      invoiceNumber,
      matriculeFiscal,
      date: date ? new Date(date) : new Date(),
      totalAmount: Number(totalAmount),
      totalHT: Number(totalHT) || 0,
      tvaAmount: Number(tvaAmount) || 0,
      timbre: Number(timbre) || 0,
      tva: Number(tva) || 19,
      client: client || '',
      confidenceScores: { overall: 1.0 },
      rawText: 'MANUAL_ENTRY',
      isManualEntry: true,
      lastEditedBy: req.user._id
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'MANUAL_ENTRY',
      entityType: 'Invoice',
      entityId: invoice._id
    });

    const { rulesResult, overallStatus } = validateInvoice(extractedData);

    await ValidationResult.create({
      invoiceId: invoice._id,
      rules: rulesResult,
      overallStatus
    });

    invoice.status = 'VERIFIED';
    await invoice.save();

    await notifyManagers('NEEDS_REVIEW', `Manual invoice ${invoiceNumber} submitted by ${req.user.name}`, invoice._id);

    const budgetAlert = await checkBudgetAlert(Number(totalAmount), req.user);

    res.status(201).json({
      message: 'Manual invoice created successfully',
      invoiceId: invoice._id,
      status: invoice.status,
      extractedData,
      validationOverall: overallStatus,
      budgetAlert
    });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 3. EDIT EXTRACTED DATA
// ──────────────────────────────────────────────
const updateExtractedData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const isAuthorized = await isInvoiceInAdminOrganization(invoice, req.user);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to edit this invoice' });
    }

    if (['APPROVED', 'REJECTED'].includes(invoice.status)) {
      return res.status(400).json({ message: 'Cannot edit an invoice that has been approved or rejected' });
    }

    const extractedData = await ExtractedData.findOneAndUpdate(
      { invoiceId: id },
      { ...updates, lastEditedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!extractedData) {
      return res.status(404).json({ message: 'Extracted data not found' });
    }

    const { rulesResult, overallStatus } = validateInvoice(extractedData);

    await ValidationResult.findOneAndUpdate(
      { invoiceId: id },
      { rules: rulesResult, overallStatus },
      { upsert: true, new: true }
    );

    invoice.status = 'VERIFIED';
    await invoice.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'EDIT_EXTRACTED_DATA',
      entityType: 'Invoice',
      entityId: invoice._id
    });

    res.json({
      message: 'Invoice data updated and re-validated',
      extractedData,
      validationOverall: overallStatus
    });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 4. GET ALL INVOICES (Enhanced Search & Filter)
// ──────────────────────────────────────────────
const getInvoices = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'ADMIN' || req.user.approvalLevel >= 2) {
      const teamUserIds = await getTeamUserIds(req.user);
      filter.userId = { $in: teamUserIds };
    } else {
      filter.userId = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date filter
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo + 'T23:59:59');
    }

    const invoices = await Invoice.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });

    // Fetch and Attach extractedData
    const invoiceIds = invoices.map(inv => inv._id);
    const allExtractedData = await ExtractedData.find({ invoiceId: { $in: invoiceIds } });

    let results = invoices.map(inv => {
      const data = allExtractedData.find(d => d.invoiceId.toString() === inv._id.toString());
      return {
        ...inv.toObject(),
        extractedData: data || null
      };
    });

    // Handle search in results
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      results = results.filter(res => {
        const vendor = res.extractedData?.companyName?.toLowerCase() || '';
        const num = res.extractedData?.invoiceNumber?.toLowerCase() || '';
        const client = res.extractedData?.client?.toLowerCase() || '';
        return vendor.includes(search) || num.includes(search) || client.includes(search);
      });
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 5. GET SINGLE INVOICE DETAIL
// ──────────────────────────────────────────────
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id).populate('userId', 'name email');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const isAuthorized = await isInvoiceInAdminOrganization(invoice, req.user);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    const extractedData = await ExtractedData.findOne({ invoiceId: id }).populate('lastEditedBy', 'name');
    const validation = await ValidationResult.findOne({ invoiceId: id });
    const auditLogs = await AuditLog.find({ entityId: id, entityType: 'Invoice' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Include comments
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ invoiceId: id })
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      invoice,
      extractedData,
      validation,
      auditLogs,
      comments
    });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 6. DELETE INVOICE
// ──────────────────────────────────────────────
const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const isAuthorized = await isInvoiceInAdminOrganization(invoice, req.user);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this invoice' });
    }

    if (invoice.status === 'APPROVED' && req.user.role !== 'ADMIN') {
      return res.status(400).json({ message: 'Cannot delete an approved invoice unless you are an admin' });
    }

    await ExtractedData.deleteMany({ invoiceId: id });
    await ValidationResult.deleteMany({ invoiceId: id });
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ invoiceId: id });
    await Invoice.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user._id,
      action: 'DELETE_INVOICE',
      entityType: 'Invoice',
      entityId: id
    });

    res.json({ message: 'Invoice deleted successfully' });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 7. EXPORT INVOICES (CSV)
// ──────────────────────────────────────────────
const exportInvoices = async (req, res, next) => {
  try {
    const statusFilter = req.query.status || 'APPROVED';
    
    let filter = { status: statusFilter };
    if (req.user.role === 'ACCOUNTANT') {
      filter.userId = req.user._id;
    } else {
      const teamUserIds = await getTeamUserIds(req.user);
      filter.userId = { $in: teamUserIds };
    }
    
    const invoices = await Invoice.find(filter).populate('userId', 'name email');
    const invoiceIds = invoices.map(i => i._id);
    const extractedDataList = await ExtractedData.find({ invoiceId: { $in: invoiceIds } });

    const dataMap = {};
    extractedDataList.forEach(d => { dataMap[d.invoiceId.toString()] = d; });

    const headers = 'Invoice Number,Company Name,Client,Date,Total HT,TVA Amount,Timbre,Total TTC,Status,Uploaded By,Created At\n';
    let csv = headers;

    invoices.forEach(inv => {
      const d = dataMap[inv._id.toString()] || {};
      const userName = inv.userId ? inv.userId.name : 'Unknown';
      csv += `"${d.invoiceNumber || ''}","${d.companyName || ''}","${d.client || ''}","${d.date ? new Date(d.date).toLocaleDateString('fr-FR') : ''}",${d.totalHT || 0},${d.tvaAmount || 0},${d.timbre || 0},${d.totalAmount || 0},"${inv.status}","${userName}","${new Date(inv.createdAt).toLocaleDateString('fr-FR')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=invoices_${statusFilter.toLowerCase()}_export.csv`);
    res.send('\uFEFF' + csv);

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 8. BATCH UPLOAD (Multiple files at once)
// ──────────────────────────────────────────────
const batchUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const ownerId = req.user.managedBy || req.user._id;
    const owner = await User.findById(ownerId);

    const results = [];

    for (const file of req.files) {
      try {
        // Check Limit
        if (owner && owner.billing && owner.billing.aiScansUsed >= owner.billing.aiScansLimit) {
          results.push({
            filename: file.originalname,
            status: 'LIMIT_REACHED'
          });
          continue;
        }

        const invoice = await Invoice.create({
          userId: req.user._id,
          fileUrl: file.path,
          status: 'PROCESSING',
          source: 'WEB_APP'
        });

        const aiResponse = await extractInvoiceData(file.path);

        // Duplicate check
        const duplicate = await checkDuplicate(aiResponse.invoiceNumber, aiResponse.companyName, req.user);
        if (duplicate) {
          invoice.status = 'FAILED';
          await invoice.save();
          results.push({
            filename: file.originalname,
            status: 'DUPLICATE',
            invoiceId: invoice._id,
            existingInvoiceNumber: duplicate.invoiceNumber
          });
          continue;
        }

        await ExtractedData.create({
          invoiceId: invoice._id,
          ...aiResponse
        });

        invoice.status = 'EXTRACTED';
        await invoice.save();

        if (owner && owner.billing) {
          await User.updateOne(
            { _id: owner._id },
            { $inc: { 'billing.aiScansUsed': 1 } }
          );
        }

        results.push({
          filename: file.originalname,
          status: 'SUCCESS',
          invoiceId: invoice._id,
          invoiceNumber: aiResponse.invoiceNumber
        });

      } catch (err) {
        results.push({
          filename: file.originalname,
          status: 'FAILED',
          error: err.message
        });
      }
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'BATCH_UPLOAD',
      entityType: 'Invoice',
      entityId: results[0]?.invoiceId || null
    });

    await notifyManagers('NEEDS_REVIEW', `Batch upload: ${results.filter(r => r.status === 'SUCCESS').length} invoices processed`, null);

    res.status(201).json({
      message: `Batch complete: ${results.length} files processed`,
      results
    });

  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 9. SUBMIT INVOICE FOR REVIEW (Employee)
// ──────────────────────────────────────────────
const submitInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    invoice.status = 'SUBMITTED';
    await invoice.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'SUBMIT_FOR_REVIEW',
      entityType: 'Invoice',
      entityId: id
    });

    await notifyManagers('NEEDS_REVIEW', `Invoice ${id} submitted for review`, id);

    res.json({ message: 'Invoice submitted successfully', status: invoice.status });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 10. APPROVE INVOICE (Manager/Admin)
// ──────────────────────────────────────────────
const approveInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    const isAuthorized = await isInvoiceInAdminOrganization(invoice, req.user);
    const isLevel2 = req.user.role === 'ACCOUNTANT' && req.user.approvalLevel >= 2;
    const canApprove = req.user.role === 'ADMIN' || isLevel2;

    if (!isAuthorized || !canApprove) {
      return res.status(403).json({ message: 'Not authorized to approve this invoice' });
    }

    if (isLevel2 && invoice.totalAmount > 5000) {
      return res.status(403).json({ message: 'Level 2 Accountants can only approve invoices up to 5,000 TND' });
    }
    
    invoice.status = 'APPROVED';
    invoice.rejectionReason = undefined; // Clear any previous reason
    await invoice.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'APPROVE_INVOICE',
      entityType: 'Invoice',
      entityId: id
    });

    await Notification.create({
      userId: invoice.userId,
      type: 'INVOICE_APPROVED',
      message: `Your invoice has been approved`,
      invoiceId: id
    });

    res.json({ message: 'Invoice approved successfully', status: invoice.status });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 11. REJECT INVOICE (Manager/Admin)
// ──────────────────────────────────────────────
const rejectInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const isAuthorized = await isInvoiceInAdminOrganization(invoice, req.user);
    const isLevel2 = req.user.role === 'ACCOUNTANT' && req.user.approvalLevel >= 2;
    const canReject = req.user.role === 'ADMIN' || isLevel2;

    if (!isAuthorized || !canReject) {
      return res.status(403).json({ message: 'Not authorized to reject this invoice' });
    }

    invoice.status = 'REJECTED';
    invoice.rejectionReason = reason;
    await invoice.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'REJECT_INVOICE',
      entityType: 'Invoice',
      entityId: id,
      details: reason
    });

    await Notification.create({
      userId: invoice.userId,
      type: 'INVOICE_REJECTED',
      message: `Invoice rejected: ${reason}`,
      invoiceId: id
    });

    res.json({ message: 'Invoice rejected successfully', status: invoice.status });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// 12. DEMO EXTRACT INVOICE (No DB Saving)
// ──────────────────────────────────────────────
const demoExtractInvoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('🔍 Starting DEMO AI Extraction...');
    const aiResponse = await extractInvoiceData(req.file.path);
    console.log('✅ DEMO AI Extraction Done.');

    // Delete the file after extraction to save disk space
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      message: 'Demo extraction successful',
      data: {
        extractedData: aiResponse
      }
    });

  } catch (error) {
    console.error('❌ Demo Extraction Error:', error.message);
    
    // Attempt to delete file even on error to prevent leaks
    const fs = require('fs');
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to delete temp file:', e.message);
      }
    }

    // Graceful fallback: If it's a rate limit or API error during DEMO, return mock data 
    // so the landing page UI still looks good for presentations
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exhausted')) {
      console.log('⚠️ Returning mock data due to API Rate Limit (429) for Demo route.');
      return res.status(200).json({
        message: 'Demo extraction successful (Mock Data fallback due to API limits)',
        data: {
          extractedData: {
            companyName: 'Aura Demo Vendor (Mock Data)',
            invoiceNumber: `DEMO-${Math.floor(Math.random() * 10000)}`,
            matriculeFiscal: '0000000/A/M/000',
            date: new Date(),
            client: 'SmartFacture User',
            totalHT: 1500.00,
            tva: 19,
            tvaAmount: 285.00,
            timbre: 1.000,
            totalAmount: 1786.000,
            rawText: 'This is fallback mock data generated because the AI API limit was reached.',
            lineItems: [
              { description: "Consulting Services (Demo)", quantity: 1, unitPrice: 1000, totalPrice: 1000 },
              { description: "Software License (Demo)", quantity: 1, unitPrice: 500, totalPrice: 500 }
            ],
            confidenceScores: { overall: 0.99 }
          }
        }
      });
    }

    // Return JSON error response for other severe errors
    res.status(500).json({ 
      message: 'Failed to extract invoice data. Make sure the image is clear and try again.',
      error: error.message 
    });
  }
};

module.exports = {
  uploadInvoice,
  manualEntry,
  updateExtractedData,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  exportInvoices,
  batchUpload,
  submitInvoice,
  approveInvoice,
  rejectInvoice,
  demoExtractInvoice
};

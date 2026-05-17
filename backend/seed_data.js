/**
 * seed_data.js — Populates the database with realistic demo data
 * Run: node seed_data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Invoice = require('./src/models/Invoice');
const ExtractedData = require('./src/models/ExtractedData');
const Notification = require('./src/models/Notification');
const Budget = require('./src/models/Budget');
const AuditLog = require('./src/models/AuditLog');

const MONGO_URI = process.env.MONGO_URI;

// Realistic Tunisian/French supplier data
const suppliers = [
  { name: 'Prévost S.A.R.L.', mf: '1234567/A/P/000', tva: 19 },
  { name: 'Société Générale Informatique', mf: '0987654/B/M/001', tva: 19 },
  { name: 'TechnoServ Tunisia', mf: '1122334/C/N/000', tva: 19 },
  { name: 'Office Méditerranée', mf: '5566778/D/P/000', tva: 7 },
  { name: 'Groupe Atlas Import', mf: '3344556/E/M/001', tva: 19 },
  { name: 'Amine & Co. Consulting', mf: '9988776/F/N/000', tva: 19 },
  { name: 'STE Digital Solutions', mf: '1357924/G/P/001', tva: 19 },
  { name: 'Cabinet Juridique Bouslama', mf: '2468013/H/M/000', tva: 7 },
  { name: 'STEG Facturation', mf: '1111111/I/P/000', tva: 19 },
  { name: 'Tunisie Telecom', mf: '2222222/J/N/001', tva: 19 },
];

const statuses = ['APPROVED', 'APPROVED', 'APPROVED', 'APPROVED', 'SUBMITTED', 'SUBMITTED', 'EXTRACTED', 'VERIFIED', 'REJECTED', 'APPROVED'];

function randomDate(monthsBack) {
  const d = new Date();
  d.setMonth(d.getMonth() - Math.floor(Math.random() * monthsBack));
  d.setDate(Math.floor(Math.random() * 28) + 1);
  d.setHours(Math.floor(Math.random() * 12) + 8);
  return d;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Ensure admin user exists
    let adminUser = await User.findOne({ email: 'admin@aura.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      adminUser = await User.create({
        name: 'Sarah Admin',
        email: 'admin@aura.com',
        passwordHash: hash,
        role: 'ADMIN',
      });
      console.log('👤 Created admin user: admin@aura.com / admin123');
    } else {
      console.log('👤 Admin user already exists');
    }

    // 2. Create 20 invoices spread across the last 8 months
    console.log('📄 Creating invoices...');
    const invoiceDocs = [];
    for (let i = 0; i < 20; i++) {
      const createdAt = randomDate(8);
      const status = statuses[i % statuses.length];
      
      const invoice = await Invoice.create({
        userId: adminUser._id,
        fileUrl: `/uploads/invoice_seed_${i + 1}.pdf`,
        status,
        createdAt,
        updatedAt: createdAt,
      });
      invoiceDocs.push({ invoice, createdAt, index: i });
    }
    console.log(`   → Created ${invoiceDocs.length} invoices`);

    // 3. Create ExtractedData for each invoice
    console.log('🔍 Creating extracted data...');
    for (const { invoice, createdAt, index } of invoiceDocs) {
      const supplier = suppliers[index % suppliers.length];
      const ht = Math.floor(Math.random() * 15000) + 500; // 500 - 15500 TND
      const tvaAmount = Math.round(ht * supplier.tva / 100);
      const timbre = 1;
      const total = ht + tvaAmount + timbre;

      await ExtractedData.create({
        invoiceId: invoice._id,
        companyName: supplier.name,
        invoiceNumber: `FAC-${createdAt.getFullYear()}-${String(index + 101).padStart(4, '0')}`,
        matriculeFiscal: supplier.mf,
        date: createdAt,
        totalAmount: total,
        totalHT: ht,
        tvaAmount,
        timbre,
        tva: supplier.tva,
        client: 'Aura Finance S.A.',
        confidenceScores: {
          overall: +(0.85 + Math.random() * 0.14).toFixed(2),
          companyName: +(0.88 + Math.random() * 0.12).toFixed(2),
          totalAmount: +(0.90 + Math.random() * 0.10).toFixed(2),
        },
        rawText: `Facture ${supplier.name} - Montant Total: ${total} TND`,
        createdAt,
        updatedAt: createdAt,
      });
    }
    console.log('   → Created extracted data for all invoices');

    // 4. Create notifications
    console.log('🔔 Creating notifications...');
    const notifTypes = [
      { type: 'INVOICE_PROCESSED', message: 'Invoice from Prévost S.A.R.L. has been processed by AI' },
      { type: 'INVOICE_APPROVED', message: 'Invoice FAC-2026-0101 approved — 8,450 TND' },
      { type: 'NEEDS_REVIEW', message: 'Low confidence score (87%) on Société Générale Informatique invoice' },
      { type: 'INVOICE_UPLOADED', message: 'New invoice uploaded: Office Méditerranée — pending extraction' },
      { type: 'INVOICE_REJECTED', message: 'Invoice FAC-2026-0105 rejected — duplicate matricule fiscal detected' },
      { type: 'INVOICE_PROCESSED', message: 'Batch processing complete: 3 invoices extracted successfully' },
    ];

    for (const n of notifTypes) {
      await Notification.create({
        userId: adminUser._id,
        type: n.type,
        message: n.message,
        isRead: false,
      });
    }
    console.log(`   → Created ${notifTypes.length} notifications`);

    // 5. Create budget for current month
    console.log('💰 Creating budget...');
    const now = new Date();
    await Budget.findOneAndUpdate(
      { year: now.getFullYear(), month: now.getMonth() + 1 },
      {
        monthlyLimit: 50000,
        alertThreshold: 80,
        createdBy: adminUser._id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
      { upsert: true, new: true }
    );
    console.log('   → Budget set: 50,000 TND / month');

    // 6. Create audit log entries
    console.log('📋 Creating audit logs...');
    const actions = ['UPLOAD', 'AI_EXTRACTION', 'APPROVE', 'SUBMIT', 'VERIFY'];
    for (let i = 0; i < 10; i++) {
      const inv = invoiceDocs[i % invoiceDocs.length];
      await AuditLog.create({
        userId: adminUser._id,
        action: actions[i % actions.length],
        entityType: 'Invoice',
        entityId: inv.invoice._id,
        timestamp: inv.createdAt,
      });
    }
    console.log('   → Created 10 audit log entries');

    console.log('\n🎉 Seed complete! Login with:');
    console.log('   Email:    admin@aura.com');
    console.log('   Password: admin123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

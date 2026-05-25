require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const Announcement = require('./src/models/Announcement');
const Approval = require('./src/models/Approval');
const AuditLog = require('./src/models/AuditLog');
const Budget = require('./src/models/Budget');
const Comment = require('./src/models/Comment');
const ExtractedData = require('./src/models/ExtractedData');
const Invoice = require('./src/models/Invoice');
const Mail = require('./src/models/Mail');
const Notification = require('./src/models/Notification');
const Report = require('./src/models/Report');
const ReportSchedule = require('./src/models/ReportSchedule');
const SystemRule = require('./src/models/SystemRule');
const SystemSettings = require('./src/models/SystemSettings');
const User = require('./src/models/User');
const ValidationResult = require('./src/models/ValidationResult');

async function resetDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected.');

    console.log('Deleting all collections except Users...');
    await Promise.all([
      Announcement.deleteMany({}),
      Approval.deleteMany({}),
      AuditLog.deleteMany({}),
      Budget.deleteMany({}),
      Comment.deleteMany({}),
      ExtractedData.deleteMany({}),
      Invoice.deleteMany({}),
      Mail.deleteMany({}),
      Notification.deleteMany({}),
      Report.deleteMany({}),
      ReportSchedule.deleteMany({}),
      SystemRule.deleteMany({}),
      // We might want to keep SystemSettings if it has default settings, but the request says "all of thing". Let's clear it too, or leave it?
      // Actually maybe better to clear it.
      SystemSettings.deleteMany({}),
      ValidationResult.deleteMany({})
    ]);
    console.log('Cleared other collections.');

    console.log('Deleting non-SUPER_ADMIN users...');
    const result = await User.deleteMany({ role: { $ne: 'SUPER_ADMIN' } });
    console.log(`Deleted ${result.deletedCount} non-SUPER_ADMIN users.`);

    console.log('Database reset complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();

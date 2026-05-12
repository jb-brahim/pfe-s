// Add backend node_modules to module search paths
module.paths.push('c:\\Users\\brahi\\OneDrive\\Desktop\\pfe S\\backend\\node_modules');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = 'mongodb+srv://sarahpfe:sarahpfe@cluster0.yt1j3z6.mongodb.net/?appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.');

    const db = mongoose.connection.db;
    
    // List of collections to drop or empty
    const collectionsToClear = [
      'users',
      'invoices',
      'approvals',
      'auditlogs',
      'budgets',
      'comments',
      'extracteddatas',
      'notifications',
      'systemrules',
      'validationresults'
    ];

    console.log('--- Clearing Database ---');
    for (const colName of collectionsToClear) {
      try {
        const result = await db.collection(colName).deleteMany({});
        console.log(`- Cleared collection '${colName}': Deleted ${result.deletedCount} documents.`);
      } catch (colErr) {
        console.log(`- Collection '${colName}' does not exist or could not be cleared.`);
      }
    }

    console.log('\n--- Seeding Fresh Default Users ---');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const accountantPasswordHash = await bcrypt.hash('admin123', salt);

    // Create Admin User
    const adminUser = {
      name: 'System Admin',
      email: 'admin@admin.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      preferences: {
        darkMode: false,
        notifications: true,
        mfa: false
      },
      managedBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const adminInsertRes = await db.collection('users').insertOne(adminUser);
    const adminId = adminInsertRes.insertedId;
    console.log(`+ Seeded Admin User: 'admin@admin.com' (Password: 'admin123')`);

    // Create Accountant User
    const accountantUser = {
      name: 'Lead Accountant',
      email: 'accountant@admin.com',
      passwordHash: accountantPasswordHash,
      role: 'ACCOUNTANT',
      preferences: {
        darkMode: false,
        notifications: true,
        mfa: false
      },
      managedBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('users').insertOne(accountantUser);
    console.log(`+ Seeded Accountant User: 'accountant@admin.com' (Password: 'admin123')`);

    console.log('\n--- Seeding Fresh Default System Rules ---');
    const systemRules = [
      {
        name: 'Maximum Invoice Limit',
        description: 'Flags invoices exceeding maximum corporate spending limit',
        type: 'MAX_AMOUNT',
        value: 5000,
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Standard TVA Rate Verification',
        description: 'Validates that the invoice TVA conforms to standard rate (19%)',
        type: 'TVA_CHECK',
        value: 19,
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Required Metadata Fields Check',
        description: 'Flags invoices missing key fields like date or document number',
        type: 'REQUIRED_FIELDS',
        value: ['date', 'invoiceNumber'],
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('systemrules').insertMany(systemRules);
    console.log(`+ Seeded ${systemRules.length} System Rules.`);

    console.log('\n--- Database reset completely and ready to start fresh! ---');

  } catch (err) {
    console.error('Error resettting database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = `http://localhost:${process.env.PORT || 8080}/api`;

let adminToken = '';
let employeeToken = '';
let invoiceId = '';
let commentId = '';
let employeeId = '';
let passed = 0;
let failed = 0;

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    console.log(`  ❌ ${name} → ${msg}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function header(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ──────────────────────────────────────────────
// TEST SUITES
// ──────────────────────────────────────────────
async function runTests() {
  console.log('\n🧪 SMARTFACTURE BACKEND TEST SUITE');
  console.log('═'.repeat(50));

  // ─── AUTH ─────────────────────────────────
  console.log('\n📦 AUTH');

  await test('Register ADMIN user', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Admin Test',
      email: 'admin_test@smartfacture.com',
      password: 'admin123',
      role: 'ADMIN'
    });
    assert(res.data.token, 'No token returned');
    assert(res.data.role === 'ADMIN', 'Role mismatch');
    adminToken = res.data.token;
  });

  await test('Register EMPLOYEE user', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Employee Test',
      email: 'employee_test@smartfacture.com',
      password: 'emp123',
      role: 'EMPLOYEE'
    });
    assert(res.data.token, 'No token returned');
    employeeToken = res.data.token;
    employeeId = res.data._id;
  });

  await test('Login ADMIN', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin_test@smartfacture.com',
      password: 'admin123'
    });
    assert(res.data.token, 'No token');
    adminToken = res.data.token;
  });

  await test('Get Profile', async () => {
    const res = await axios.get(`${BASE_URL}/auth/profile`, header(adminToken));
    assert(res.data.name === 'Admin Test', 'Wrong name');
    assert(res.data.email === 'admin_test@smartfacture.com', 'Wrong email');
  });

  await test('Update Profile', async () => {
    const res = await axios.put(`${BASE_URL}/auth/profile`, {
      name: 'Admin Updated'
    }, header(adminToken));
    assert(res.data.name === 'Admin Updated', 'Name not updated');
  });

  await test('Change Password', async () => {
    const res = await axios.put(`${BASE_URL}/auth/change-password`, {
      currentPassword: 'admin123',
      newPassword: 'admin456'
    }, header(adminToken));
    assert(res.data.message === 'Password changed successfully');
  });

  await test('Login with new password', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin_test@smartfacture.com',
      password: 'admin456'
    });
    assert(res.data.token, 'Login failed with new password');
    adminToken = res.data.token;
  });

  await test('Reject wrong password', async () => {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin_test@smartfacture.com',
        password: 'wrongpassword'
      });
      throw new Error('Should have been rejected');
    } catch (err) {
      assert(err.response.status === 401, 'Should be 401');
    }
  });

  // ─── MANUAL INVOICE ENTRY ─────────────────
  console.log('\n📦 MANUAL INVOICE ENTRY');

  await test('Create manual invoice', async () => {
    const res = await axios.post(`${BASE_URL}/invoices/manual`, {
      companyName: 'Grenier S.A.R.L.',
      invoiceNumber: 'FAC-TEST-001',
      date: '2026-01-15',
      totalAmount: 53505.687,
      totalHT: 44962.258,
      tvaAmount: 8542.829,
      timbre: 0.6,
      tva: 19,
      client: 'Émilie Ferrand'
    }, header(employeeToken));
    assert(res.data.invoiceId, 'No invoiceId');
    assert(res.data.status === 'VERIFIED', 'Not verified');
    invoiceId = res.data.invoiceId;
  });

  await test('Duplicate detection blocks same invoice', async () => {
    try {
      await axios.post(`${BASE_URL}/invoices/manual`, {
        companyName: 'Grenier S.A.R.L.',
        invoiceNumber: 'FAC-TEST-001',
        totalAmount: 53505.687
      }, header(employeeToken));
      throw new Error('Should have been blocked');
    } catch (err) {
      assert(err.response.status === 409, 'Should be 409 conflict');
      assert(err.response.data.message.includes('Duplicate'), 'Should say duplicate');
    }
  });

  await test('Reject manual entry without required fields', async () => {
    try {
      await axios.post(`${BASE_URL}/invoices/manual`, {
        client: 'Only client provided'
      }, header(employeeToken));
      throw new Error('Should fail');
    } catch (err) {
      assert(err.response.status === 400);
    }
  });

  // Create a second invoice for filtering tests
  await test('Create second manual invoice', async () => {
    const res = await axios.post(`${BASE_URL}/invoices/manual`, {
      companyName: 'Prévost S.A.R.L.',
      invoiceNumber: 'FAC-TEST-002',
      date: '2026-04-20',
      totalAmount: 14877.613,
      totalHT: 12501.692,
      tvaAmount: 2375.321,
      timbre: 0.6,
      client: 'Stéphanie Le Baron'
    }, header(adminToken));
    assert(res.data.invoiceId);
  });

  // ─── GET INVOICES (SEARCH & FILTER) ───────
  console.log('\n📦 SEARCH & FILTER');

  await test('Get all invoices', async () => {
    const res = await axios.get(`${BASE_URL}/invoices`, header(adminToken));
    assert(res.data.length >= 2, 'Should have at least 2 invoices');
  });

  await test('Filter by status', async () => {
    const res = await axios.get(`${BASE_URL}/invoices?status=VERIFIED`, header(adminToken));
    assert(res.data.every(i => i.status === 'VERIFIED'), 'Wrong status in results');
  });

  await test('Search by company name', async () => {
    const res = await axios.get(`${BASE_URL}/invoices?search=Grenier`, header(adminToken));
    assert(res.data.length >= 1, 'Should find Grenier');
  });

  await test('Search by client name', async () => {
    const res = await axios.get(`${BASE_URL}/invoices?search=Stéphanie`, header(adminToken));
    assert(res.data.length >= 1, 'Should find Stéphanie');
  });

  await test('Filter by amount range', async () => {
    const res = await axios.get(`${BASE_URL}/invoices?amountMin=50000&amountMax=60000`, header(adminToken));
    assert(res.data.length >= 1, 'Should find invoice in range');
  });

  await test('Employee only sees own invoices', async () => {
    const res = await axios.get(`${BASE_URL}/invoices`, header(employeeToken));
    assert(res.data.length >= 1, 'Employee should see own invoices');
  });

  // ─── INVOICE DETAIL ───────────────────────
  console.log('\n📦 INVOICE DETAIL');

  await test('Get invoice by ID', async () => {
    const res = await axios.get(`${BASE_URL}/invoices/${invoiceId}`, header(employeeToken));
    assert(res.data.invoice, 'No invoice');
    assert(res.data.extractedData, 'No extracted data');
    assert(res.data.validation, 'No validation');
    assert(res.data.extractedData.companyName === 'Grenier S.A.R.L.', 'Wrong company');
    assert(res.data.extractedData.totalAmount === 53505.687, 'Wrong amount');
  });

  await test('404 for non-existent invoice', async () => {
    try {
      await axios.get(`${BASE_URL}/invoices/000000000000000000000000`, header(adminToken));
      throw new Error('Should 404');
    } catch (err) {
      assert(err.response.status === 404);
    }
  });

  // ─── EDIT EXTRACTED DATA ──────────────────
  console.log('\n📦 EDIT EXTRACTED DATA');

  await test('Edit extracted data', async () => {
    const res = await axios.put(`${BASE_URL}/invoices/${invoiceId}/extracted`, {
      client: 'Émilie Ferrand (corrected)',
      totalAmount: 53506.00
    }, header(employeeToken));
    assert(res.data.extractedData.client === 'Émilie Ferrand (corrected)', 'Client not updated');
    assert(res.data.extractedData.totalAmount === 53506, 'Amount not updated');
  });

  // ─── COMMENTS ─────────────────────────────
  console.log('\n📦 COMMENTS');

  await test('Add comment to invoice', async () => {
    const res = await axios.post(`${BASE_URL}/comments/${invoiceId}`, {
      text: 'Please verify the TVA calculation',
      type: 'NOTE'
    }, header(adminToken));
    assert(res.data.text === 'Please verify the TVA calculation');
    commentId = res.data._id;
  });

  await test('Get comments for invoice', async () => {
    const res = await axios.get(`${BASE_URL}/comments/${invoiceId}`, header(employeeToken));
    assert(res.data.length >= 1, 'Should have at least 1 comment');
  });

  await test('Delete comment', async () => {
    const res = await axios.delete(`${BASE_URL}/comments/remove/${commentId}`, header(adminToken));
    assert(res.data.message === 'Comment deleted');
  });

  // ─── WORKFLOW (APPROVAL) ──────────────────
  console.log('\n📦 WORKFLOW');

  await test('Approve invoice', async () => {
    const res = await axios.post(`${BASE_URL}/workflow/${invoiceId}/approve`, {
      decision: 'APPROVED',
      notes: 'Looks good'
    }, header(adminToken));
    assert(res.data.invoice.status === 'APPROVED', 'Not approved');
  });

  await test('Cannot edit approved invoice', async () => {
    try {
      await axios.put(`${BASE_URL}/invoices/${invoiceId}/extracted`, {
        client: 'Should fail'
      }, header(employeeToken));
      throw new Error('Should fail');
    } catch (err) {
      assert(err.response.status === 400);
    }
  });

  await test('Cannot delete approved invoice', async () => {
    try {
      await axios.delete(`${BASE_URL}/invoices/${invoiceId}`, header(adminToken));
      throw new Error('Should fail');
    } catch (err) {
      assert(err.response.status === 400);
    }
  });

  // ─── NOTIFICATIONS ────────────────────────
  console.log('\n📦 NOTIFICATIONS');

  await test('Get notifications', async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, header(adminToken));
    assert(res.data.notifications !== undefined, 'No notifications array');
    assert(res.data.unreadCount !== undefined, 'No unread count');
  });

  await test('Mark all as read', async () => {
    const res = await axios.put(`${BASE_URL}/notifications/read-all`, {}, header(adminToken));
    assert(res.data.message === 'All notifications marked as read');
  });

  // ─── AUDIT TRAIL ──────────────────────────
  console.log('\n📦 AUDIT TRAIL');

  await test('Get audit trail for invoice', async () => {
    const res = await axios.get(`${BASE_URL}/audit/${invoiceId}`, header(adminToken));
    assert(res.data.length >= 1, 'Should have audit logs');
    assert(res.data[0].action, 'Log should have action');
  });

  await test('Get all audit logs (admin)', async () => {
    const res = await axios.get(`${BASE_URL}/audit?page=1&limit=10`, header(adminToken));
    assert(res.data.logs, 'No logs array');
    assert(res.data.pagination, 'No pagination');
    assert(res.data.pagination.total >= 1, 'Should have logs');
  });

  await test('Employee cannot access all audit logs', async () => {
    try {
      await axios.get(`${BASE_URL}/audit?page=1`, header(employeeToken));
      throw new Error('Should be forbidden');
    } catch (err) {
      assert(err.response.status === 403);
    }
  });

  // ─── BUDGET ───────────────────────────────
  console.log('\n📦 BUDGET');

  await test('Set monthly budget', async () => {
    const now = new Date();
    const res = await axios.post(`${BASE_URL}/budget`, {
      monthlyLimit: 100000,
      alertThreshold: 80,
      year: now.getFullYear(),
      month: now.getMonth() + 1
    }, header(adminToken));
    assert(res.data.monthlyLimit === 100000, 'Wrong limit');
  });

  await test('Get budget status', async () => {
    const now = new Date();
    const res = await axios.get(`${BASE_URL}/budget/status?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, header(employeeToken));
    assert(res.data.budget, 'No budget data');
    assert(res.data.percentage !== undefined, 'No percentage');
    assert(res.data.status, 'No status');
  });

  // ─── ANALYTICS ────────────────────────────
  console.log('\n📦 ANALYTICS');

  await test('Get dashboard stats', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/dashboard`, header(adminToken));
    assert(res.data.totalExpenses !== undefined, 'No totalExpenses');
    assert(res.data.totalInvoices !== undefined, 'No totalInvoices');
    assert(res.data.pendingCount !== undefined, 'No pendingCount');
    assert(res.data.topVendors, 'No topVendors');
    assert(res.data.statusCounts, 'No statusCounts');
  });

  await test('Get monthly stats', async () => {
    const res = await axios.get(`${BASE_URL}/analytics/monthly?year=2026`, header(adminToken));
    assert(res.data.year === 2026, 'Wrong year');
    assert(res.data.data.length === 12, 'Should have 12 months');
  });

  await test('Employee cannot access analytics', async () => {
    try {
      await axios.get(`${BASE_URL}/analytics/dashboard`, header(employeeToken));
      throw new Error('Should be forbidden');
    } catch (err) {
      assert(err.response.status === 403);
    }
  });

  // ─── USER MANAGEMENT ──────────────────────
  console.log('\n📦 USER MANAGEMENT');

  await test('Get all users (admin)', async () => {
    const res = await axios.get(`${BASE_URL}/users`, header(adminToken));
    assert(res.data.length >= 2, 'Should have at least 2 users');
  });

  await test('Get user stats', async () => {
    const res = await axios.get(`${BASE_URL}/users/stats`, header(adminToken));
    assert(res.data.length >= 1, 'Should have stats');
    assert(res.data[0].totalInvoices !== undefined, 'No totalInvoices');
    assert(res.data[0].approvalRate !== undefined, 'No approvalRate');
  });

  await test('Change user role', async () => {
    const res = await axios.put(`${BASE_URL}/users/${employeeId}/role`, {
      role: 'MANAGER'
    }, header(adminToken));
    assert(res.data.role === 'MANAGER', 'Role not changed');
  });

  await test('Employee cannot manage users', async () => {
    // First change back to employee for this test
    await axios.put(`${BASE_URL}/users/${employeeId}/role`, { role: 'EMPLOYEE' }, header(adminToken));
    try {
      await axios.get(`${BASE_URL}/users`, header(employeeToken));
      throw new Error('Should be forbidden');
    } catch (err) {
      assert(err.response.status === 403);
    }
  });

  // ─── EXPORT ───────────────────────────────
  console.log('\n📦 EXPORT');

  await test('Export approved invoices as CSV', async () => {
    const res = await axios.get(`${BASE_URL}/invoices/export?status=APPROVED`, header(adminToken));
    assert(res.headers['content-type'].includes('text/csv'), 'Not CSV');
    assert(res.data.includes('Invoice Number'), 'Missing CSV headers');
    assert(res.data.includes('FAC-TEST-001'), 'Missing invoice data');
  });

  // ─── DELETE ───────────────────────────────
  console.log('\n📦 DELETE');

  // Create a deletable invoice first
  let deletableId;
  await test('Create invoice for deletion test', async () => {
    const res = await axios.post(`${BASE_URL}/invoices/manual`, {
      companyName: 'Delete Me Inc.',
      invoiceNumber: 'FAC-DELETE-001',
      totalAmount: 100
    }, header(adminToken));
    deletableId = res.data.invoiceId;
  });

  await test('Delete invoice', async () => {
    const res = await axios.delete(`${BASE_URL}/invoices/${deletableId}`, header(adminToken));
    assert(res.data.message === 'Invoice deleted successfully');
  });

  await test('Deleted invoice returns 404', async () => {
    try {
      await axios.get(`${BASE_URL}/invoices/${deletableId}`, header(adminToken));
      throw new Error('Should 404');
    } catch (err) {
      assert(err.response.status === 404);
    }
  });

  // ──────────────────────────────────────────────
  // CLEANUP & RESULTS
  // ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log(`\n🏁 RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Your backend is production-ready!\n');
  } else {
    console.log(`⚠️  ${failed} test(s) need attention.\n`);
  }

  // Cleanup test users
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartfacture');
    await mongoose.connection.db.collection('users').deleteMany({ email: { $in: ['admin_test@smartfacture.com', 'employee_test@smartfacture.com'] } });
    await mongoose.connection.db.collection('invoices').deleteMany({ fileUrl: 'MANUAL_ENTRY' });
    await mongoose.connection.db.collection('extracteddatas').deleteMany({});
    await mongoose.connection.db.collection('validationresults').deleteMany({});
    await mongoose.connection.db.collection('auditlogs').deleteMany({});
    await mongoose.connection.db.collection('notifications').deleteMany({});
    await mongoose.connection.db.collection('comments').deleteMany({});
    await mongoose.connection.db.collection('budgets').deleteMany({});
    await mongoose.disconnect();
    console.log('🧹 Test data cleaned up.\n');
  } catch (e) {
    console.log('⚠️  Cleanup skipped (DB not available locally). Clean manually if needed.\n');
  }
}

runTests().catch(err => {
  console.error('\n💥 FATAL ERROR:', err.message);
  process.exit(1);
});

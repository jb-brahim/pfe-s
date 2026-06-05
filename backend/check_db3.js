require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Invoice = require('./src/models/Invoice');
const { getTeamUserIds } = require('./src/utils/tenant');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const user = await User.findOne({ email: 'sarratagg@gmail.com' });
    console.log('User role:', user.role);
    
    const teamUserIds = await getTeamUserIds(user);
    console.log('Team User IDs:', teamUserIds);
    
    const userInvoices = await Invoice.countDocuments({ userId: user._id });
    console.log('Invoices specifically created by user:', userInvoices);
    
    const teamInvoices = await Invoice.countDocuments({ userId: { $in: teamUserIds } });
    console.log('Invoices in entire team:', teamInvoices);
    
    const allInvoices = await Invoice.countDocuments();
    console.log('Total invoices in entire DB:', allInvoices);
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});

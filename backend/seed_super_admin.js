const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected.');

    const email = 'superadmin@admin.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Super Admin already exists.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('SuperSecretPassword123!', salt);

      const superAdmin = new User({
        name: 'System Super Admin',
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
        companyDetails: {
          name: 'System Platform'
        }
      });

      await superAdmin.save();
      console.log('Super Admin account created successfully: superadmin@admin.com');
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedSuperAdmin();

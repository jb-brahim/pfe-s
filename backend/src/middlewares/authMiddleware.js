const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for n8n API Key (Automated Email Ingestion)
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === (process.env.N8N_API_KEY || 'n8n-secret-api-key-123')) {
    try {
      let botUser = await User.findOne({ email: 'n8n-bot@system.com' });
      if (!botUser) {
        botUser = await User.create({
          name: 'n8n Automated Ingestion',
          email: 'n8n-bot@system.com',
          passwordHash: 'automation_no_password_login',
          role: 'ADMIN'
        });
      } else if (botUser.role !== 'ADMIN') {
        botUser.role = 'ADMIN';
        await botUser.save();
      }
      req.user = botUser;
      return next();
    } catch (err) {
      console.error('Bot user auth error:', err);
      return res.status(500).json({ message: 'Internal Server Error during bot authentication' });
    }
  }

  // 2. Standard JWT Bearer Authentication (Frontend Web App)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

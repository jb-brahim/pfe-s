const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

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

  // 2. Standard JWT Bearer Authentication (Frontend Web App) OR User API Key
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Check if it's an API Key (starts with sk_live_)
      if (token.startsWith('sk_live_')) {
        const user = await User.findOne({ 'apiKeys.key': token }).select('-passwordHash');
        if (!user) {
          return res.status(401).json({ message: 'Invalid API Key' });
        }
        req.user = user;
        return next();
      }

      // Otherwise it's a JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      // Check Maintenance Mode
      const settings = await SystemSettings.findOne();
      if (settings && settings.maintenanceMode && req.user.role !== 'SUPER_ADMIN') {
        return res.status(503).json({ message: 'Platform under maintenance', maintenance: true });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 3. Check for x-api-key header containing user API Key
  const userApiKey = req.headers['x-api-key'];
  if (userApiKey && userApiKey.startsWith('sk_live_')) {
    try {
      const user = await User.findOne({ 'apiKeys.key': userApiKey }).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ message: 'Invalid API Key' });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error during API Key validation' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const apiKeyProtect = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'API Key missing' });
  }

  try {
    const user = await User.findOne({ 'apiKeys.key': apiKey });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }

    req.user = user;

    // Check Maintenance Mode
    const settings = await SystemSettings.findOne();
    if (settings && settings.maintenanceMode && req.user.role !== 'SUPER_ADMIN') {
      return res.status(503).json({ success: false, message: 'Platform under maintenance', maintenance: true });
    }

    next();
  } catch (error) {
    console.error('API Key validation error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { protect, apiKeyProtect };

const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  
  // Write error to log file for debugging
  fs.appendFileSync(path.join(__dirname, '../../error.log'), `[${new Date().toISOString()}] ${req.method} ${req.url}\n${err.stack}\n\n`);

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[RoleAuth] Checking email: ${req.user?.email}, role: ${req.user?.role}, required:`, roles);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`[RoleAuth] Access Denied for role: ${req.user?.role}`);
      return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { authorize };

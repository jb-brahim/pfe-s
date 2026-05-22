const User = require('../models/User');

const getTeamUserIds = async (user) => {
  if (!user) return [];
  const rootAdminId = user.managedBy || user._id;
  const teamUsers = await User.find({
    $or: [{ _id: rootAdminId }, { managedBy: rootAdminId }]
  }).select('_id');
  return teamUsers.map(u => u._id);
};

module.exports = {
  getTeamUserIds
};

const { 
  findAllUsers, 
  updateUser,
  updateUserProfile,
  findUserById,
  getUserStatistics,
  getUserWithoutPassword
} = require('../models/User');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
  const users = await findAllUsers();
  return users;
};

const updateUserById = async (userId, updateData) => {
  const { full_name, email, role } = updateData;

  const updated = await updateUser(userId, { full_name, email, role });
  if (!updated) {
    throw new Error('User not found or update failed');
  }

  return { message: 'User updated successfully' };
};

const updateUserProfileById = async (userId, updateData) => {
  const { full_name, email, password } = updateData;

  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const profileData = { full_name, email };
  
  if (password && password.trim() !== '') {
    const salt = await bcrypt.genSalt(10);
    profileData.password = await bcrypt.hash(password, salt);
  }
  
  const updated = await updateUserProfile(userId, profileData);
  if (!updated) {
    throw new Error('Profile update failed');
  }
  
  const updatedUser = await findUserById(userId);
  return {
    message: 'Profile updated successfully',
    user: getUserWithoutPassword(updatedUser)
  };
};

const getUserStats = async () => {
  const stats = await getUserStatistics();
  return stats;
};

module.exports = {
  getAllUsers,
  updateUserById,
  updateUserProfileById,
  getUserStats
};

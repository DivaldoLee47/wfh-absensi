const { getAllUsers, updateUserById, updateUserProfileById, getUserStats } = require('../services/userService');

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateUserById(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Update user error:', error);

    if (error.message === 'User not found or update failed') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (error.message === 'Email already in use') {
      return res.status(409).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error while updating user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const result = await updateUserProfileById(userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (error.message === 'Email already in use') {
      return res.status(409).json({ message: error.message });
    }

    if (error.message === 'Profile update failed') {
      return res.status(400).json({ message: 'Profile update failed' });
    }

    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { findUserById, getUserWithoutPassword } = require('../models/User');
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(getUserWithoutPassword(user));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error while fetching user data' });
  }
};

const getUserStatistics = async (req, res) => {
  try {
    const stats = await getUserStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ message: 'Server error while fetching user statistics' });
  }
};

module.exports = {
  getAllUsers: getAllUsersController,
  updateUser,
  updateProfile,
  getCurrentUser,
  getUserStatistics
};

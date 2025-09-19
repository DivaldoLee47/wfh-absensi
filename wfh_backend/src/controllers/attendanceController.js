const {
  clockInUser,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendanceCountService,
  getAttendanceStatsByDateService,
  validatePhotoFile
} = require('../services/attendanceService');

const clockIn = async (req, res) => {
  try {
    const userId = req.user.id;

    validatePhotoFile(req.file);

    const result = await clockInUser(userId, req.file.path);
    res.status(201).json(result);
  } catch (error) {
    console.error('Clock in error:', error);

    if (error.message === 'Already clocked in today') {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === 'Photo proof is required' ||
      error.message.includes('Invalid file type') ||
      error.message.includes('File size too large')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error during clock-in' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendances = await getUserAttendance(userId);
    res.status(200).json(attendances);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error while fetching attendance' });
  }
};

const getAllAttendanceController = async (req, res) => {
  try {
    const attendances = await getAllAttendance();
    res.status(200).json(attendances);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error while fetching attendance records' });
  }
};

const getTodayAttendanceCount = async (req, res) => {
  try {
    const result = await getTodayAttendanceCountService();
    res.status(200).json(result);
  } catch (error) {
    console.error('Get today attendance count error:', error);
    res.status(500).json({ message: 'Server error while fetching today attendance count' });
  }
};

const getAttendanceStatsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const stats = await getAttendanceStatsByDateService(date);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get attendance stats by date error:', error);
    res.status(500).json({ message: 'Server error while fetching attendance statistics' });
  }
};

module.exports = {
  clockIn,
  getMyAttendance,
  getAllAttendance: getAllAttendanceController,
  getTodayAttendanceCount,
  getAttendanceStatsByDate
};

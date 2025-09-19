const {
  createAttendance,
  findAttendancesByUserId,
  findAllAttendancesWithUserDetails,
  getTodayAttendance,
  getTodayAttendanceCount,
  getAttendanceStatsByDate
} = require('../models/Attendance');

const clockInUser = async (userId, photoUrl) => {
  const todayAttendance = await getTodayAttendance(userId);
  if (todayAttendance) {
    throw new Error('Already clocked in today');
  }

  const attendanceId = await createAttendance({
    user_id: userId,
    clock_in: new Date(),
    photo_url: photoUrl
  });

  return { attendanceId, message: 'Clocked in successfully' };
};

const getUserAttendance = async (userId) => {
  const attendances = await findAttendancesByUserId(userId);
  return attendances;
};

const getAllAttendance = async () => {
  const attendances = await findAllAttendancesWithUserDetails();
  return attendances;
};

const getTodayAttendanceCountService = async () => {
  const count = await getTodayAttendanceCount();
  return { count };
};

const getAttendanceStatsByDateService = async (date) => {
  const stats = await getAttendanceStatsByDate(date);
  return stats;
};

const validatePhotoFile = (file) => {
  if (!file) {
    throw new Error('Photo proof is required');
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG and PNG are allowed');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB');
  }

  return true;
};

module.exports = {
  clockInUser,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendanceCountService,
  getAttendanceStatsByDateService,
  validatePhotoFile
};

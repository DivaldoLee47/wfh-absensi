const express = require('express');
const router = express.Router();
const { getAllAttendance, getAttendanceStatsByDate } = require('../controllers/attendanceController');
const { getAllUsers, updateUser, getUserStatistics } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

router.get('/users',
  protect,
  admin,
  asyncHandler(getAllUsers)
);

router.get('/attendance',
  protect,
  admin,
  asyncHandler(getAllAttendance)
);

router.put('/users/:id',
  protect,
  admin,
  asyncHandler(updateUser)
);

router.get('/users/statistics',
  protect,
  admin,
  asyncHandler(getUserStatistics)
);

router.get('/attendance/stats/:date',
  protect,
  admin,
  asyncHandler(getAttendanceStatsByDate)
);

module.exports = router;

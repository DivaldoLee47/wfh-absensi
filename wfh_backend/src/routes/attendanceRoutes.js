const express = require('express');
const router = express.Router();
const { clockIn, getMyAttendance, getTodayAttendanceCount } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { validateFileUpload } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { upload } = require('../config/multer');

router.post('/clock-in',
  protect,
  upload.single('photo'),
  asyncHandler(clockIn)
);

router.get('/me',
  protect,
  asyncHandler(getMyAttendance)
);

router.get('/today',
  protect,
  asyncHandler(getTodayAttendanceCount)
);

module.exports = router;

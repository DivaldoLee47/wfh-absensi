const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { updateProfile, getCurrentUser } = require('../controllers/userController');
const {
  validateFields,
  validateEmail,
  validatePassword,
  sanitizeInput
} = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register',
  protect,
  admin,
  sanitizeInput,
  validateFields(['full_name', 'email', 'password']),
  validateEmail,
  validatePassword,
  asyncHandler(register)
);

router.post('/login',
  sanitizeInput,
  validateFields(['email', 'password']),
  validateEmail,
  asyncHandler(login)
);

router.get('/me',
  protect,
  asyncHandler(getCurrentUser)
);

router.put('/profile',
  protect,
  sanitizeInput,
  validateFields(['full_name', 'email']),
  validateEmail,
  asyncHandler(updateProfile)
);

module.exports = router;

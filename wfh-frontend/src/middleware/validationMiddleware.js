const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }

    next();
  };
};

const validateEmail = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (req.body.email && !emailRegex.test(req.body.email)) {
    return res.status(400).json({
      message: 'Invalid email format'
    });
  }

  next();
};

const validatePassword = (req, res, next) => {
  const password = req.body.password;

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }
  }

  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.trim();
    }
    return str;
  };

  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = sanitizeString(req.body[key]);
    }
  });

  next();
};

const validateFileUpload = (allowedTypes, maxSize) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'File is required'
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

module.exports = {
  validateFields,
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateFileUpload
};

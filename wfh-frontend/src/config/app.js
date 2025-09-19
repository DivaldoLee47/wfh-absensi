require('dotenv').config();

const appConfig = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    uploadPath: process.env.UPLOAD_PATH || 'uploads'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
  }
};

module.exports = appConfig;

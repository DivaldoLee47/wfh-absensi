const express = require('express');
const cors = require('cors');

const appConfig = require('./config/app');
const { handleMulterError } = require('./config/multer');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);

app.use(cors(appConfig.cors));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(appConfig.upload.uploadPath));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to WFH Attendance API',
    version: '1.0.0',
    environment: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      attendance: '/api/attendance',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

app.use(notFound);

app.use(handleMulterError);

app.use(errorHandler);

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    const { closeConnection } = require('./config/database');
    await closeConnection();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;

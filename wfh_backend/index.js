require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const appConfig = require('./src/config/app');

testConnection();

const server = app.listen(appConfig.port, () => {
  console.log(`Server is running on port ${appConfig.port}`);
  console.log(`Environment: ${appConfig.nodeEnv}`);
  console.log(`API Base URL: http://localhost:${appConfig.port}/api`);
});
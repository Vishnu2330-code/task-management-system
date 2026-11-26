const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      logger.info(`=======================================================`);
      logger.info(` Task Management System API Server Running             `);
      logger.info(` Port:        ${env.port}                              `);
      logger.info(` Environment: ${env.nodeEnv}                           `);
      logger.info(` Health:      http://localhost:${env.port}/api/health   `);
      logger.info(` Client URL:  ${env.clientUrl}                         `);
      logger.info(`=======================================================`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        const { disconnectDB } = require('./src/config/db');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;


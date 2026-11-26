const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !env.isProduction) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(env.cookieSecret));

// HTTP request logging
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// General API Rate Limiting
app.use('/api', apiLimiter);

// Mount main API router
app.use('/api', routes);

// 404 Route handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter.js';

// Load environment configurations
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Setup security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow fetching uploaded service images from frontend
  })
);

// Setup CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS Policy restriction: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsers
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Ensure uploads folder exists and serve it statically
const uploadsDir = path.join(process.cwd(), process.env.UPLOADS_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Import routes
import authRouter from './routes/auth.js';
import leadsRouter from './routes/leads.js';
import staffRouter from './routes/staff.js';
import rolesRouter from './routes/roles.js';
import settingsRouter from './routes/settings.js';
import servicesRouter from './routes/services.js';
import notificationsRouter from './routes/notifications.js';
import activitiesRouter from './routes/activities.js';
import backupsRouter from './routes/backups.js';

// Bind routes to app
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/backups', backupsRouter);

// Basic health check route
app.get('/api/health', (req, res) => {
  return res.json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` Shree Sahjanand Realty API Running    `);
  console.log(` Port: ${PORT}                          `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});

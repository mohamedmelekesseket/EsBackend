import express from 'express';
import colors from 'colors';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import connectToMongooset from './config/DBconfig.js';
import commonRouter from './router/commonRouter.js';
import ownerRouter from './router/owenrRouter.js';
import adminRouter from './router/adminRouter.js';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ✅ Match Nginx proxy port
const port = process.env.PORT || 2025;

const app = express();
connectToMongooset();
app.use(cookieParser());
app.use(express.json());

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:5173',       // Dev
  'https://esseket.duckdns.org'  // Production
];

app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin'); // Helps caches handle per-origin responses
  next();
});




// ✅ Apply CORS globally (handles preflight automatically)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ Explicit preflight handler for all routes
app.options(/.*/, cors());


// ✅ Serve uploads locally (optional, Nginx already serves them)
// ✅ Debug: Log the path to see where the server looks
  const uploadsPath = path.join(__dirname, 'uploads');
  console.log(`Checking for uploads in: ${uploadsPath}`.yellow);

  // ✅ Serve uploads locally
  app.use('/uploads', express.static(uploadsPath));
// Routes
app.use('/api', commonRouter);
app.use('/api/Owner', ownerRouter);
app.use('/api/Admin', adminRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`.blue.underline);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
});

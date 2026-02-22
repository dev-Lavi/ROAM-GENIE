import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { mkdirSync } from 'fs';

import travelRoutes from './routes/travel.js';
import passportRoutes from './routes/passport.js';
import ivrRoutes from './routes/ivr.js';
import contactRoutes from './routes/contact.js';
import emergencyRoutes from './routes/emergency.js';
import scannerRoutes from './routes/scanner.js';
import warRoomRoutes from './routes/warRoom.js';

import logger from './utils/logger.js';

// Ensure logs directory exists (Winston file transports need it)
try { mkdirSync('logs', { recursive: true }); } catch { }

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// Allow Vite dev server (port 5173) and any other origin in dev.
// In production, replace '*' with your actual frontend domain.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',  // Vite preview
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ─── Request Parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Logger ────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RoamGenie Backend', timestamp: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/travel', travelRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/warroom', warRoomRoutes);

// ─── 404 Fallback ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 RoamGenie backend running on http://localhost:${PORT}`);
});

export default app;

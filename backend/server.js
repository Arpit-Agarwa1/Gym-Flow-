import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initCloudinary } from './config/cloudinary.js';
import { initFirebase } from './config/firebase.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import planRoutes from './routes/planRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import dietRoutes from './routes/dietRoutes.js';
import classRoutes from './routes/classRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'development'
        ? true
        : process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
app.set('cloudinaryReady', initCloudinary());
initFirebase();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'development'
        ? true
        : process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

/** Public uploads (profile photos) */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/integration', integrationRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
  socket.on('joinUser', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

import Notification from '../models/Notification.js';
import { sendNotificationToUser } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listMine = asyncHandler(async (req, res) => {
  const rows = await Notification.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(rows);
});

export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, message, type } = req.body;
  const io = req.app.get('io');
  const doc = await sendNotificationToUser({ userId, message, type });
  if (io) io.to(`user_${userId}`).emit('notification', doc);
  res.status(201).json(doc);
});

export const markRead = asyncHandler(async (req, res) => {
  const row = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { readStatus: true },
    { new: true }
  );
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json(row);
});

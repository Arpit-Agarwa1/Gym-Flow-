import { Router } from 'express';
import Gym from '../models/Gym.js';

const router = Router();

/** Lets new users pick a gym at signup without staff login */
router.get('/gyms', async (_req, res) => {
  const gyms = await Gym.find().select('name address').sort({ name: 1 }).lean();
  res.json(gyms);
});

export default router;

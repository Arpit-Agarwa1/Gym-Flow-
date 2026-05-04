import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveGymId } from '../utils/gymScope.js';
import { getDashboardStats } from '../services/dashboardService.js';

export const overview = asyncHandler(async (req, res) => {
  const gymId = resolveGymId(req);
  if (!gymId) return res.status(400).json({ message: 'gymId required' });
  const data = await getDashboardStats(gymId);
  res.json(data);
});

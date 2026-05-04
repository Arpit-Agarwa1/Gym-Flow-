import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadProfilePhoto } from '../services/uploadService.js';

/** Updates profile photo after multer saves file locally */
export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const cloudOk = Boolean(req.app.get('cloudinaryReady'));
  const url = await uploadProfilePhoto(req.file.path, cloudOk);
  req.user.profilePhoto = url;
  await req.user.save();
  const u = req.user.toObject();
  delete u.password;
  res.json(u);
});

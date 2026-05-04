import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';

/**
 * Uploads buffer file path to Cloudinary if configured; otherwise returns local URL path.
 */
export async function uploadProfilePhoto(localPath, cloudConfigured) {
  if (!cloudConfigured || !localPath) {
    const relative = localPath ? `/uploads/${localPath.split('/').pop()}` : '';
    return relative;
  }
  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'gymflow/profiles',
  });
  try {
    fs.unlinkSync(localPath);
  } catch {
    /* ignore */
  }
  return result.secure_url;
}

import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary is optional. If keys are missing, uploads can use multer disk / base64 elsewhere.
 */
export function initCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      'Cloudinary env vars missing — profile photo upload will skip remote hosting.'
    );
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  return true;
}

export { cloudinary };

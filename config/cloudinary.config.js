import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

// Get upload preset for unsigned uploads
const getUploadPreset = () => {
  return process.env.CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset';
};

export { cloudinary, getUploadPreset }; 
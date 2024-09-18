import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'employees', // Folder in Cloudinary where images will be stored
    format: async (req, file) => 'png', // You can change this to the desired image format
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
  },
});

export const upload = multer({ storage: storage });

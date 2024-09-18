import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from 'cloudinary-build-url'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteOncloudinary = async (url) => {
  const publicId = extractPublicId(url)
  // console.log(publicId);
 const res = await cloudinary.uploader.destroy(publicId);
 
 return res;
};

export { deleteOncloudinary };



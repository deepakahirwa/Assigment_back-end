import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Ensure the file path is valid
    if (!localFilePath) return null;

    // console.log(localFilePath);

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Log the response for debugging purposes
    // console.log(response);

    // Remove the locally stored temporary file after successful upload
    fs.unlinkSync(localFilePath);

    // Return the secure URL of the uploaded file
    return response;
  } catch (error) {
    // Remove the local file even if the upload fails
    fs.unlinkSync(localFilePath);

    // Log the error for debugging
    console.error("Cloudinary upload failed:", error);

    // You can throw the error if you want to handle it further up the call stack
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export { uploadOnCloudinary };
import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve the path to 'public/temp' dynamically
const uploadDir = path.join(process.cwd(), 'public', 'temp');

// Ensure the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(uploadDir);
    cb(null, uploadDir); // Use the resolved directory path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname + "_" + uniqueSuffix);
  }
});

export const upload = multer({
  storage: storage,
});

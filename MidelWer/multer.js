import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Change this line in your multer config file
// Change this line in your Multer config file
// Remove the leading slash to make it relative to the project root
const uploadsDir = 'uploads';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir), // Files now go to project_folder/uploads
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
export default upload;

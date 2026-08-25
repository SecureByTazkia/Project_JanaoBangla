const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ei function the thik korbe kothay file save hobe
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Ei function file er natun naam dibe jate kono duplicate conflict na hoy
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific types
const fileFilter = (req, file, cb) => {
  // Ei function check korbe file ta image naki video
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
    'video/mp4', 'video/mpeg', 'video/quicktime'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP images and MP4, MPEG, MOV videos are allowed.'), false);
  }
};

// Limits
const limits = {
  fileSize: 50 * 1024 * 1024 // 50MB max file size
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = upload;

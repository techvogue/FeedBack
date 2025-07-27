// backend/src/config/multer.js (This is the one you should keep)

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // Ensure this path is correct and cloudinary is configured

// Acceptable file formats
const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'uploads'; 


    const ext = file.mimetype.split('/')[1];
    if (!allowedFormats.includes(ext)) {
    
      throw new Error(`Only ${allowedFormats.join(', ')} formats are allowed!`);
    }

    return {
      folder: folder,
      allowed_formats: allowedFormats,
    
    };
  },
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
// backend/src/config/multer.js (This is the one you should keep)

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // Ensure this path is correct and cloudinary is configured

// Acceptable file formats - expanded to match frontend validation
const allowedFormats = [
  'jpg', 'jpeg', 'png', 'webp', 'gif', // Images
  'pdf', 'doc', 'docx', 'txt', // Documents
  'xls', 'xlsx', 'csv', // Spreadsheets
  'ppt', 'pptx' // Presentations
];

// File filter to allow multiple file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', // Images
    'application/pdf', // PDF
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/plain', // TXT
    'application/vnd.ms-excel', // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'text/csv', // CSV
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // PPTX
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Allowed types: Images (JPG, PNG, WebP, GIF), Documents (PDF, DOC, DOCX, TXT), Spreadsheets (XLS, XLSX, CSV), Presentations (PPT, PPTX)`), false);
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'feedback-uploads'; // More specific folder for feedback files

    // Get file extension
    const ext = file.mimetype.split('/')[1];
    if (!allowedFormats.includes(ext)) {
      throw new Error(`File format not supported. Allowed formats: ${allowedFormats.join(', ')}`);
    }

    return {
      folder: folder,
      allowed_formats: allowedFormats,
      resource_type: 'auto', // Let Cloudinary auto-detect resource type
      transformation: [
        // For images, you can add transformations if needed
        { quality: 'auto:good' }
      ]
    };
  },
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 5MB limit - matches frontend
  },
});

module.exports = upload;
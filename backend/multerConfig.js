const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
ensureDirectoryExists(path.join(__dirname, '../public/images/products'));
ensureDirectoryExists(path.join(__dirname, '../public/images/categories'));
ensureDirectoryExists(path.join(__dirname, '../public/images/users'));
ensureDirectoryExists(path.join(__dirname, '../public/images/banners'));

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '../public/images/';
    
    if (req.baseUrl.includes('/products')) {
      uploadPath += 'products';
    } else if (req.baseUrl.includes('/categories')) {
      uploadPath += 'categories';
    } else if (req.baseUrl.includes('/users')) {
      uploadPath += 'users';
    } else if (req.baseUrl.includes('/banners')) {
      uploadPath += 'banners';
    } else {
      uploadPath += 'uploads';
    }
    
    const fullPath = path.join(__dirname, uploadPath);
    ensureDirectoryExists(fullPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Check extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed.'));
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum is 10 files.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum is ${maxCount} files.`
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Helper function to get file URL
const getFileUrl = (filename, type = 'products') => {
  if (!filename) return null;
  return `/images/${type}/${filename}`;
};

// Helper function to get multiple file URLs
const getFileUrls = (files, type = 'products') => {
  if (!files || files.length === 0) return [];
  return files.map(file => getFileUrl(file.filename, type));
};

// Helper function to delete file
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '../public', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper function to delete multiple files
const deleteFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    deleteFile(filePath);
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  getFileUrl,
  getFileUrls,
  deleteFile,
  deleteFiles
};

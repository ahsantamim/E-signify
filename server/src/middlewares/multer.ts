// src/middleware/multer.ts
import multer from 'multer';
import { storage } from '../config/cloudinary';

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default upload;

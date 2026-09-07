import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Configuración del Cloudinary (¡Revisa que los nombres coincidan con tus .env!
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configuración del almacenamiento
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lobos-quad-rugby',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 3. Rota de upload
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ningún archivo enviado' });
    }

    // Cloudinary devuelve la URL segura en req.file.path
    const imageUrl = req.file.path;
    
    res.json({
      message: 'Imagen subida con éxito',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Error en el upload:', error); // <--- Este error es el que verás en los Logs
    res.status(500).json({ error: 'Error al hacer upload de la imagen' });
  }
});

export default router;
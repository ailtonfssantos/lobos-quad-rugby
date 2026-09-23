import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// =========================================================
// CONFIGURACIÓN DE CLOUDINARY
// =========================================================
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// =========================================================
// ALMACENAMIENTO GENERAL
// Se mantiene igual para no romper uploads existentes.
// =========================================================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lobos-quad-rugby',
    allowed_formats: [
      'jpeg',
      'jpg',
      'png',
      'webp',
    ],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =========================================================
// ALMACENAMIENTO ESPECÍFICO PARA EVENTOS
// =========================================================
const eventoStorage =
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder:
        'lobos-quad-rugby/eventos',
      allowed_formats: [
        'jpeg',
        'jpg',
        'png',
        'webp',
      ],
    },
  });

const uploadEvento = multer({
  storage: eventoStorage,
  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

// =========================================================
// UPLOAD GENERAL EXISTENTE
// =========================================================
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            'Ningún archivo enviado',
        });
      }

      const imageUrl =
        req.file.path;

      res.json({
        message:
          'Imagen subida con éxito',
        url: imageUrl,
        filename:
          req.file.filename,
      });
    } catch (error) {
      console.error(
        '❌ Error en el upload:',
        error
      );

      res.status(500).json({
        error:
          'Error al hacer upload de la imagen',
      });
    }
  }
);

// =========================================================
// UPLOAD ESPECÍFICO PARA EVENTOS
// POST /api/upload/evento
// =========================================================
router.post(
  '/evento',
  authMiddleware,
  uploadEvento.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            'Ninguna imagen enviada',
        });
      }

      res.status(201).json({
        message:
          'Imagen del evento subida con éxito',
        url: req.file.path,
        publicId:
          req.file.filename || null,
      });
    } catch (error) {
      console.error(
        '❌ Error en el upload del evento:',
        error
      );

      res.status(500).json({
        error:
          'Error al subir la imagen del evento',
      });
    }
  }
);

export default router;
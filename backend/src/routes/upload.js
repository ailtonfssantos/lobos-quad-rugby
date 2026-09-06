import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configuração do armazenamento no Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lobos-quad-rugby', // Cria uma pasta organizada no seu Cloudinary
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
  },
});

// 3. Configuração do Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

// 4. Rota de upload (protegida por auth)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // O Cloudinary já retorna a URL HTTPS segura em req.file.path
    const imageUrl = req.file.path;
    
    res.json({
      message: 'Imagem enviada com sucesso',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

export default router;
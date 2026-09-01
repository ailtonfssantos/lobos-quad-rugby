import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// 1. Rota PÚBLICA: Qualquer pessoa pode se inscrever
// ==========================================
router.post('/', async (req, res) => {
  try {
    const novaInscricao = await prisma.inscricao.create({
      data: req.body
    });
    
    res.status(201).json({ 
      message: 'Inscripción recibida con éxito',
      data: novaInscricao 
    });
  } catch (error) {
    console.error('Error al crear inscripción:', error);
    res.status(500).json({ error: 'Error al procesar la inscripción' });
  }
});

// ==========================================
// 2. Rotas PROTEGIDAS: Apenas o Admin pode acessar
// ==========================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const inscricoes = await prisma.inscricao.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscricoes);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar inscripciones' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const atualizada = await prisma.inscricao.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(atualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar inscripción' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inscricao.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Inscripción eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar inscripción' });
  }
});

export default router;
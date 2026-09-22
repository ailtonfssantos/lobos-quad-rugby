import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// LISTAR PREMIOS Y RECONOCIMIENTOS
// Público
// ==========================================
router.get('/', async (req, res) => {
  try {
    const premios = await prisma.premioReconocimiento.findMany({
      orderBy: { ano: 'desc' }
    });

    res.json(premios);
  } catch (error) {
    console.error('Error al buscar premios:', error);

    res.status(500).json({
      error: 'Error al buscar premios y reconocimientos'
    });
  }
});

// ==========================================
// CREAR PREMIO / RECONOCIMIENTO
// Protegido
// ==========================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      ano,
      valor,
      entidad,
      premio,
      descripcion,
      logo
    } = req.body;

    if (!ano || !valor || !entidad || !premio) {
      return res.status(400).json({
        error: 'Los campos año, importe, entidad y premio son obligatorios'
      });
    }

    const nuevo = await prisma.premioReconocimiento.create({
      data: {
        ano: parseInt(ano),
        valor,
        entidad,
        premio,
        descripcion: descripcion || null,
        logo: logo || null
      }
    });

    res.status(201).json(nuevo);

  } catch (error) {
    console.error('Error al crear premio:', error);

    res.status(500).json({
      error: 'Error al crear premio o reconocimiento',
      details: error.message
    });
  }
});

// ==========================================
// ACTUALIZAR PREMIO / RECONOCIMIENTO
// Protegido
// ==========================================
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      ano,
      valor,
      entidad,
      premio,
      descripcion,
      logo
    } = req.body;

    if (!ano || !valor || !entidad || !premio) {
      return res.status(400).json({
        error: 'Los campos año, importe, entidad y premio son obligatorios'
      });
    }

    const actualizado = await prisma.premioReconocimiento.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ano: parseInt(ano),
        valor,
        entidad,
        premio,
        descripcion: descripcion || null,
        logo: logo || null
      }
    });

    res.json(actualizado);

  } catch (error) {
    console.error('Error al actualizar premio:', error);

    res.status(500).json({
      error: 'Error al actualizar premio o reconocimiento',
      details: error.message
    });
  }
});

// ==========================================
// ELIMINAR PREMIO / RECONOCIMIENTO
// Protegido
// ==========================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.premioReconocimiento.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    res.json({
      message: 'Premio o reconocimiento eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar premio:', error);

    res.status(500).json({
      error: 'Error al eliminar premio o reconocimiento'
    });
  }
});

export default router;
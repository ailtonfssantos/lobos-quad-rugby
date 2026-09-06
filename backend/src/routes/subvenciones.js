import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// GET: Listar todas
router.get('/', async (req, res) => {
  try {
    const subvenciones = await prisma.subvencion.findMany({ orderBy: { ano: 'desc' } });
    res.json(subvenciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar subvenciones' });
  }
});

// POST: Criar nova
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { ano, valor, entidad, fechaConcesion, tipo, ambito, departamento, convocatoria, basesLink } = req.body;
    const nueva = await prisma.subvencion.create({
      data: { 
        ano: parseInt(ano), valor, entidad, fechaConcesion, tipo, ambito, departamento, convocatoria, basesLink 
      }
    });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subvención', details: error.message });
  }
});

// PUT: Atualizar
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { ano, valor, entidad, fechaConcesion, tipo, ambito, departamento, convocatoria, basesLink } = req.body;
    const actualizada = await prisma.subvencion.update({
      where: { id: parseInt(id) },
      data: { ano: parseInt(ano), valor, entidad, fechaConcesion, tipo, ambito, departamento, convocatoria, basesLink }
    });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar', details: error.message });
  }
});

// DELETE: Eliminar
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.subvencion.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

export default router;
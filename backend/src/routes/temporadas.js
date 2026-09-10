import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// ✅ GET PÚBLICO: Cualquiera puede ver las temporadas
router.get('/', async (req, res) => {
  try {
    const temporadas = await prisma.temporada.findMany({
      orderBy: { dataInicio: 'desc' }
    });
    res.json(temporadas);
  } catch (error) {
    console.error('Error al obtener temporadas:', error);
    res.status(500).json({ error: 'Error al obtener temporadas' });
  }
});

// ✅ POST PROTEGIDO: Solo admins pueden crear
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, dataInicio, dataFim } = req.body;

    // Validación básica (sin saldo ni cuota por ahora)
    if (!nome || !dataInicio || !dataFim) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const temporada = await prisma.temporada.create({
      data: {
        nome,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        saldoInicial: 0, // Valor por defecto hasta que se implemente
        cuotaMensual: 0, // Valor por defecto hasta que se implemente
        estado: 'ACTIVA'
      }
    });

    res.status(201).json(temporada);
  } catch (error) {
    console.error('Error al crear temporada:', error);
    res.status(500).json({ error: 'Error al crear temporada' });
  }
});

// ✅ PUT PROTEGIDO: Actualizar temporada (Editar o Archivar)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, dataInicio, dataFim, estado } = req.body;

    const temporada = await prisma.temporada.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
        estado
      }
    });

    res.json(temporada);
  } catch (error) {
    console.error('Error al actualizar temporada:', error);
    res.status(500).json({ error: 'Error al actualizar temporada' });
  }
});

// ✅ DELETE PROTEGIDO: Eliminar temporada
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.temporada.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Temporada eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar temporada:', error);
    res.status(500).json({ error: 'Error al eliminar temporada' });
  }
});

export default router;
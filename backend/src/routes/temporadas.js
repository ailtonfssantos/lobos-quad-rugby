import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// GET: Listar todas as temporadas
router.get('/', authMiddleware, async (req, res) => {
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

// POST: Criar nova temporada
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, saldoInicial, cuotaMensual } = req.body;

    // Validação básica
    if (!nome || !dataInicio || !dataFim || !cuotaMensual) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const temporada = await prisma.temporada.create({
      data: {
        nome,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        saldoInicial: parseFloat(saldoInicial) || 0,
        cuotaMensual: parseFloat(cuotaMensual),
        estado: 'ACTIVA'
      }
    });

    res.status(201).json(temporada);
  } catch (error) {
    console.error('Error al crear temporada:', error);
    res.status(500).json({ error: 'Error al crear temporada' });
  }
});

// PUT: Atualizar temporada (ex: mudar para FINALIZADA)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, dataInicio, dataFim, saldoInicial, cuotaMensual, estado } = req.body;

    const temporada = await prisma.temporada.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
        saldoInicial: saldoInicial !== undefined ? parseFloat(saldoInicial) : undefined,
        cuotaMensual: cuotaMensual ? parseFloat(cuotaMensual) : undefined,
        estado
      }
    });

    res.json(temporada);
  } catch (error) {
    console.error('Error al actualizar temporada:', error);
    res.status(500).json({ error: 'Error al actualizar temporada' });
  }
});

export default router;
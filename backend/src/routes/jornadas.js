import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// PÚBLICA: Obtener todas las jornadas con sus partidos
router.get('/', async (req, res) => {
  try {
    const jornadas = await prisma.jornada.findMany({
      include: { partidos: true },
      orderBy: { numero: 'asc' }
    });
    res.json(jornadas);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar jornadas' });
  }
});

// PROTEGIDA: Crear Jornada con sus partidos
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { numero, competicion, ciudad, pabellon, fechas, bannerUrl, partidos } = req.body;
    const partidosValidos = partidos.filter(p => p.rival && p.rival.trim() !== '');

    const nuevaJornada = await prisma.jornada.create({
      data: {
        numero: parseInt(numero), competicion, ciudad, pabellon, fechas, bannerUrl: bannerUrl || null, isActive: true,
        partidos: {
          create: partidosValidos.map(p => ({
            rival: p.rival,
            diaSemana: p.diaSemana,
            horario: p.horario || 'TBD', // Hora exacta
            youtubeLink: p.youtubeLink || null, // Enlace de YouTube
            status: p.status || 'PROGRAMADO',
            lobosScore: p.lobosScore ? parseInt(p.lobosScore) : null,
            rivalScore: p.rivalScore ? parseInt(p.rivalScore) : null
          }))
        }
      },
      include: { partidos: true }
    });
    res.status(201).json(nuevaJornada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear jornada' });
  }
});

// PROTEGIDA: Actualizar Jornada (Inteligente: solo actualiza lo que se envía)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, competicion, ciudad, pabellon, fechas, bannerUrl, isActive, partidos } = req.body;

    // 1. Construimos el objeto de actualización dinámicamente
    const updateData = {};
    if (numero !== undefined) updateData.numero = parseInt(numero);
    if (competicion !== undefined) updateData.competicion = competicion;
    if (ciudad !== undefined) updateData.ciudad = ciudad;
    if (pabellon !== undefined) updateData.pabellon = pabellon;
    if (fechas !== undefined) updateData.fechas = fechas;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // 2. SOLO borramos y recreamos los partidos si el array 'partidos' viene explícitamente en la petición
    if (partidos !== undefined) {
      await prisma.partido.deleteMany({ where: { jornadaId: parseInt(id) } });
      const partidosValidos = partidos.filter(p => p.rival && p.rival.trim() !== '');
      
      updateData.partidos = {
        create: partidosValidos.map(p => ({
          rival: p.rival,
          diaSemana: p.diaSemana,
          horario: p.horario || 'TBD',
          youtubeLink: p.youtubeLink || null,
          status: p.status || 'PROGRAMADO',
          lobosScore: p.lobosScore ? parseInt(p.lobosScore) : null,
          rivalScore: p.rivalScore ? parseInt(p.rivalScore) : null
        }))
      };
    }

    // 3. Aplicamos la actualización
    const actualizada = await prisma.jornada.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { partidos: true }
    });
    
    res.json(actualizada);
  } catch (error) {
    console.error('❌ Error al actualizar jornada:', error);
    res.status(500).json({ error: 'Error al actualizar jornada', details: error.message });
  }
});

// PROTEGIDA: Eliminar Jornada
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jornada.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Jornada eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar jornada' });
  }
});

export default router;
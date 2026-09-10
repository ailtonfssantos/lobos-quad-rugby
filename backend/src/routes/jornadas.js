import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

const normalizePartido = (p = {}) => {
  const equipoLocalNombre = p.equipoLocal?.nombre || p.equipoLocalNombre || 'Lobos Quad Rugby';
  const equipoLocalLogo = p.equipoLocal?.logo || p.equipoLocalLogo || null;
  const equipoVisitanteNombre = p.equipoVisitante?.nombre || p.equipoVisitanteNombre || p.rival || '';
  const equipoVisitanteLogo = p.equipoVisitante?.logo || p.equipoVisitanteLogo || p.rivalLogo || null;

  return {
    fecha: p.fecha || null,
    diaSemana: p.diaSemana || 'Sábado',
    horario: p.horario || 'TBD',
    equipoLocalNombre,
    equipoLocalLogo,
    equipoVisitanteNombre,
    equipoVisitanteLogo,
    youtubeLink: p.youtubeLink || p.youtube || null,
    status: p.status || 'PROGRAMADO',
    lobosScore: p.lobosScore !== undefined && p.lobosScore !== null && p.lobosScore !== '' ? parseInt(p.lobosScore) : null,
    rivalScore: p.rivalScore !== undefined && p.rivalScore !== null && p.rivalScore !== '' ? parseInt(p.rivalScore) : null
  };
};

/* =========================================================
   PUBLICA: Obtener todas las jornadas con sus partidos y temporada
========================================================= */
router.get('/', async (req, res) => {
  try {
    const jornadas = await prisma.jornada.findMany({
      include: { 
        partidos: true, 
        temporada: true // <-- Añadido para que el frontend sepa a qué temporada pertenece
      },
      orderBy: [
        { temporada: { dataInicio: 'desc' } }, // Ordenar por temporada más reciente primero
        { numero: 'asc' }
      ]
    });
    res.json(jornadas);
  } catch (error) {
    console.error('❌ Error al buscar jornadas:', error);
    res.status(500).json({ error: 'Error al buscar jornadas' });
  }
});

/* =========================================================
   PROTEGIDA: Crear Jornada
========================================================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { numero, temporadaId, competicion, ciudad, pabellon, fechas, bannerUrl, partidos } = req.body;

    if (!numero) return res.status(400).json({ error: 'El identificador de jornada es obligatorio'});
    if (!temporadaId) return res.status(400).json({ error: 'La temporada es obligatoria' });
    if (!competicion) return res.status(400).json({ error: 'La competición es obligatoria' });
    if (!ciudad) return res.status(400).json({ error: 'La ciudad es obligatoria' });
    if (!pabellon) return res.status(400).json({ error: 'El pabellón es obligatorio' });

    const partidosValidos = Array.isArray(partidos)
      ? partidos.map(normalizePartido).filter(p => p.equipoVisitanteNombre && p.equipoVisitanteNombre.trim() !== '')
      : [];

    const nuevaJornada = await prisma.jornada.create({
      data: {
        numero: numero,
        temporadaId: parseInt(temporadaId), // <-- Añadido
        competicion,
        ciudad,
        pabellon,
        fechas,
        bannerUrl: bannerUrl || null,
        isActive: true,
        partidos: {
          create: partidosValidos.map(p => ({
            rival: p.equipoVisitanteNombre,
            rivalLogo: p.equipoVisitanteLogo,
            equipoLocalNombre: p.equipoLocalNombre,
            equipoLocalLogo: p.equipoLocalLogo,
            equipoVisitanteNombre: p.equipoVisitanteNombre,
            equipoVisitanteLogo: p.equipoVisitanteLogo,
            fecha: p.fecha,
            diaSemana: p.diaSemana,
            horario: p.horario,
            youtubeLink: p.youtubeLink,
            status: p.status,
            lobosScore: p.lobosScore,
            rivalScore: p.rivalScore
          }))
        }
      },
      include: { partidos: true, temporada: true }
    });

    res.status(201).json(nuevaJornada);
  } catch (error) {
    console.error('❌ Error al crear jornada:', error);
    res.status(500).json({ error: 'Error al crear jornada', details: error.message });
  }
});

/* =========================================================
   PROTEGIDA: Actualizar Jornada
   ✅ ROTA PUT ATUALIZADA E BLINDADA
========================================================= */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, temporadaId, competicion, ciudad, pabellon, fechas, bannerUrl, isActive, partidos } = req.body;

    const updateData = {};

    // Forçar numero como string válida, nunca undefined
    if (numero !== undefined && numero !== null) {
      updateData.numero = String(numero).trim();
    }
    
    if (temporadaId !== undefined) updateData.temporadaId = parseInt(temporadaId);
    if (competicion !== undefined) updateData.competicion = competicion;
    if (ciudad !== undefined) updateData.ciudad = ciudad;
    if (pabellon !== undefined) updateData.pabellon = pabellon;
    if (fechas !== undefined) updateData.fechas = fechas;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (partidos !== undefined) {
      if (!Array.isArray(partidos)) {
        return res.status(400).json({ error: 'El campo partidos debe ser un array' });
      }

      await prisma.partido.deleteMany({ where: { jornadaId: parseInt(id) } });

      const partidosValidos = partidos
        .map(normalizePartido)
        .filter(p => p.equipoVisitanteNombre && p.equipoVisitanteNombre.trim() !== '');

      updateData.partidos = {
        create: partidosValidos.map(p => ({
          rival: p.equipoVisitanteNombre,
          rivalLogo: p.equipoVisitanteLogo,
          equipoLocalNombre: p.equipoLocalNombre,
          equipoLocalLogo: p.equipoLocalLogo,
          equipoVisitanteNombre: p.equipoVisitanteNombre,
          equipoVisitanteLogo: p.equipoVisitanteLogo,
          fecha: p.fecha,
          diaSemana: p.diaSemana,
          horario: p.horario,
          youtubeLink: p.youtubeLink,
          status: p.status,
          lobosScore: p.lobosScore,
          rivalScore: p.rivalScore
        }))
      };
    }

    const actualizada = await prisma.jornada.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { partidos: true, temporada: true }
    });

    res.json(actualizada);
  } catch (error) {
    console.error('❌ Error al actualizar jornada:', error);
    res.status(500).json({ error: 'Error al actualizar jornada', details: error.message });
  }
});

/* =========================================================
   PROTEGIDA: Eliminar Jornada
========================================================= */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jornada.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Jornada eliminada' });
  } catch (error) {
    console.error('❌ Error al eliminar jornada:', error);
    res.status(500).json({ error: 'Error al eliminar jornada', details: error.message });
  }
});

export default router;
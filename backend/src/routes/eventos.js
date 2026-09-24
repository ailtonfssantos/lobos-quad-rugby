import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();
const prisma = new PrismaClient();

// =========================================================
// PÚBLICA / ADMIN: LISTAR EVENTOS
// Admin vê todos. Público vê apenas eventos activos.
// =========================================================
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];

        if (token) {
          jwt.default.verify(token, process.env.JWT_SECRET);
          isAdmin = true;
        }
      } catch (err) {
        isAdmin = false;
      }
    }

    const whereClause = isAdmin ? {} : { isActive: true };

    const eventos = await prisma.evento.findMany({
      where: whereClause,
      include: {
        fotos: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.json(eventos);
  } catch (error) {
    console.error('❌ Error al buscar eventos:', error);
    res.status(500).json({ error: 'Error al buscar eventos' });
  }
});

// =========================================================
// PROTEGIDA: CREAR EVENTO
// =========================================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const nuevoEvento = await prisma.evento.create({
      data: {
        type: req.body.type,
        name: req.body.name,
        date: req.body.date,
        month: req.body.month,
        year: req.body.year, // ✅ CORREÇÃO: Adicionado o campo year
        day: req.body.day,
        time: req.body.time,
        location: req.body.location,
        description: req.body.description || null,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        status: 'PROGRAMADO',
      },
      include: {
        fotos: true,
      },
    });

    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error('❌ Error al crear evento:', error);
    res.status(500).json({
      error: 'Error al crear evento',
      details: error.message,
    });
  }
});

// =========================================================
// PROTEGIDA: ACTUALIZAR EVENTO
// Solo actualiza los campos enviados.
// =========================================================
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      type,
      name,
      date,
      month,
      year, // ✅ CORREÇÃO: Adicionado à desestruturação
      day,
      time,
      location,
      description,
      isPublic,
      isActive,
      status,
    } = req.body;

    console.log(`📝 Actualizando evento ${id} con:`, req.body);

    const updateData = {};

    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (date !== undefined) updateData.date = date;
    if (month !== undefined) updateData.month = month;
    if (year !== undefined) updateData.year = year; // ✅ CORREÇÃO: Salva o ano no banco
    if (day !== undefined) updateData.day = day;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'FINALIZADO') {
        updateData.completedAt = new Date();
      }
      if (status === 'PROGRAMADO') {
        updateData.completedAt = null;
      }
    }

    const actualizado = await prisma.evento.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: {
        fotos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    console.log('✅ Evento actualizado:', actualizado);
    res.json(actualizado);
  } catch (error) {
    console.error('❌ Error al actualizar evento:', error);
    res.status(500).json({
      error: 'Error al actualizar evento',
      details: error.message,
    });
  }
});

// =========================================================
// PROTEGIDA: FINALIZAR EVENTO
// =========================================================
router.patch('/:id/finalizar', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'FINALIZADO',
        completedAt: new Date(),
      },
      include: {
        fotos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    console.log(`✅ Evento ${id} marcado como finalizado`);
    res.json(evento);
  } catch (error) {
    console.error('❌ Error al finalizar evento:', error);
    res.status(500).json({
      error: 'Error al finalizar evento',
      details: error.message,
    });
  }
});

// =========================================================
// PROTEGIDA: REACTIVAR EVENTO COMO PROGRAMADO
// =========================================================
router.patch('/:id/reabrir', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'PROGRAMADO',
        completedAt: null,
      },
      include: {
        fotos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json(evento);
  } catch (error) {
    console.error('❌ Error al reabrir evento:', error);
    res.status(500).json({
      error: 'Error al reabrir evento',
      details: error.message,
    });
  }
});

// =========================================================
// PROTEGIDA: AÑADIR FOTO A UN EVENTO
// =========================================================
router.post('/:id/fotos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, publicId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'La URL de la imagen es obligatoria' });
    }

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const foto = await prisma.eventoFoto.create({
      data: {
        url,
        publicId: publicId || null,
        eventoId: parseInt(id, 10),
      },
    });

    res.status(201).json(foto);
  } catch (error) {
    console.error('❌ Error al añadir foto al evento:', error);
    res.status(500).json({
      error: 'Error al añadir foto al evento',
      details: error.message,
    });
  }
});

// =========================================================
// PROTEGIDA: ELIMINAR FOTO
// =========================================================
router.delete('/:id/fotos/:fotoId', authMiddleware, async (req, res) => {
  try {
    const { id, fotoId } = req.params;

    const foto = await prisma.eventoFoto.findFirst({
      where: {
        id: parseInt(fotoId, 10),
        eventoId: parseInt(id, 10),
      },
    });

    if (!foto) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    if (foto.publicId) {
      try {
        await cloudinary.uploader.destroy(foto.publicId);
      } catch (cloudinaryError) {
        console.error('⚠️ Error al eliminar imagen de Cloudinary:', cloudinaryError);
      }
    }

    await prisma.eventoFoto.delete({
      where: { id: parseInt(fotoId, 10) },
    });

    res.json({ message: 'Foto eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar foto:', error);
    res.status(500).json({
      error: 'Error al eliminar foto',
      details: error.message,
    });
  }
});

// =========================================================
// PROTEGIDA: ELIMINAR EVENTO
// =========================================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Eliminando permanentemente evento ${id}`);

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id, 10) },
      include: { fotos: true },
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Eliminar imágenes de Cloudinary
    for (const foto of evento.fotos) {
      if (foto.publicId) {
        try {
          await cloudinary.uploader.destroy(foto.publicId);
        } catch (cloudinaryError) {
          console.error('⚠️ Error al eliminar imagen de Cloudinary:', cloudinaryError);
        }
      }
    }

    await prisma.evento.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Evento eliminado permanentemente' });
  } catch (error) {
    console.error('❌ Error al eliminar evento:', error);
    res.status(500).json({
      error: 'Error al eliminar evento',
      details: error.message,
    });
  }
});

export default router;
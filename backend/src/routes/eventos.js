import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// PÚBLICA: Listar eventos (Admin vê todos, público vê só ativos)
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        jwt.default.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch (err) {
        isAdmin = false;
      }
    }

    const whereClause = isAdmin ? {} : { isActive: true };

    const eventos = await prisma.evento.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });
    
    res.json(eventos);
  } catch (error) {
    console.error('❌ Error al buscar eventos:', error);
    res.status(500).json({ error: 'Error al buscar eventos' });
  }
});

// PROTEGIDA: Crear evento
router.post('/', authMiddleware, async (req, res) => {
  try {
    const nuevoEvento = await prisma.evento.create({ data: req.body });
    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error('❌ Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// PROTEGIDA: Actualizar evento (INTELIGENTE - solo actualiza lo que se envía)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, date, month, day, time, location, description, isPublic, isActive } = req.body;

    console.log(`📝 Actualizando evento ${id} con:`, req.body);

    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (date !== undefined) updateData.date = date;
    if (month !== undefined) updateData.month = month;
    if (day !== undefined) updateData.day = day;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isActive !== undefined) updateData.isActive = isActive;

    const actualizado = await prisma.evento.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    console.log('✅ Evento actualizado:', actualizado);
    res.json(actualizado);
  } catch (error) {
    console.error('❌ Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento', details: error.message });
  }
});

// PROTEGIDA: Eliminar evento (SOLO cuando se llama explícitamente)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando permanentemente evento ${id}`);
    
    await prisma.evento.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Evento eliminado permanentemente' });
  } catch (error) {
    console.error('❌ Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

export default router;
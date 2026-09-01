import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// Rota PÚBLICA: Buscar solo activos
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch (err) {
        isAdmin = false;
      }
    }

    const whereClause = isAdmin ? {} : { isActive: true };

    const jogadores = await prisma.jogador.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    
    res.json(jogadores);
  } catch (error) {
    console.error('❌ Error al buscar jugadores:', error);
    res.status(500).json({ error: 'Error al buscar jugadores' });
  }
});

// Rota PROTEGIDA: Crear jugador
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📩 Datos recibidos para crear:', req.body); // <-- Esto nos ayudará a depurar
    
    const novoJogador = await prisma.jogador.create({ 
      data: {
        ...req.body,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      }
    });
    
    res.status(201).json(novoJogador);
  } catch (error) {
    console.error('❌ Error al crear jugador (Prisma):', error);
    res.status(500).json({ error: 'Error al crear jugador', details: error.message });
  }
});

// Rota PROTEGIDA: Actualizar jugador
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const atualizado = await prisma.jogador.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(atualizado);
  } catch (error) {
    console.error('❌ Error al actualizar jugador:', error);
    res.status(500).json({ error: 'Error al actualizar jugador' });
  }
});

// Rota PROTEGIDA: Eliminar jugador (Soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jogador.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });
    res.json({ message: 'Jugador desactivado' });
  } catch (error) {
    console.error('❌ Error al desactivar jugador:', error);
    res.status(500).json({ error: 'Error al desactivar jugador' });
  }
});

export default router;
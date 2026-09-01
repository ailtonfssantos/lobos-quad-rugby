import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// Rota PÚBLICA: Inscrever-se em um evento
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, message, eventId } = req.body;

    if (!fullName || !email || !eventId) {
      return res.status(400).json({ error: 'Nombre, email y evento son obligatorios' });
    }

    // Verificar se o evento existe e é público
    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    if (!evento.isPublic) {
      return res.status(403).json({ error: 'Este evento no está abierto al público' });
    }

    const inscricao = await prisma.inscricaoEvento.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        message: message || null,
        eventId: parseInt(eventId)
      }
    });

    res.status(201).json({
      message: 'Inscripción realizada con éxito',
      data: inscricao
    });
  } catch (error) {
    console.error('Error en inscripción:', error);
    res.status(500).json({ error: 'Error al procesar la inscripción' });
  }
});

// Rota PROTEGIDA: Listar inscrições de um evento específico (para o admin)
router.get('/evento/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const inscricoes = await prisma.inscricaoEvento.findMany({
      where: { eventId: parseInt(eventId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscricoes);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar inscripciones' });
  }
});

// Rota PROTEGIDA: Listar todas as inscrições em eventos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const inscricoes = await prisma.inscricaoEvento.findMany({
      include: { evento: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscricoes);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar inscripciones' });
  }
});

// Rota PROTEGIDA: Excluir uma inscrição
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inscricaoEvento.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Inscripción eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar inscripción' });
  }
});

export default router;
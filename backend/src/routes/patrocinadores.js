import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const patrocinios = await prisma.patrocinio.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patrocinios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar patrocínios' });
  }
});

router.post('/', async (req, res) => {
  try {
    const novoPatrocinio = await prisma.patrocinio.create({
      data: req.body
    });
    res.status(201).json({ 
      message: 'Solicitação de patrocínio recebida!',
      data: novoPatrocinio 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar patrocínio' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const atualizado = await prisma.patrocinio.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar patrocínio' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patrocinio.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Patrocínio removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar patrocínio' });
  }
});

export default router;
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// GET: Listar cuotas de uma temporada específica
router.get('/temporada/:temporadaId', authMiddleware, async (req, res) => {
  try {
    const { temporadaId } = req.params;
    
    const cuotas = await prisma.cuota.findMany({
      where: { temporadaId: parseInt(temporadaId) },
      orderBy: [{ anio: 'asc' }, { mes: 'asc' }],
      include: {
        pagamentos: {
          include: { jogador: true }
        }
      }
    });

    res.json(cuotas);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ error: 'Error al obtener cuotas' });
  }
});

// POST: Gerar Cuotas Mensais e Pagamentos para uma Temporada
// Esta rota cria os registros de "Cuota" (ex: Setembro = 50€) 
// e os registros de "PagamentoCuota" para cada jogador ativo.
router.post('/generar', authMiddleware, async (req, res) => {
  try {
    const { temporadaId } = req.body;

    if (!temporadaId) {
      return res.status(400).json({ error: 'temporadaId es obligatorio' });
    }

    const temporada = await prisma.temporada.findUnique({
      where: { id: parseInt(temporadaId) }
    });

    if (!temporada) {
      return res.status(404).json({ error: 'Temporada no encontrada' });
    }

    // 1. Calcular meses entre inicio e fim da temporada
    const inicio = new Date(temporada.dataInicio);
    const fim = new Date(temporada.dataFim);
    
    let anoAtual = inicio.getFullYear();
    let mesAtual = inicio.getMonth(); // 0-11
    const anoFim = fim.getFullYear();
    const mesFim = fim.getMonth();

    const cuotasCriadas = [];

    // 2. Loop para criar cada mês da temporada
    while (anoAtual < anoFim || (anoAtual === anoFim && mesAtual <= mesFim)) {
      const mesReal = mesAtual + 1; // 1-12 para o banco
      
      // Criar a configuração da cuota para este mês
      const cuota = await prisma.cuota.create({
        data: {
          temporadaId: temporada.id,
          mes: mesReal,
          anio: anoAtual,
          importe: temporada.cuotaMensual
        }
      });

      // 3. Buscar todos os jogadores ATIVOS
      const jogadoresAtivos = await prisma.jogador.findMany({
        where: { isActive: true }
      });

      // 4. Criar um registro de PagamentoCuota para cada jogador
      const pagamentosPromises = jogadoresAtivos.map(jogador => {
        return prisma.pagamentoCuota.create({
          data: {
            jogadorId: jogador.id,
            cuotaId: cuota.id,
            temporadaId: temporada.id,
            importePago: 0,
            estado: 'PENDIENTE',
            metodoPago: null,
            dataPago: null
          }
        });
      });

      await Promise.all(pagamentosPromises);
      cuotasCriadas.push(cuota);

      // Avançar para o próximo mês
      mesAtual++;
      if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
      }
    }

    res.status(201).json({ 
      message: `Cuotas generadas correctamente para ${cuotasCriadas.length} meses.`,
      cuotas: cuotasCriadas 
    });

  } catch (error) {
    console.error('Error al generar cuotas:', error);
    res.status(500).json({ error: 'Error al generar cuotas', details: error.message });
  }
});

// PUT: Atualizar o status de um pagamento específico (ex: marcar como PAGADO)
router.put('/pago/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, importePago, metodoPago, dataPago, observacoes } = req.body;

    const pagamento = await prisma.pagamentoCuota.update({
      where: { id: parseInt(id) },
      data: {
        estado,
        importePago: importePago !== undefined ? parseFloat(importePago) : undefined,
        metodoPago,
        dataPago: dataPago ? new Date(dataPago) : undefined,
        observacoes
      },
      include: {
        cuota: true,
        jogador: true
      }
    });

    // Se o pagamento foi marcado como PAGADO, criar um Ingresso automaticamente
    // (Isso será implementado na Fase 4 para evitar duplicidade, por enquanto apenas atualizamos o status)

    res.json(pagamento);
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
});

export default router;
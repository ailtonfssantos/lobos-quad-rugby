import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.js';

// 1. Importar todas as rotas
import inscricoesRoutes from './routes/inscricoes.js';
import patrocinadoresRoutes from './routes/patrocinadores.js';
import jugadoresRoutes from './routes/jogadores.js'; // <-- Importação dos jogadores
import eventosRoutes from './routes/eventos.js';     // <-- Importação dos eventos

import jornadasRoutes from './routes/jornadas.js';

// 2. Importar middleware de autenticação
import { authMiddleware } from './middlewares/authMiddleware.js';
import inscricoesEventosRoutes from './routes/inscricoesEventos.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ==========================================
// MIDDLEWARES (Devem vir antes das rotas)
// ==========================================
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// ROTAS PÚBLICAS (Leitura para o site)
// ==========================================
app.use('/api/jogadores', jugadoresRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/jornadas', jornadasRoutes);

// ==========================================
// ROTAS PROTEGIDAS (Precisam de Token JWT)
// ==========================================
app.use('/api/inscricoes', inscricoesRoutes); // <-- Sem authMiddleware aqui
app.use('/api/patrocinadores', patrocinadoresRoutes); // <-- Sem authMiddleware aqui
app.use('/api/upload', uploadRoutes);
app.use('/api/inscricoes-eventos', inscricoesEventosRoutes);

// ==========================================
// ROTA DE TESTE (Health Check)
// ==========================================
app.get('/api', (req, res) => {
  res.json({ 
    message: '🐺 API Lobos Quad Rugby funcionando!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`\n🐺 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend permitido: ${FRONTEND_URL}\n`);
});

// Fechar conexão com o banco ao desligar
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🔌 Conexão com o banco fechada. Servidor desligado.');
  process.exit(0);
});
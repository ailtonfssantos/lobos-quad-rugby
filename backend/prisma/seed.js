// backend/prisma/seed.js (SUBSTITUIR o arquivo existente)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Iniciando seed do banco de dados...\n');

  // 1. Criar admin padrão
  const email = 'admin@lobosquadrugby.com';
  const password = 'Lobos2024!';
  
  const adminExistente = await prisma.usuario.findUnique({ where: { email } });
  
  if (!adminExistente) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin criado:', email);
  } else {
    console.log('⚠️  Admin já existe, pulando...');
  }

  // 2. Criar jogadores e staff
  const jogadores = [
    // Cuerpo Técnico y Directiva
    {
      name: 'Carlos Sanchis',
      role: 'Presidente',
      classification: '4.0',
      nationality: 'España',
      image: '/assets/carlos-sanchis.jpg',
      bio: 'Presidente del club y jugador de ataque. Líder dentro y fuera de la cancha.'
    },
    {
      name: 'Sergio Cambronero',
      role: 'Entrenador Principal',
      classification: null,
      nationality: 'España',
      image: '/assets/sergio-cambronero.jpg',
      bio: 'Entrenador principal, responsable de la estrategia y desarrollo del equipo.'
    },
    {
      name: 'Miguel Exposito',
      role: 'Capitán y 2º Entrenador',
      classification: null,
      nationality: 'España',
      image: '/assets/miguel-exposito.jpg',
      bio: 'Capitán del equipo y segundo entrenador. No compite actualmente, pero es el alma del vestuario.'
    },
    {
      name: 'Beatriz Perez',
      role: 'Asistente / Voluntaria',
      classification: null,
      nationality: 'España',
      image: '/assets/beatriz-perez.jpg',
      bio: 'Apoyo fundamental en la logística y bienestar del equipo.'
    },
    {
      name: 'Andrea Pastor',
      role: 'Asistente / Voluntaria',
      classification: null,
      nationality: 'España',
      image: '/assets/andrea-pastor.jpg',
      bio: 'Apoyo fundamental en la logística y bienestar del equipo.'
    },
    {
      name: 'Mas',
      role: 'Asistente / Voluntaria',
      classification: null,
      nationality: 'España',
      image: '/assets/mas-asistente.jpg',
      bio: 'Apoyo fundamental en la logística y bienestar del equipo.'
    },
    
    // Jugadores
    {
      name: 'Cristina Garcia',
      role: 'Defensa',
      classification: '0.5',
      nationality: 'España',
      image: '/assets/cristina-garcia.jpg',
      bio: 'Defensa con gran anticipación y lectura de juego.'
    },
    {
      name: 'Francisco Paes',
      role: 'Defensa',
      classification: '2.5',
      nationality: 'España',
      image: '/assets/francisco-paes.jpg',
      bio: 'Defensa sólido y con gran capacidad de bloqueo.'
    },
    {
      name: 'Antonio Jose Llorens (Toni)',
      role: 'Ataque',
      classification: '3.0',
      nationality: 'España',
      image: '/assets/toni-llorens.jpg',
      bio: 'Jugador de ataque con gran visión y potencia.'
    },
    {
      name: 'Jose Garcia (Pepe)',
      role: 'Ataque',
      classification: '2.0',
      nationality: 'España',
      image: '/assets/pepe-garcia.jpg',
      bio: 'Atacante rápido y con gran capacidad de maniobra.'
    },
    {
      name: 'Yuly Marcela Quiceno',
      role: 'Ataque',
      classification: '2.0',
      nationality: 'Colombia',
      image: '/assets/yuly-quiceno.jpg',
      bio: 'Jugadora internacional con gran espíritu competitivo.'
    },
    {
      name: 'Cristhian Adrian Sanches (Xamaco)',
      role: 'Defensa',
      classification: '1.5',
      nationality: 'España',
      image: '/assets/xamaco-sanches.jpg',
      bio: 'Defensa tenaz y con gran sacrificio en cada jugada.'
    },
    {
      name: 'Jairo Beses',
      role: 'Defensa',
      classification: '1.0',
      nationality: 'España',
      image: '/assets/jairo-beses.jpg',
      bio: 'Defensa con gran posicionamiento y trabajo en equipo.'
    },
    {
      name: 'Lidia Lopez',
      role: 'Defensa',
      classification: '1.0',
      nationality: 'España',
      image: '/assets/lidia-lopez.jpg',
      bio: 'Defensa con gran espíritu de equipo y resiliencia.'
    },
    {
      name: 'Erika Gonzalez',
      role: 'Defensa',
      classification: '1.5',
      nationality: 'España',
      image: '/assets/erika-gonzalez.jpg',
      bio: 'Defensa ágil y con gran capacidad de recuperación.'
    },
    {
      name: 'Ailton Santos',
      role: 'Ataque',
      classification: '4.0',
      nationality: 'Brasil',
      image: '/assets/ailton-santos.jpg',
      bio: 'Jugador de alto rendimiento, referencia en ataque.'
    }
  ];

  // Verificar se já existem jogadores
  const jogadoresExistentes = await prisma.jogador.count();
  
  if (jogadoresExistentes === 0) {
    for (const jogador of jogadores) {
      await prisma.jogador.create({
        data: {
          ...jogador,
          isActive: true
        }
      });
    }
    console.log(`✅ ${jogadores.length} jogadores/staff criados no banco de dados`);
  } else {
    console.log(`⚠️  Já existem ${jogadoresExistentes} jogadores no banco, pulando...`);
  }

  console.log('\n🎉 Seed concluído com sucesso!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
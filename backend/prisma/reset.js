import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🗑️  Limpando dados de teste...\n');

  // Limpar todas as tabelas (exceto Usuario)
  await prisma.inscricao.deleteMany();
  await prisma.patrocinio.deleteMany();
  await prisma.jogador.deleteMany();
  await prisma.evento.deleteMany();

  console.log('✅ Tabelas limpas com sucesso!');
  console.log('⚠️  Admin mantido (não foi apagado)');
  console.log('\n🎉 Agora você pode rodar "npm run prisma:seed" novamente\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
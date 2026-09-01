const fs = require('fs');
const path = require('path');

const dir = './frontend/src';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Esta expressão regular encontra 'http://localhost:4000...', "http://localhost:4000..." ou `http://localhost:4000...`
  // e substitui por `${import.meta.env.VITE_API_URL}...` mantendo o restante do caminho intacto.
  const regex = /(['"`])http:\/\/localhost:4000(.*?)\1/g;
  const replacement = '`${import.meta.env.VITE_API_URL}$2`';
  
  const newContent = content.replace(regex, replacement);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Corrigido: ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      replaceInFile(dirPath);
    }
  });
}

console.log('🔍 Procurando e corrigindo URLs...');
walkDir(dir);
console.log('🎉 Todas as URLs foram atualizadas com sucesso!');
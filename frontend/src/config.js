export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Função inteligente para corrigir URLs de imagens
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/logo1.png'; // Imagem padrão se não houver
  
  // Se já for um link completo, mas estiver apontando para localhost, corrigimos
  if (imagePath.startsWith('http')) {
    return imagePath.replace('http://localhost:10000', API_URL).replace('http://localhost:4000', API_URL);
  }
  
  // Se for um caminho relativo (ex: /uploads/foto.jpg), adicionamos a URL da API
  return `${API_URL}${imagePath}`;
};
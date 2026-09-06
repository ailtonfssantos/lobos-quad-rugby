export const API_URL = import.meta.env.VITE_API_URL || 'https://lobos-backend-g9kr.onrender.com';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/assets/logo1.png';

  // ✅ NOVO: Se for um caminho local do frontend, retorna direto (a Vercel resolve isso)
  if (imagePath.startsWith('/assets/')) {
    return imagePath;
  }

  // Se for um link externo ou do localhost antigo, corrigimos
  if (imagePath.startsWith('http')) {
    return imagePath.replace('http://localhost:10000', API_URL).replace('http://localhost:4000', API_URL);
  }

  // Fallback para caminhos relativos do backend (ex: /uploads/...)
  return `${API_URL}${imagePath}`;
};
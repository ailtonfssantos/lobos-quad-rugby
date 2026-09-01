import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: '/', label: 'Inicio' },
    { path: '/sobre-nosotros', label: 'Sobre Nosotros' },
    { path: '/equipo', label: 'Equipo' },
    { path: '/entrenamientos', label: 'Entrenamientos' },
    { path: '/competiciones', label: 'Competiciones' },
    { path: '/unete', label: 'Únete' },
  ];

  const isActive = (path) => location.pathname === path;

  // Função para rolar suavemente ao topo
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false); // Fecha o menu mobile ao clicar
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo Oficial */}
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group">
            <div className="overflow-hidden">
              <img 
                src="/assets/logo1.png"
                alt="Lobos Quad Rugby Logo" 
                className="h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl leading-none text-white tracking-wider">LOBOS</h1>
              <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">Quad Rugby</p>
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={scrollToTop}
                className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 relative py-2 ${
                  isActive(link.path)
                    ? 'text-red-500'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-300 ${
                  isActive(link.path) ? 'w-full' : 'w-0 hover:w-full'
                }`}></span>
              </Link>
            ))}
            
            {/* Botão Patrocinadores com Scroll para o topo */}
            <Link 
              to="/patrocinadores" 
              onClick={scrollToTop}
              className="px-5 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors border border-red-600"
            >
              Patrocinadores
            </Link>
          </div>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 border border-zinc-800 hover:border-red-600 transition-colors"
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile Aberto */}
        {isOpen && (
          <div className="md:hidden mt-4 py-6 space-y-4 border-t border-zinc-800 bg-zinc-950">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={scrollToTop}
                className={`block px-4 py-3 text-sm font-bold uppercase tracking-widest border-l-2 ${
                  isActive(link.path)
                    ? 'border-red-600 text-white bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-4">
              {/* Corrigido: agora vai para /patrocinadores e tem a função de scroll */}
              <Link 
                to="/patrocinadores" 
                onClick={scrollToTop}
                className="block w-full text-center px-5 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest"
              >
                Patrocinadores
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
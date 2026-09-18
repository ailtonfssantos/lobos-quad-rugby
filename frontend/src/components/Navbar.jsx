import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/', label: 'Inicio' },
  { path: '/sobre-nosotros', label: 'El Club' },
  { path: '/equipo', label: 'Equipo' },
  { path: '/entrenamientos', label: 'Entrenamientos' },
  { path: '/competiciones', label: 'Competiciones' },
  { path: '/unete', label: 'Únete' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl"
        aria-label="Navegación principal"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="h-[76px] flex items-center justify-between">

            {/* LOGO + NOMBRE */}
            <Link
              to="/"
              onClick={scrollToTop}
              className="group flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0"
              aria-label="Lobos Quad Rugby - Inicio"
            >
              {/* LOGO */}
              <div className="relative overflow-hidden shrink-0">
                <img
                  src="/assets/logo1.png"
                  alt="Lobos Quad Rugby"
                  className="h-10 sm:h-12 w-auto object-contain grayscale opacity-90 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>

              {/* NOMBRE — visible también en móvil */}
              <div className="block min-w-0">
                <div className="font-display text-[15px] sm:text-lg leading-none tracking-[0.14em] sm:tracking-[0.18em] text-white whitespace-nowrap">
                  LOBOS
                </div>

                <div className="mt-1 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-zinc-500 whitespace-nowrap">
                  Quad Rugby
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden md:flex items-center gap-7 lg:gap-9">
              {links.map((link) => {
                const active = isActive(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={scrollToTop}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative py-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${
                      active
                        ? 'text-white'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {link.label}

                    <span
                      className={`absolute bottom-0 left-0 h-px bg-red-600 transition-all duration-300 ${
                        active
                          ? 'w-full'
                          : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}

              <Link
                to="/patrocinadores"
                onClick={scrollToTop}
                className={`ml-1 inline-flex items-center gap-3 border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive('/patrocinadores')
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-red-600 bg-red-600 text-white hover:border-red-500 hover:bg-red-500'
                }`}
                aria-current={
                  isActive('/patrocinadores')
                    ? 'page'
                    : undefined
                }
              >
                Patrocinadores

                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </Link>
            </div>

            {/* MOBILE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="md:hidden relative w-10 h-10 sm:w-11 sm:h-11 border border-white/10 flex items-center justify-center text-zinc-300 transition-all duration-300 hover:border-red-600 hover:text-white shrink-0"
              aria-label={
                isOpen
                  ? 'Cerrar menú'
                  : 'Abrir menú'
              }
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              <span className="sr-only">
                {isOpen
                  ? 'Cerrar menú'
                  : 'Abrir menú'}
              </span>

              <div className="relative w-5 h-5">
                <span
                  className={`absolute left-0 top-[4px] w-5 h-px bg-current transition-all duration-300 ${
                    isOpen
                      ? 'top-[9px] rotate-45'
                      : ''
                  }`}
                />

                <span
                  className={`absolute left-0 top-[9px] w-5 h-px bg-current transition-all duration-300 ${
                    isOpen
                      ? 'opacity-0'
                      : 'opacity-100'
                  }`}
                />

                <span
                  className={`absolute left-0 top-[14px] w-5 h-px bg-current transition-all duration-300 ${
                    isOpen
                      ? 'top-[9px] -rotate-45'
                      : ''
                  }`}
                />
              </div>
            </button>
          </div>

          {/* MOBILE NAVIGATION */}
          <div
            id="mobile-navigation"
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isOpen
                ? 'max-h-[600px] opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-white/10 py-5">
              <div className="space-y-1">
                {links.map((link) => {
                  const active = isActive(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={scrollToTop}
                      aria-current={
                        active
                          ? 'page'
                          : undefined
                      }
                      className={`block border-l-2 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                        active
                          ? 'border-red-600 bg-white/[0.04] text-white'
                          : 'border-transparent text-zinc-500 hover:border-white/20 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* MOBILE SPONSORS */}
              <div className="mt-5 pt-5 border-t border-white/5">
                <Link
                  to="/patrocinadores"
                  onClick={scrollToTop}
                  className="flex items-center justify-between bg-red-600 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-500"
                >
                  <span>Patrocinadores</span>

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />
    </>
  );
}
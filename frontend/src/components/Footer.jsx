import { Link } from 'react-router-dom';

const navigationLinks = [
  { path: '/', label: 'Inicio' },
  { path: '/sobre-nosotros', label: 'El Club' },
  { path: '/equipo', label: 'Equipo' },
  { path: '/entrenamientos', label: 'Entrenamientos' },
  { path: '/competiciones', label: 'Competiciones' },
  { path: '/unete', label: 'Únete' },
  { path: '/patrocinadores', label: 'Patrocinadores' },
];

const legalLinks = [
  {
    path: '/aviso-legal',
    label: 'Aviso legal',
  },
  {
    path: '/privacidad',
    label: 'Política de Privacidad',
  },
  {
    path: '/cookies',
    label: 'Política de Cookies',
  },
];

export default function Footer() {
  /* =====================================================
     SCROLL TO TOP
  ===================================================== */

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-white/10">
      
      {/* ===================================================
          MAIN FOOTER
      =================================================== */}

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        
        <div className="py-16 lg:py-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10">

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="lg:col-span-5">
              
              <Link
                to="/"
                onClick={scrollToTop}
                className="group inline-flex items-center gap-4"
                aria-label="Lobos Quad Rugby - Inicio"
              >
                <div className="overflow-hidden">
                  <img
                    src="/assets/logo1.png"
                    alt="Lobos Quad Rugby"
                    className="h-14 w-auto object-contain grayscale opacity-90 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                </div>

                <div>
                  <h2 className="font-display text-2xl sm:text-3xl leading-none tracking-[0.12em] text-white">
                    LOBOS
                  </h2>

                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-red-500">
                    Quad Rugby · Valencia
                  </p>
                </div>
              </Link>

              <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-500">
                Club deportivo de rugby en silla de ruedas
                nacido en Valencia para competir, crecer
                y abrir camino.
              </p>

              {/* Social */}
              <div className="mt-8 flex items-center gap-3">
                
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/lobos_quad_rugby_vlc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Lobos Quad Rugby"
                  className="group flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-500 transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <svg
                    className="w-4.5 h-4.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/LobosQuadRugby/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Lobos Quad Rugby"
                  className="group flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-500 transition-all duration-300 hover:border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <svg
                    className="w-4.5 h-4.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div className="lg:col-span-3">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-6 bg-red-600" />

                <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Navegación
                </h3>
              </div>

              <nav aria-label="Navegación del pie de página">
                <ul className="space-y-3.5">
                  {navigationLinks.map(
                    (link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          onClick={scrollToTop}
                          className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 transition-colors duration-300 hover:text-white"
                        >
                          <span className="h-px w-0 bg-red-600 transition-all duration-300 group-hover:w-4" />

                          {link.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </div>

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="lg:col-span-4">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-6 bg-red-600" />

                <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Información
                </h3>
              </div>

              <div className="space-y-7">

                {/* Location */}
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-700">
                    Entrenamientos
                  </div>

                  <p className="mt-2 text-sm text-zinc-300">
                    Pabellón Playa Malvarrosa
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Valencia, España
                  </p>
                </div>

                {/* Schedule */}
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-700">
                    Horario
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-zinc-300">
                      Lunes y miércoles
                      <span className="text-zinc-600">
                        {' '}
                        ·{' '}
                      </span>
                      17:00 — 19:30
                    </p>

                    <p className="text-sm text-zinc-300">
                      Viernes
                      <span className="text-zinc-600">
                        {' '}
                        ·{' '}
                      </span>
                      10:00 — 11:30
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-700">
                    Contacto
                  </div>

                  <a
                    href="mailto:lobosqr@gmail.com"
                    className="mt-2 inline-block text-sm text-zinc-300 transition-colors hover:text-red-500"
                  >
                    lobosqr@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            CTA STRIP
        =================================================== */}

        <div className="border-t border-white/5 border-b">
          <Link
            to="/unete"
            onClick={scrollToTop}
            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-8"
          >
            <div>
              <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-red-500">
                El equipo te espera
              </div>

              <div className="mt-2 text-xl sm:text-2xl font-display font-bold uppercase tracking-wide text-white">
                ¿Quieres formar parte de Lobos?
              </div>
            </div>

            <div className="inline-flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors group-hover:text-white">
              Únete al equipo

              <span className="flex h-9 w-9 items-center justify-center border border-white/10 transition-all duration-300 group-hover:border-red-600 group-hover:bg-red-600">
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
              </span>
            </div>
          </Link>
        </div>

        {/* ===================================================
            BOTTOM BAR
        =================================================== */}

        <div className="py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Copyright */}
            <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-700">
              © 2026 Lobos Quad Rugby · Valencia, España
            </p>

            {/* Legal */}
            <nav
              aria-label="Información legal"
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {legalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={scrollToTop}
                  className="text-[8px] uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:text-zinc-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
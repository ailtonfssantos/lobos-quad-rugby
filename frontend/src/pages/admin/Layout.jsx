import { useEffect, useState } from 'react';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={path}
    />
  </svg>
);

const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Panel de Control',
    section: 'Principal',
    icon:
      'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    path: '/admin/inscripciones',
    label: 'Inscripciones',
    section: 'Gestión',
    icon:
      'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    path: '/admin/patrocinadores',
    label: 'Patrocinios',
    section: 'Gestión',
    icon:
      'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  },
  {
    path: '/admin/jugadores',
    label: 'Equipo',
    section: 'Gestión',
    icon:
      'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    path: '/admin/eventos',
    label: 'Eventos',
    section: 'Competición',
    icon:
      'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
  {
    path: '/admin/jornadas',
    label: 'Jornadas',
    section: 'Competición',
    icon:
      'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375 0 01.75 0z',
  },
  {
    path: '/admin/temporadas',
    label: 'Temporadas',
    section: 'Competición',
    icon:
      'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0',
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Autenticación inicial
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error leyendo usuario:', error);

        localStorage.removeItem('user');
        navigate('/admin/login', { replace: true });
      }
    } else {
      // Si existe token pero no usuario,
      // no dejamos el panel en estado inconsistente.
      localStorage.removeItem('token');
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Cerrar menú al cambiar de página
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Escape + bloqueo de scroll mobile
  useEffect(() => {
    if (!isSidebarOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);

    navigate('/admin/login', { replace: true });
  };

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-zinc-800 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            Cargando panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Overlay mobile */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-white/10 flex flex-col transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
        aria-label="Navegación de administración"
      >

        {/* Header */}
        <div className="relative px-6 py-6 border-b border-white/10">

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-5 right-5 w-9 h-9 flex items-center justify-center border border-white/10 text-zinc-500 hover:text-white hover:border-red-600 transition-colors"
            aria-label="Cerrar menú"
          >
            <Icon
              className="w-4 h-4"
              path="M6 18L18 6M6 6l12 12"
            />
          </button>

          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-3"
            aria-label="Panel de control"
          >
            <img
              src="/assets/logo1.png"
              alt="Lobos Quad Rugby"
              className="h-10 w-auto object-contain grayscale opacity-80"
            />

            <div>
              <div className="font-display text-lg tracking-[0.1em] text-white">
                LOBOS
              </div>

              <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-red-500">
                Administración
              </div>
            </div>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="px-3 mb-3 text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-700">
            Gestión
          </p>

          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-3 transition-all duration-200 ${
                    active
                      ? 'bg-red-600/10 text-white'
                      : 'text-zinc-500 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  {/* Indicador */}
                  <span
                    className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${
                      active
                        ? 'bg-red-600'
                        : 'bg-transparent'
                    }`}
                  />

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
                      active
                        ? 'border-red-600/30 bg-red-600/10 text-red-500'
                        : 'border-white/5 text-zinc-600 group-hover:border-white/10 group-hover:text-zinc-300'
                    }`}
                  >
                    <Icon
                      className="w-[18px] h-[18px]"
                      path={item.icon}
                    />
                  </span>

                  <span className="flex-1 text-xs font-medium">
                    {item.label}
                  </span>

                  <span
                    className={`text-[8px] font-bold tracking-widest ${
                      active
                        ? 'text-red-600'
                        : 'text-zinc-800'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">

          {/* Usuario */}
          <div className="mb-3 border border-white/5 bg-zinc-950/50 p-4">
            <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
              Sesión activa
            </p>

            <p className="mt-2 truncate text-xs text-zinc-300">
              {user.email}
            </p>
          </div>

          {/* Sitio web */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-3 py-3 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <Icon
              className="w-4 h-4"
              path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />

            <span>Ver sitio web</span>

            <svg
              className="ml-auto w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
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
          </a>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-3 py-3 text-xs text-red-500 hover:bg-red-950/20 transition-colors"
          >
            <Icon
              className="w-4 h-4"
              path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />

            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="min-h-screen md:ml-72">

        {/* Topbar mobile */}
        <header className="md:hidden sticky top-0 z-30 h-16 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-4 flex items-center">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center border border-white/10 text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
            aria-label="Abrir menú"
            aria-expanded={isSidebarOpen}
          >
            <Icon
              className="w-5 h-5"
              path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </button>

          <div className="ml-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">
              Panel de Control
            </div>

            <div className="text-[7px] uppercase tracking-[0.2em] text-zinc-700">
              Lobos Quad Rugby
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-7 lg:p-10 xl:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
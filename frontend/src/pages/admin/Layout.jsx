import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Panel de Control',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
  },
  {
    path: '/admin/inscripciones',    
    label: 'Inscripciones',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
  },
  {
    path: '/admin/patrocinadores',
    label: 'Patrocinios',
    icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z'
  },
  {
    path: '/admin/jugadores',
    label: 'Equipo',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
  },
  {
    path: '/admin/eventos',
    label: 'Eventos',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 005.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
  },
  {
    path: '/admin/jornadas',
    label: 'Jornadas',
    icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
  },
  {
    path: '/admin/temporadas',
    label: 'Temporadas',
    icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0'
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-red-600 animate-spin" />
          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">
            Cargando panel
          </p>
        </div>
      </div>
    );
  }

  const currentPage =
    menuItems.find((item) => location.pathname === item.path)?.label ||
    'Administración';

  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[270px]
          bg-[#0d0d0f] border-r border-zinc-800/80
          flex flex-col
          transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >

        {/* BRAND */}
        <div className="relative px-6 pt-7 pb-6 border-b border-zinc-800/80">

          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-700 via-red-500 to-transparent" />

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-5 right-5 p-2 text-zinc-500 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-black border border-zinc-800 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/logo1.png"
                alt="Lobos Quad Rugby"
                className="w-8 h-8 object-contain opacity-90"
              />
            </div>

            <div>
              <p className="text-white font-bold tracking-wide text-sm">
                LOBOS
              </p>
              <p className="text-zinc-600 text-[9px] uppercase tracking-[0.22em]">
                Quad Rugby
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] mb-1">
              Área privada
            </p>

            <h2 className="text-zinc-200 text-sm font-semibold tracking-wide">
              Administración
            </h2>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">

          <p className="px-3 mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Gestión
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group relative flex items-center gap-3
                    px-3.5 py-3 rounded-lg
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-red-600/10 text-white'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }
                  `}
                >

                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-red-600 rounded-full" />
                  )}

                  <span
                    className={`
                      flex items-center justify-center
                      w-8 h-8 rounded-md
                      transition-colors
                      ${
                        isActive
                          ? 'bg-red-600/10 text-red-500'
                          : 'bg-zinc-900 text-zinc-600 group-hover:text-zinc-300'
                      }
                    `}
                  >
                    <Icon path={item.icon} className="w-[18px] h-[18px]" />
                  </span>

                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* USER / FOOTER */}
        <div className="p-4 border-t border-zinc-800/80">

          <div className="flex items-center gap-3 p-3 mb-3 rounded-lg bg-zinc-900/70 border border-zinc-800/70">

            <div className="w-9 h-9 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
              <Icon
                path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                className="w-4 h-4"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                Sesión activa
              </p>

              <p className="text-zinc-300 text-xs truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800/40 rounded-lg text-xs transition-all"
          >
            <Icon
              path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              className="w-4 h-4"
            />
            Ver sitio web
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 text-red-500/80 hover:text-red-400 hover:bg-red-900/10 rounded-lg text-xs transition-all"
          >
            <Icon
              path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              className="w-4 h-4"
            />
            Cerrar sesión
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="md:ml-[270px] min-h-screen">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 bg-[#080808]/90 backdrop-blur-xl border-b border-zinc-800/70">

          <div className="h-full px-4 md:px-8 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Abrir menú"
              >
                <Icon
                  path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  className="w-5 h-5"
                />
              </button>

              <div className="hidden sm:block">
                <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em]">
                  Lobos Quad Rugby
                </p>

                <p className="text-zinc-300 text-xs font-medium mt-0.5">
                  {currentPage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Sistema operativo
              </div>

              <div className="w-px h-6 bg-zinc-800 hidden sm:block" />

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                title="Abrir sitio web"
              >
                <Icon
                  path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  className="w-5 h-5"
                />
              </a>

            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1700px]">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Icon = ({ path }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      navigate('/admin');
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  if (!user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Cargando...</div>;

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
      icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' 
    },
    { 
      path: '/admin/jornadas', 
      label: 'Jornadas', 
      icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' 
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: fixa | Mobile: deslizante */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full md:relative md:translate-x-0 transition-transform duration-300 z-50 -translate-x-full md:translate-x-0">
        {/* Botão Fechar Mobile */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
        >
          <Icon path="M6 18L18 6M6 6l12 12" />
        </button>

        <div className="p-6 border-b border-zinc-800">
          <img src="/assets/logo1.png" alt="Lobos" className="h-10 mb-3 grayscale opacity-80" />
          <h2 className="font-display text-lg text-white tracking-wide">PANEL DE CONTROL</h2>
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mt-1">Lobos Quad Rugby</p>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600/10 text-red-500 border-l-2 border-red-600'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon path={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-3">
          <div className="px-4 py-2">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Conectado como</p>
            <p className="text-zinc-300 text-sm truncate">{user.email}</p>
          </div>
          
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <Icon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            Ver Sitio Web
          </a>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-900/20 rounded-md text-sm font-medium transition-colors"
          >
            <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal - EXATAMENTE como estava */}
      <main className="flex-grow ml-64 p-8 md:p-12 overflow-auto">
        {/* Botão Menu Mobile */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 hover:text-white"
        >
          <Icon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </button>

        <Outlet />
      </main>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    inscripcionesPendientes: 0,
    patrociniosPendientes: 0,
    jugadoresActivos: 0,
    jugadoresHistorico: 0,
    eventosActivos: 0,
    eventosHistorico: 0,
    jornadasActivas: 0,
    jornadasHistorico: 0,
    proximaJornada: null
  });
  const [subvencionesResumen, setSubvencionesResumen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL}/api/patrocinadores`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL}/api/jogadores`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL}/api/eventos`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL}/api/jornadas`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${import.meta.env.VITE_API_URL}/api/subvenciones`, { headers }).then(r => r.json()).catch(() => [])
    ]).then(([inscripciones, patrocinios, jugadores, eventos, jornadas, subvenciones]) => {
      
      const jornadasArray = Array.isArray(jornadas) ? jornadas : [];

      // ✅ CORRECCIÓN: Usar el estado de la Temporada como fuente de verdad
      const activeJornadas = jornadasArray.filter(j => j.temporada?.estado === 'ACTIVA');
      const historicJornadas = jornadasArray.filter(j => j.temporada?.estado === 'FINALIZADA' || j.isActive === false);
      
      // Ordena por número para pegar a próxima (a de menor número entre as ativas)
      const nextJornada = activeJornadas.length > 0 
        ? activeJornadas.sort((a, b) => a.numero - b.numero)[0] 
        : null;

      setStats({
        inscripcionesPendientes: Array.isArray(inscripciones) ? inscripciones.filter(i => i.status === 'PENDIENTE').length : 0,
        patrociniosPendientes: Array.isArray(patrocinios) ? patrocinios.filter(p => p.status === 'PENDIENTE').length : 0,
        jugadoresActivos: Array.isArray(jugadores) ? jugadores.filter(j => j.isActive).length : 0,
        jugadoresHistorico: Array.isArray(jugadores) ? jugadores.filter(j => !j.isActive).length : 0,
        eventosActivos: Array.isArray(eventos) ? eventos.filter(e => e.isActive).length : 0,
        eventosHistorico: Array.isArray(eventos) ? eventos.filter(e => !e.isActive).length : 0,
        jornadasActivas: activeJornadas.length,
        jornadasHistorico: historicJornadas.length,
        proximaJornada: nextJornada
      });

      // Lógica de resumo de subvenções
      const summaries = {};
      (Array.isArray(subvenciones) ? subvenciones : []).forEach(sub => {
        const year = sub.ano;
        if (!summaries[year]) summaries[year] = { count: 0, total: 0 };
        summaries[year].count += 1;
        
        const valStr = String(sub.valor).trim();
        let numericValue = 0;
        if (valStr.includes(',')) {
          numericValue = parseFloat(valStr.replace(/\./g, '').replace(',', '.'));
        } else {
          numericValue = parseFloat(valStr);
        }
        
        if (!isNaN(numericValue)) summaries[year].total += numericValue;
      });

      const resumenFormatado = Object.keys(summaries).sort((a, b) => b - a).map(year => ({
        year,
        count: summaries[year].count,
        total: new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summaries[year].total)
      }));

      setSubvencionesResumen(resumenFormatado);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Cargando datos del panel...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-white mb-2">Panel de Control</h1>
        <p className="text-zinc-500 text-sm">Visión general de las operaciones del Lobos Quad Rugby.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Inscripciones Pendientes */}
        <Link to="/admin/inscripciones" className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-red-600/50 transition-colors duration-300 group">
          <div className="p-3 rounded-sm bg-red-500/10 group-hover:bg-red-500/20 transition-colors w-fit mb-4">
            <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-2">Inscripciones Pendientes</p>
          <p className="font-display text-4xl text-white">{stats.inscripcionesPendientes}</p>
        </Link>

        {/* 2. Solicitudes de Patrocinio */}
        <Link to="/admin/patrocinadores" className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-yellow-600/50 transition-colors duration-300 group">
          <div className="p-3 rounded-sm bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors w-fit mb-4">
            <Icon path="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-2">Solicitudes Pendientes</p>
          <p className="font-display text-4xl text-white">{stats.patrociniosPendientes}</p>
        </Link>

        {/* 3. Jugadores */}
        <Link to="/admin/jugadores" className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-zinc-600 transition-colors duration-300 group">
          <div className="p-3 rounded-sm bg-zinc-800 group-hover:bg-zinc-700 transition-colors w-fit mb-4">
            <Icon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" className="w-6 h-6 text-zinc-100" />
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-2">Jugadores</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-4xl text-green-500">{stats.jugadoresActivos}</p>
            <p className="text-zinc-500 text-sm">activos</p>
          </div>
          <p className="text-zinc-600 text-xs mt-1">{stats.jugadoresHistorico} en histórico</p>
        </Link>

        {/* 4. Eventos */}
        <Link to="/admin/eventos" className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-blue-600/50 transition-colors duration-300 group">
          <div className="p-3 rounded-sm bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors w-fit mb-4">
            <Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-2">Eventos</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-4xl text-blue-500">{stats.eventosActivos}</p>
            <p className="text-zinc-500 text-sm">activos</p>
          </div>
          <p className="text-zinc-600 text-xs mt-1">{stats.eventosHistorico} en histórico</p>
        </Link>

        {/* 5. Jornadas (CORREGIDO) */}
        <Link to="/admin/jornadas" className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-purple-600/50 transition-colors duration-300 group md:col-span-2 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-sm bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Icon path="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-2">Jornadas de Competición</p>
          
          {/* ✅ Ahora muestra las activas y las del histórico correctamente */}
          <div className="flex items-baseline gap-2 mb-1">
            <p className="font-display text-4xl text-purple-500">{stats.jornadasActivas}</p>
            <p className="text-zinc-500 text-sm">activas</p>
          </div>
          <p className="text-zinc-600 text-xs mb-3">{stats.jornadasHistorico} en histórico</p>
          
          {stats.proximaJornada ? (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Próxima jornada</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">Jornada {stats.proximaJornada.numero}</p>
                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                  {stats.proximaJornada.ciudad}
                </span>
              </div>
              <p className="text-zinc-500 text-xs mt-1">{stats.proximaJornada.fechas}</p>
            </div>
          ) : (
            <p className="text-zinc-600 text-xs mt-3 italic">No hay jornadas activas programadas.</p>
          )}
        </Link>

        {/* 6. Resumen de Subvenciones */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm md:col-span-2 lg:col-span-2">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-sm bg-green-500/10">
              <Icon path="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-1">Resumen de Subvenciones</p>
              <p className="text-zinc-400 text-sm">Total de financiación pública recibida desglosada por año.</p>
            </div>
          </div>
          
          {subvencionesResumen.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800">
              {subvencionesResumen.map((res) => (
                <div key={res.year} className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm text-center">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Año {res.year}</p>
                  <p className="font-display text-2xl text-green-500 font-bold mb-1">{res.total}€</p>
                  <p className="text-zinc-400 text-xs">{res.count} {res.count === 1 ? 'subvención' : 'subvenciones'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm mt-4 pt-4 border-t border-zinc-800 italic">No hay subvenciones registradas aún.</p>
          )}
        </div>

      </div>

      {/* Acciones Rápidas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-8">
        <h2 className="font-display text-xl text-white mb-4 flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600 rounded-full"></span>
          Acciones Rápidas
        </h2>
        <p className="text-zinc-400 leading-relaxed max-w-3xl mb-6">
          Utilice el menú lateral para navegar entre las secciones. Desde aquí puede gestionar todas las inscripciones recibidas, 
          aprobar solicitudes de patrocinio, actualizar la plantilla, programar eventos y gestionar las jornadas de competición.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/inscripciones" className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">Revisar Inscripciones</Link>
          <Link to="/admin/patrocinadores" className="px-5 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-bold uppercase tracking-wider hover:bg-zinc-700 hover:text-white transition-colors rounded-sm">Gestionar Patrocinios</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-bold uppercase tracking-wider hover:bg-zinc-700 hover:text-white transition-colors rounded-sm cursor-pointer">Ver Sitio Web</a>
        </div>
      </div>
    </div>
  );
}
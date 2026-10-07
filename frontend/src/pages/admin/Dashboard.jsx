import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ path, className = "w-6 h-6" }) => (
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

const ArrowIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
    />
  </svg>
);

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'red',
  to,
}) => {
  const colorClasses = {
    red: {
      icon: 'bg-red-500/10 text-red-500',
      hover: 'group-hover:border-red-500/30',
      value: 'text-red-500',
    },
    yellow: {
      icon: 'bg-yellow-500/10 text-yellow-500',
      hover: 'group-hover:border-yellow-500/30',
      value: 'text-yellow-500',
    },
    green: {
      icon: 'bg-green-500/10 text-green-500',
      hover: 'group-hover:border-green-500/30',
      value: 'text-green-500',
    },
    blue: {
      icon: 'bg-blue-500/10 text-blue-500',
      hover: 'group-hover:border-blue-500/30',
      value: 'text-blue-500',
    },
  };

  const theme = colorClasses[color];

  const content = (
    <>
      <div className="flex items-start justify-between">

        <div
          className={`
            w-11 h-11 rounded-lg flex items-center justify-center
            ${theme.icon}
          `}
        >
          <Icon path={icon} className="w-5 h-5" />
        </div>

        {to && (
          <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors">
            <ArrowIcon />
          </span>
        )}
      </div>

      <div className="mt-7">
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.16em] font-semibold">
          {title}
        </p>

        <div className="flex items-end gap-2 mt-2">
          <p className="font-display text-4xl text-white leading-none">
            {value}
          </p>

          {subtitle && (
            <p className="text-zinc-600 text-xs pb-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {to && (
        <div className="mt-6 pt-4 border-t border-zinc-800/70">
          <span className="text-[10px] uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 transition-colors">
            Gestionar
          </span>
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`
          group block relative overflow-hidden
          bg-[#101012]
          border border-zinc-800/80
          rounded-xl p-5
          transition-all duration-300
          hover:-translate-y-0.5
          ${theme.hover}
        `}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
        {content}
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#101012] border border-zinc-800/80 rounded-xl p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
      {content}
    </div>
  );
};

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

    const headers = {
      Authorization: `Bearer ${token}`
    };

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes`, { headers })
        .then(r => r.json())
        .catch(() => []),

      fetch(`${import.meta.env.VITE_API_URL}/api/patrocinadores`, { headers })
        .then(r => r.json())
        .catch(() => []),

      fetch(`${import.meta.env.VITE_API_URL}/api/jogadores`, { headers })
        .then(r => r.json())
        .catch(() => []),

      fetch(`${import.meta.env.VITE_API_URL}/api/eventos`, { headers })
        .then(r => r.json())
        .catch(() => []),

      fetch(`${import.meta.env.VITE_API_URL}/api/jornadas`, { headers })
        .then(r => r.json())
        .catch(() => []),

      fetch(`${import.meta.env.VITE_API_URL}/api/subvenciones`, { headers })
        .then(r => r.json())
        .catch(() => [])
    ]).then(
      ([
        inscripciones,
        patrocinios,
        jugadores,
        eventos,
        jornadas,
        subvenciones
      ]) => {

        const jornadasArray = Array.isArray(jornadas)
          ? jornadas
          : [];

        // JORNADAS ACTIVAS
        const activeJornadas = jornadasArray.filter(
          j =>
            j.isActive === true &&
            j.temporada?.estado === 'ACTIVA'
        );

        // JORNADAS HISTÓRICAS
        const historicJornadas = jornadasArray.filter(
          j =>
            j.isActive === false ||
            j.temporada?.estado === 'FINALIZADA' ||
            !j.temporada
        );

        // PRÓXIMA JORNADA
        const sortedActiveJornadas = [...activeJornadas].sort(
          (a, b) => {
            const numA = parseInt(a.numero) || 999;
            const numB = parseInt(b.numero) || 999;

            return numA - numB;
          }
        );

        const nextJornada =
          sortedActiveJornadas.length > 0
            ? sortedActiveJornadas[0]
            : null;

        console.log('📊 DEBUG Dashboard Jornadas:');
        console.log(
          'Total jornadas en BD:',
          jornadasArray.length
        );
        console.log(
          'Jornadas ACTIVAS:',
          activeJornadas.length
        );
        console.log(
          'Jornadas HISTÓRICAS:',
          historicJornadas.length
        );
        console.log(
          'Próxima jornada:',
          nextJornada
            ? `Jornada ${nextJornada.numero} - ${nextJornada.ciudad}`
            : 'Ninguna'
        );

        console.log(
          'Detalle de todas las jornadas:',
          jornadasArray.map(j => ({
            id: j.id,
            numero: j.numero,
            ciudad: j.ciudad,
            isActive: j.isActive,
            tieneTemporada: !!j.temporada,
            estadoTemporada:
              j.temporada?.estado || 'SIN TEMPORADA'
          }))
        );

        setStats({
          inscripcionesPendientes:
            Array.isArray(inscripciones)
              ? inscripciones.filter(
                  i => i.status === 'PENDIENTE'
                ).length
              : 0,

          patrociniosPendientes:
            Array.isArray(patrocinios)
              ? patrocinios.filter(
                  p => p.status === 'PENDIENTE'
                ).length
              : 0,

          jugadoresActivos:
            Array.isArray(jugadores)
              ? jugadores.filter(j => j.isActive).length
              : 0,

          jugadoresHistorico:
            Array.isArray(jugadores)
              ? jugadores.filter(j => !j.isActive).length
              : 0,

          eventosActivos:
            Array.isArray(eventos)
              ? eventos.filter(e => e.isActive).length
              : 0,

          eventosHistorico:
            Array.isArray(eventos)
              ? eventos.filter(e => !e.isActive).length
              : 0,

          jornadasActivas:
            activeJornadas.length,

          jornadasHistorico:
            historicJornadas.length,

          proximaJornada:
            nextJornada
        });

        // RESUMEN DE SUBVENCIONES
        const summaries = {};

        (Array.isArray(subvenciones)
          ? subvenciones
          : []
        ).forEach(sub => {

          const year = sub.ano;

          if (!summaries[year]) {
            summaries[year] = {
              count: 0,
              total: 0
            };
          }

          summaries[year].count += 1;

          const valStr = String(sub.valor).trim();

          let numericValue = 0;

          if (valStr.includes(',')) {
            numericValue = parseFloat(
              valStr
                .replace(/\./g, '')
                .replace(',', '.')
            );
          } else {
            numericValue = parseFloat(valStr);
          }

          if (!isNaN(numericValue)) {
            summaries[year].total += numericValue;
          }
        });

        const resumenFormatado = Object.keys(
          summaries
        )
          .sort((a, b) => b - a)
          .map(year => ({
            year,
            count: summaries[year].count,
            total: new Intl.NumberFormat(
              'es-ES',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            ).format(
              summaries[year].total
            )
          }));

        setSubvencionesResumen(
          resumenFormatado
        );

        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-red-600 animate-spin" />

          <div className="text-center">
            <p className="text-zinc-300 text-sm">
              Cargando datos del panel
            </p>

            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mt-1">
              Lobos Quad Rugby
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#101012] p-6 md:p-8">

        <div className="absolute -top-32 -right-32 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

          <div>
            <div className="flex items-center gap-2 mb-4">

              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

              <span className="text-red-500 text-[10px] uppercase tracking-[0.22em] font-semibold">
                Administración
              </span>

            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-tight">
              Panel de Control
            </h1>

            <p className="text-zinc-500 text-sm mt-3 max-w-2xl">
              Visión general de las operaciones,
              actividades y gestión del Lobos Quad Rugby.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="px-4 py-3 rounded-lg bg-zinc-950/70 border border-zinc-800/70">
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest">
                Estado
              </p>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-300 text-xs font-medium">
                  Sistema operativo
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* RESUMEN */}
      <section>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-semibold">
              Resumen
            </p>

            <h2 className="text-zinc-200 text-lg font-semibold mt-1">
              Actividad actual
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            title="Inscripciones pendientes"
            value={stats.inscripcionesPendientes}
            color="red"
            to="/admin/inscripciones"
            icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />

          <StatCard
            title="Solicitudes de patrocinio"
            value={stats.patrociniosPendientes}
            color="yellow"
            to="/admin/patrocinadores"
            icon="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
          />

          <StatCard
            title="Jugadores activos"
            value={stats.jugadoresActivos}
            subtitle={`${stats.jugadoresHistorico} histórico`}
            color="green"
            to="/admin/jugadores"
            icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />

          <StatCard
            title="Eventos activos"
            value={stats.eventosActivos}
            subtitle={`${stats.eventosHistorico} histórico`}
            color="blue"
            to="/admin/eventos"
            icon="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />

        </div>
      </section>

      {/* JORNADAS + SUBVENCIONES */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* JORNADAS */}
        <Link
          to="/admin/jornadas"
          className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#101012] p-6 hover:border-purple-500/30 transition-all duration-300"
        >

          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500/60 via-purple-500/10 to-transparent" />

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Icon
                  path="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  className="w-5 h-5"
                />
              </div>

              <div>
                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.16em]">
                  Competición
                </p>

                <h2 className="text-white font-semibold mt-1">
                  Jornadas
                </h2>
              </div>

            </div>

            <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors">
              <ArrowIcon />
            </span>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">

            <div className="bg-zinc-950/70 rounded-lg border border-zinc-800/70 p-4">
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest">
                Activas
              </p>

              <p className="font-display text-3xl text-purple-500 mt-2">
                {stats.jornadasActivas}
              </p>
            </div>

            <div className="bg-zinc-950/70 rounded-lg border border-zinc-800/70 p-4">
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest">
                Finalizadas
              </p>

              <p className="font-display text-3xl text-zinc-300 mt-2">
                {stats.jornadasHistorico}
              </p>
            </div>

          </div>

          {stats.proximaJornada ? (
            <div className="mt-4 pt-5 border-t border-zinc-800/70">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-widest">
                    Próxima jornada
                  </p>

                  <p className="text-white font-semibold mt-1">
                    Jornada {stats.proximaJornada.numero}
                  </p>

                  <p className="text-zinc-600 text-xs mt-1">
                    {stats.proximaJornada.fechas}
                  </p>
                </div>

                <span className="shrink-0 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
                  {stats.proximaJornada.ciudad}
                </span>

              </div>

            </div>
          ) : (
            <div className="mt-4 pt-5 border-t border-zinc-800/70">
              <p className="text-zinc-600 text-xs italic">
                No hay jornadas activas programadas.
              </p>
            </div>
          )}

        </Link>

        {/* SUBVENCIONES */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#101012] p-6">

          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-green-500/60 via-green-500/10 to-transparent" />

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <Icon
                path="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                className="w-5 h-5"
              />
            </div>

            <div>
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.16em]">
                Financiación
              </p>

              <h2 className="text-white font-semibold mt-1">
                Resumen de subvenciones
              </h2>

              <p className="text-zinc-600 text-xs mt-1">
                Financiación pública registrada por año.
              </p>
            </div>

          </div>

          {subvencionesResumen.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

              {subvencionesResumen.map(res => (
                <div
                  key={res.year}
                  className="bg-zinc-950/70 border border-zinc-800/70 rounded-lg p-4"
                >

                  <div className="flex items-center justify-between">

                    <p className="text-zinc-600 text-[9px] uppercase tracking-widest">
                      Año {res.year}
                    </p>

                    <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
                      {res.count}{' '}
                      {res.count === 1
                        ? 'subvención'
                        : 'subvenciones'}
                    </span>

                  </div>

                  <p className="font-display text-2xl text-green-500 font-bold mt-3">
                    {res.total}€
                  </p>

                </div>
              ))}

            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-zinc-800/70">
              <p className="text-zinc-600 text-sm italic">
                No hay subvenciones registradas aún.
              </p>
            </div>
          )}

        </div>

      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#101012] p-6 md:p-7">

        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-600" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div className="max-w-2xl">

            <div className="flex items-center gap-3 mb-3">

              <span className="w-1 h-5 bg-red-600 rounded-full" />

              <h2 className="text-white font-semibold">
                Acciones rápidas
              </h2>

            </div>

            <p className="text-zinc-500 text-sm leading-relaxed">
              Accede rápidamente a las principales herramientas
              de gestión del club.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Link
              to="/admin/inscripciones"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Revisar inscripciones
              <ArrowIcon />
            </Link>

            <Link
              to="/admin/patrocinadores"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Patrocinios
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Ver sitio web
            </a>

          </div>

        </div>

      </section>

    </div>
  );
}
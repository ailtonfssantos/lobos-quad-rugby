import { Link } from 'react-router-dom';

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

const modules = [
  {
    path: '/admin/inscripciones',
    number: '01',
    title: 'Inscripciones',
    description: 'Gestiona las solicitudes recibidas para formar parte del club.',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    path: '/admin/jugadores',
    number: '02',
    title: 'Equipo',
    description: 'Administra jugadores, cuerpo técnico y la información pública.',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    path: '/admin/eventos',
    number: '03',
    title: 'Eventos',
    description: 'Crea y gestiona entrenamientos, actividades y eventos del club.',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
  {
    path: '/admin/jornadas',
    number: '04',
    title: 'Jornadas',
    description: 'Gestiona jornadas, partidos, resultados y retransmisiones.',
    icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375 0 01.75 0z',
  },
  {
    path: '/admin/temporadas',
    number: '05',
    title: 'Temporadas',
    description: 'Organiza las temporadas deportivas y su histórico de competición.',
    icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0',
  },
  {
    path: '/admin/patrocinadores',
    number: '06',
    title: 'Patrocinios',
    description: 'Gestiona solicitudes comerciales y colaboradores del club.',
    icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10 pb-10">

        <div
          className="absolute top-0 right-0 w-72 h-72 bg-red-900/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative">
          <p className="text-red-500 text-[9px] font-bold uppercase tracking-[0.25em] mb-3">
            Administración
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                PANEL DE CONTROL
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                Gestiona el contenido, el equipo y la actividad
                deportiva de Lobos Quad Rugby desde un único espacio.
              </p>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 border border-white/10 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 hover:border-red-600 hover:text-white transition-all"
            >
              Ver sitio web

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
                  d="M14 5h5v5M19 5l-8 8"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 13v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/10">

        <div className="p-5 sm:p-6 border-r border-white/10">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
            Plataforma
          </span>

          <p className="mt-3 font-display text-2xl sm:text-3xl text-white">
            ONLINE
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">
            Sistema operativo
          </p>
        </div>

        <div className="p-5 sm:p-6 lg:border-r border-white/10">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
            Temporadas
          </span>

          <p className="mt-3 font-display text-2xl sm:text-3xl text-white">
            GESTIÓN
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">
            Competición
          </p>
        </div>

        <div className="p-5 sm:p-6 border-r border-white/10 border-t lg:border-t-0">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
            Contenido
          </span>

          <p className="mt-3 font-display text-2xl sm:text-3xl text-white">
            ACTIVO
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">
            Sitio público
          </p>
        </div>

        <div className="p-5 sm:p-6 border-t border-white/10 lg:border-t-0">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
            Estado
          </span>

          <p className="mt-3 flex items-center gap-2 font-display text-2xl sm:text-3xl text-white">
            <span className="w-2 h-2 bg-red-600 rounded-full" />
            OK
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">
            Panel protegido
          </p>
        </div>

      </section>

      {/* Módulos */}
      <section className="py-10">

        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-red-500">
              Gestión
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl text-white">
              MÓDULOS DEL PANEL
            </h2>
          </div>

          <span className="hidden sm:block text-[8px] uppercase tracking-[0.2em] text-zinc-700">
            06 módulos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-l border-t border-white/10">

          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="group relative min-h-[220px] border-r border-b border-white/10 p-6 sm:p-7 hover:bg-white/[0.025] transition-colors duration-300"
            >
              <div className="flex items-start justify-between">

                <span className="text-[9px] font-bold tracking-[0.2em] text-red-600">
                  {module.number}
                </span>

                <span className="flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-600 group-hover:border-red-600/50 group-hover:text-red-500 transition-all">
                  <Icon
                    path={module.icon}
                    className="w-[18px] h-[18px]"
                  />
                </span>
              </div>

              <div className="mt-10">
                <h3 className="font-display text-2xl text-white group-hover:text-red-500 transition-colors">
                  {module.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-zinc-600 max-w-sm">
                  {module.description}
                </p>
              </div>

              <div className="absolute bottom-6 left-6 sm:left-7 flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-700 group-hover:text-zinc-300 transition-colors">
                Gestionar

                <svg
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
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
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* Footer interno */}
      <section className="border-t border-white/10 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-800">
            Lobos Quad Rugby · Administración
          </p>

          <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-800">
            Panel interno
          </p>
        </div>
      </section>
    </div>
  );
}
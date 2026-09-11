import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const Icon = ({ path, className = 'w-6 h-6' }) => (
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

const formatDate = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getMatchDate = (partido) => {
  return partido?.fecha || partido?.date || partido?.fechaPartido || null;
};

const getMatchTime = (partido) => {
  return partido?.horario || partido?.hora || partido?.time || null;
};

const getMatchStatus = (partido) => {
  return String(partido?.status || '').toLowerCase();
};

const isFinishedMatch = (partido) => {
  const status = getMatchStatus(partido);

  if (
    [
      'finalizado',
      'finalizada',
      'finished',
      'jugado',
      'completed',
      'terminado',
    ].includes(status)
  ) {
    return true;
  }

  return (
    partido?.lobosScore !== null &&
    partido?.lobosScore !== undefined &&
    partido?.rivalScore !== null &&
    partido?.rivalScore !== undefined
  );
};

const isUpcomingMatch = (partido) => {
  const status = getMatchStatus(partido);

  if (
    [
      'finalizado',
      'finalizada',
      'finished',
      'jugado',
      'completed',
      'terminado',
      'cancelado',
      'cancelada',
    ].includes(status)
  ) {
    return false;
  }

  const dateValue = getMatchDate(partido);

  if (!dateValue) return true;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return true;

  return date.getTime() >= Date.now();
};

const getOpponentName = (partido) => {
  if (partido?.rival) return partido.rival;

  if (partido?.equipoLocal?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoVisitante?.nombre || 'Rival';
  }

  if (partido?.equipoVisitante?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoLocal?.nombre || 'Rival';
  }

  return (
    partido?.equipoVisitante?.nombre ||
    partido?.equipoLocal?.nombre ||
    'Rival'
  );
};

const getOpponentLogo = (partido) => {
  if (partido?.rivalLogo) return partido.rivalLogo;

  if (partido?.equipoLocal?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoVisitante?.logo || null;
  }

  if (partido?.equipoVisitante?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoLocal?.logo || null;
  }

  return partido?.equipoVisitante?.logo || partido?.equipoLocal?.logo || null;
};

// ✅ FUNÇÃO: Busca o logo dos Lobos do banco de dados
const getLobosLogo = (partido) => {
  if (partido?.equipoLocal?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoLocal?.logo || null;
  }

  if (partido?.equipoVisitante?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoVisitante?.logo || null;
  }

  return null;
};

// ✅ FUNÇÃO: Busca o nome dos Lobos do banco de dados
const getLobosName = (partido) => {
  if (partido?.equipoLocal?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoLocal?.nombre || 'Lobos Quad Rugby';
  }

  if (partido?.equipoVisitante?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoVisitante?.nombre || 'Lobos Quad Rugby';
  }

  return 'Lobos Quad Rugby';
};

const getLobosScore = (partido) => {
  if (partido?.lobosScore !== undefined && partido?.lobosScore !== null) {
    return partido.lobosScore;
  }

  if (partido?.equipoLocal?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoLocal?.score;
  }

  if (partido?.equipoVisitante?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoVisitante?.score;
  }

  return null;
};

const getOpponentScore = (partido) => {
  if (partido?.rivalScore !== undefined && partido?.rivalScore !== null) {
    return partido.rivalScore;
  }

  if (partido?.equipoLocal?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoVisitante?.score;
  }

  if (partido?.equipoVisitante?.nombre?.toLowerCase().includes('lobos')) {
    return partido?.equipoLocal?.score;
  }

  return null;
};

const getStatusLabel = (partido) => {
  const status = getMatchStatus(partido);

  if (isFinishedMatch(partido)) {
    return 'Finalizado';
  }

  if (
    ['programado', 'scheduled', 'confirmado', 'confirmed'].includes(status)
  ) {
    return 'Programado';
  }

  if (['cancelado', 'cancelada', 'cancelled'].includes(status)) {
    return 'Cancelado';
  }

  return 'Próximo partido';
};

export default function Home() {
  const [jornadas, setJornadas] = useState([]);
  const [loadingJornadas, setLoadingJornadas] = useState(true);

  useEffect(() => {
    const fetchJornadas = async () => {
      try {
        setLoadingJornadas(true);

        const response = await fetch(`${API_URL}/api/jornadas`);

        if (!response.ok) {
          throw new Error('No se pudieron cargar las jornadas');
        }

        const data = await response.json();

        const jornadasData = Array.isArray(data)
          ? data
          : Array.isArray(data?.jornadas)
            ? data.jornadas
            : [];

        setJornadas(jornadasData);
      } catch (error) {
        console.error('Error cargando jornadas:', error);
        setJornadas([]);
      } finally {
        setLoadingJornadas(false);
      }
    };

    fetchJornadas();
  }, []);

  const partidos = useMemo(() => {
    return jornadas
      .flatMap((jornada) =>
        (Array.isArray(jornada?.partidos) ? jornada.partidos : []).map(
          (partido) => ({
            ...partido,
            jornadaId: jornada.id,
            jornadaNumero: jornada.numero,
            competicion: jornada.competicion,
            temporada: jornada.temporada,
            ciudad: jornada.ciudad,
            pabellon: jornada.pabellon,
            fechasJornada: jornada.fechas,
          })
        )
      )
      .filter(Boolean);
  }, [jornadas]);

  const proximoPartido = useMemo(() => {
    const upcoming = partidos
      .filter(isUpcomingMatch)
      .filter((partido) => getMatchDate(partido))
      .sort((a, b) => {
        return (
          new Date(getMatchDate(a)).getTime() -
          new Date(getMatchDate(b)).getTime()
        );
      });

    return upcoming[0] || null;
  }, [partidos]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30">
      
      {/* =========================================================
          1. HERO
      ========================================================== */}
      <section className="relative min-h-[78vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        
        {/* Fotografía */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/equipo1.JPG"
            alt="Equipo Lobos Quad Rugby"
            className="
              w-full h-full object-cover
              object-center
              md:object-[center_25%]
              opacity-55
              grayscale-[25%]
            "
          />

          {/* Overlay premium */}
          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/20 to-zinc-950" />

          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/35 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-24">
          
          <div className="max-w-4xl">
            
            <div className="inline-flex items-center gap-3 mb-7">
              <span className="w-8 h-px bg-red-600" />

              <span className="text-red-500 font-semibold tracking-[0.3em] text-[10px] md:text-xs uppercase">
                Valencia · España
              </span>
            </div>

            <h1
              className="
                font-display
                text-6xl
                sm:text-7xl
                md:text-8xl
                lg:text-9xl
                leading-[0.85]
                tracking-tighter
                text-white
                max-w-5xl
              "
            >
              LOBOS
              <br />
              <span className="text-red-600">QUAD RUGBY</span>
            </h1>

            <p className="mt-8 text-base md:text-xl text-zinc-300 font-light italic max-w-xl leading-relaxed">
              "Más que un deporte. Somos una manada."
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link
                to="/equipo"
                className="
                  inline-flex items-center justify-center
                  px-7 py-4
                  bg-red-600
                  text-white
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-xs
                  hover:bg-red-700
                  transition-all
                  rounded-sm
                "
              >
                Conoce al equipo
              </Link>

              <Link
                to="/unete"
                className="
                  inline-flex items-center justify-center
                  px-7 py-4
                  border border-white/25
                  bg-black/20
                  backdrop-blur-sm
                  text-zinc-200
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-xs
                  hover:border-white
                  hover:text-white
                  transition-all
                  rounded-sm
                "
              >
                Únete a la manada
              </Link>
            </div>
          </div>

          {/* Indicador discreto */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-[9px] uppercase tracking-[0.3em]">
              Descubre
            </span>

            <div className="w-px h-8 bg-zinc-700" />
          </div>
        </div>
      </section>

      {/* =========================================================
          2. PRÓXIMA JORNADA (ÚNICA SEÇÃO)
      ========================================================== */}
      <section className="relative bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-16">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
            <div>
              <p className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-3">
                Actualidad deportiva
              </p>

              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                EL CAMINO SIGUE
              </h2>
            </div>

            <Link
              to="/competiciones"
              className="
                inline-flex items-center gap-2
                text-zinc-400
                hover:text-white
                text-xs
                uppercase
                tracking-[0.15em]
                font-semibold
                transition-colors
              "
            >
              Ver competiciones
              <Icon
                path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                className="w-4 h-4"
              />
            </Link>
          </div>

          {/* PRÓXIMO PARTIDO - ÚNICO CARD */}
          <div className="relative overflow-hidden bg-zinc-950 border border-zinc-800 p-7 md:p-9 rounded-sm">

            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Próximo desafío
              </span>

              {proximoPartido && (
                <span className="px-2.5 py-1 border border-red-600/30 bg-red-600/10 text-red-500 text-[9px] font-bold uppercase tracking-widest">
                  {getStatusLabel(proximoPartido)}
                </span>
              )}
            </div>

            {loadingJornadas ? (
              <div className="py-8 text-center text-zinc-600 text-sm">
                Cargando próxima jornada...
              </div>
            ) : proximoPartido ? (
              <>
                <div className="text-center">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-5">
                    {proximoPartido.temporada?.nome
                      ? proximoPartido.temporada.nome
                      : proximoPartido.competicion || 'Competición'}
                  </p>

                  <div className="flex items-center justify-center gap-5 md:gap-8">

                    {/* Lobos - COM FUNDO BRANCO e logo do banco de dados */}
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 flex items-center justify-center bg-white/95 rounded-full p-2 border border-zinc-700">
                        {getLobosLogo(proximoPartido) ? (
                          <img
                            src={getLobosLogo(proximoPartido)}
                            alt={getOpponentName(proximoPartido)}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center">
                            <span className="text-red-600 text-xs font-bold text-center leading-tight">
                              LOBOS<br />QUAD<br />RUGBY
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="font-display text-base md:text-lg">
                        {getLobosName(proximoPartido)}
                      </p>
                    </div>

                    <div className="font-display text-2xl text-zinc-700">
                      VS
                    </div>

                    {/* Rival - COM FUNDO BRANCO */}
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 flex items-center justify-center bg-white/95 rounded-full p-2 border border-zinc-700">
                        {getOpponentLogo(proximoPartido) ? (
                          <img
                            src={getOpponentLogo(proximoPartido)}
                            alt={getOpponentName(proximoPartido)}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-14 h-14 border border-zinc-800 flex items-center justify-center">
                            <span className="text-zinc-600 text-xl">
                              ⚔
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="font-display text-base md:text-lg">
                        {getOpponentName(proximoPartido)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">

                    <div>
                      <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">
                        Fecha
                      </p>

                      <p className="text-zinc-300 text-xs capitalize">
                        {formatDate(getMatchDate(proximoPartido))}
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">
                        Hora
                      </p>

                      <p className="text-zinc-300 text-xs">
                        {getMatchTime(proximoPartido) || 'Por confirmar'}
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">
                        Lugar
                      </p>

                      <p className="text-zinc-300 text-xs">
                        {proximoPartido.pabellon ||
                          proximoPartido.ciudad ||
                          'Por confirmar'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 text-center">
                  <Link
                    to="/competiciones"
                    className="
                      inline-flex items-center gap-2
                      text-red-500
                      hover:text-red-400
                      text-[10px]
                      uppercase
                      tracking-[0.2em]
                      font-bold
                      transition-colors
                    "
                  >
                    Ver detalles de la jornada
                    <Icon
                      path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      className="w-4 h-4"
                    />
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="font-display text-xl text-zinc-300 mb-2">
                  Próxima jornada por confirmar
                </p>

                <p className="text-zinc-600 text-sm">
                  Consulta el calendario completo de competiciones.
                </p>

                <Link
                  to="/competiciones"
                  className="inline-flex mt-6 text-red-500 text-xs uppercase tracking-widest font-bold"
                >
                  Ver competiciones →
                </Link>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* =========================================================
          3. ENTRENAMIENTOS
      ========================================================== */}
      <section className="bg-zinc-950 border-b border-zinc-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="mb-10">
            <p className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-3">
              Entrenamientos
            </p>

            <h2 className="font-display text-3xl md:text-4xl text-white">
              PREPARADOS PARA COMPETIR
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-800">

            {/* Ubicación */}
            <div className="p-7 md:p-8 border-b md:border-b-0 md:border-r border-zinc-800">
              <div className="flex items-start gap-4">

                <div className="text-red-500 shrink-0">
                  <Icon
                    path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    className="w-5 h-5"
                  />
                </div>

                <div>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] mb-2">
                    Ubicación
                  </p>

                  <h3 className="font-display text-lg text-white mb-1">
                    Pabellón Playa Malvarrosa
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    Valencia, España
                  </p>
                </div>
              </div>
            </div>

            {/* Lunes y miércoles */}
            <div className="p-7 md:p-8 border-b md:border-b-0 md:border-r border-zinc-800">
              <div className="flex items-start gap-4">

                <div className="text-red-500 shrink-0">
                  <Icon
                    path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    className="w-5 h-5"
                  />
                </div>

                <div>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] mb-2">
                    Lunes & Miércoles
                  </p>

                  <h3 className="font-display text-lg text-white mb-1">
                    17:00 – 19:30
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    Entrenamiento de alta intensidad
                  </p>
                </div>
              </div>
            </div>

            {/* Viernes */}
            <div className="p-7 md:p-8">
              <div className="flex items-start gap-4">

                <div className="text-red-500 shrink-0">
                  <Icon
                    path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    className="w-5 h-5"
                  />
                </div>

                <div>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] mb-2">
                    Viernes
                  </p>

                  <h3 className="font-display text-lg text-white mb-1">
                    10:00 – 11:30
                  </h3>

                  <p className="text-zinc-500 text-sm">
                    Sesión matinal de entrenamiento
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          4. CÓDIGO LOBOS
      ========================================================== */}
      <section className="py-20 md:py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="text-center mb-14 md:mb-16">

            <p className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-3">
              Nuestra filosofía
            </p>

            <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight">
              CÓDIGO LOBOS
            </h2>

            <div className="w-12 h-px bg-red-600 mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-zinc-800">

            {[
              {
                number: '01',
                title: 'INCLUSIÓN',
                desc: 'El deporte no entiende de barreras. Aquí todos somos atletas.',
              },
              {
                number: '02',
                title: 'RESILIENCIA',
                desc: 'Superación personal dentro y fuera de la cancha, cada día.',
              },
              {
                number: '03',
                title: 'TÁCTICA',
                desc: 'Velocidad, contacto y estrategia. Rugby de alto nivel.',
              },
              {
                number: '04',
                title: 'MANADA',
                desc: 'El equipo es la familia. Nadie se queda atrás.',
              },
            ].map((item, index) => (
              <div
                key={item.number}
                className={`
                  group
                  p-7 md:p-8
                  bg-zinc-950
                  hover:bg-zinc-900
                  transition-colors duration-300
                  ${index < 3 ? 'border-b lg:border-b-0 lg:border-r border-zinc-800' : ''}
                  ${index === 1 ? 'md:border-r border-zinc-800' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-zinc-700 text-xs font-mono">
                    {item.number}
                  </span>

                  <span className="w-7 h-px bg-zinc-800 group-hover:bg-red-600 transition-colors" />
                </div>

                <h3 className="font-display text-xl text-white mb-3 group-hover:text-red-500 transition-colors">
                  {item.title}
                </h3>

                <p className="text-zinc-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================================
          5. SOBRE NOSOTROS
      ========================================================== */}
      <section className="py-20 md:py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">

          <p className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-4">
            Quiénes somos
          </p>

          <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight">
            SOBRE NOSOTROS
          </h2>

          <p className="text-xl md:text-2xl text-zinc-300 font-light italic mt-8 mb-8 leading-relaxed">
            "No necesito que sea fácil, solo que sea posible."
          </p>

          <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Desde 2017 promovemos la integración social de las personas con
            discapacidad a través del rugby en silla de ruedas. Primer equipo
            de la Comunidad Valenciana en la Liga Nacional desde 2019.
          </p>

          {/* Línea temporal */}
          <div className="grid grid-cols-2 max-w-md mx-auto mt-12 border-y border-zinc-800">

            <div className="py-6 border-r border-zinc-800">
              <p className="font-display text-3xl md:text-4xl text-white">
                2017
              </p>

              <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] mt-2">
                Fundación
              </p>
            </div>

            <div className="py-6">
              <p className="font-display text-3xl md:text-4xl text-white">
                2019
              </p>

              <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] mt-2">
                Liga Nacional
              </p>
            </div>

          </div>

          <Link
            to="/sobre-nosotros"
            className="
              inline-flex items-center gap-2
              mt-10
              text-zinc-300
              hover:text-white
              text-xs
              uppercase
              tracking-[0.15em]
              font-bold
              transition-colors
            "
          >
            Conoce nuestra historia

            <Icon
              path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              className="w-4 h-4"
            />
          </Link>
        </div>
      </section>

      {/* =========================================================
          6. CTA FINAL
      ========================================================== */}
      <section className="relative py-20 md:py-24 bg-red-600 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-800" />

        <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full border border-white/10" />

        <div className="relative max-w-4xl mx-auto px-5 md:px-8 text-center">

          <p className="text-red-100/80 font-bold tracking-[0.2em] text-[10px] uppercase mb-4">
            Forma parte del equipo
          </p>

          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-none">
            ¿QUIERES FORMAR PARTE DE LOS LOBOS?
          </h2>

          <p className="text-red-100 text-base md:text-xl font-light max-w-2xl mx-auto mt-7 mb-9">
            No necesitas experiencia. Solo ganas de aprender, competir y
            formar parte de la manada.
          </p>

          <Link
            to="/unete"
            className="
              inline-flex items-center justify-center
              px-9 py-4
              bg-zinc-950
              text-white
              font-bold
              uppercase
              tracking-[0.15em]
              text-xs
              hover:bg-black
              transition-colors
              rounded-sm
            "
          >
            Solicitar prueba
          </Link>

        </div>
      </section>

    </div>
  );
}
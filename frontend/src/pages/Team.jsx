import { useCallback, useEffect, useMemo, useState } from 'react';

/* =========================================================
   CONSTANTES
========================================================= */

const FILTERS = ['TODOS', 'ATAQUE', 'DEFENSA'];

const FALLBACK_IMAGE = '/assets/logo1.png';

// Foto real da equipa utilizada no Hero
const HERO_IMAGE = '/assets/equipo1.JPG';

const FALLBACK_HERO_IMAGE = '/assets/lobosquad1.webp';

/* =========================================================
   HELPERS
========================================================= */

const normalizeText = (value) => {
  if (!value) return '';

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
};

/**
 * Define a prioridade hierárquica do staff.
 *
 * Ordem:
 * Presidente
 * Vice-presidente
 * Capitán
 * Entrenador Principal
 * 2º Entrenador / Asistente
 * Voluntarios
 */
const getRolePriority = (role) => {
  const r = normalizeText(role);

  if (!r) return 99;

  // Presidente
  if (r.includes('PRESIDENTE') && !r.includes('VICE')) return 1;

  // Vice-presidente
  if (
    r.includes('VICEPRESIDENTE') ||
    r.includes('VICE PRESIDENTE')
  ) {
    return 2;
  }

  // Capitán
  if (r.includes('CAPITAN')) return 3;

  // Entrenador Principal / Jefe
  if (
    r.includes('ENTRENADOR PRINCIPAL') ||
    r.includes('ENTRENADOR JEFE') ||
    r === 'ENTRENADOR'
  ) {
    return 4;
  }

  // 2º Entrenador / Asistente
  if (
    r.includes('2º ENTRENADOR') ||
    r.includes('2O ENTRENADOR') ||
    r.includes('SEGUNDO ENTRENADOR') ||
    r.includes('ASISTENTE')
  ) {
    return 5;
  }

  // Voluntarios
  if (
    r.includes('VOLUNTARIO') ||
    r.includes('VOLUNTARIOS')
  ) {
    return 6;
  }

  return 99;
};

const isStaffMember = (person) => {
  return getRolePriority(person?.role) < 99;
};

/**
 * Determina la categoría deportiva de una persona.
 *
 * IMPORTANTE:
 * A partir de ahora también se utiliza para miembros del staff.
 * Esto permite que un Presidente que también sea jugador pueda
 * aparecer en los filtros deportivos.
 */
const getPersonCategory = (person) => {
  if (!person) return null;

  const values = [
    person?.role,
    person?.position,
    person?.posicion,
    person?.posición,
    person?.category,
    person?.categoria,
    person?.categoría,
    person?.categoryName,
    person?.tipo,
    person?.sportCategory,
    person?.categoriaDeportiva,
    person?.categoríaDeportiva,
  ];

  const combined = values
    .filter(Boolean)
    .map(normalizeText)
    .join(' ');

  if (combined.includes('ATAQUE')) {
    return 'ATAQUE';
  }

  if (combined.includes('DEFENSA')) {
    return 'DEFENSA';
  }

  return null;
};

/**
 * Fisher-Yates Shuffle
 *
 * Devuelve una nueva copia del array en orden aleatorio.
 * No modifica el array original.
 *
 * Se ejecuta cuando se cargan los datos, por lo que la plantilla
 * mantiene el mismo orden durante esa sesión y cambia al recargar.
 */
const shufflePlayers = (players) => {
  const shuffled = [...players];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};

/* =========================================================
   ICONS
========================================================= */

const ArrowUpRight = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 17 17 7M7 7h10v10"
    />
  </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6l12 12M18 6 6 18"
    />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    />
    <circle cx="9" cy="7" r="4" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />
  </svg>
);

const RefreshIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
    />
  </svg>
);

/* =========================================================
   SKELETON
========================================================= */

const SkeletonCard = () => (
  <div
    className="bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse"
    aria-hidden="true"
  >
    <div className="h-80 bg-zinc-800" />

    <div className="p-6 space-y-3">
      <div className="h-5 bg-zinc-800 rounded-sm w-2/3" />
      <div className="h-3 bg-zinc-800 rounded-sm w-1/2" />
    </div>
  </div>
);

const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

/* =========================================================
   TEAM COMPONENT
========================================================= */

export default function Team() {
  const [filter, setFilter] = useState('TODOS');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const [staff, setStaff] = useState([]);
  const [players, setPlayers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================================================
     FETCH TEAM
  ======================================================= */

  const fetchPlayers = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error(
          'VITE_API_URL no está configurada.'
        );
      }

      const response = await fetch(
        `${apiUrl}/api/jogadores`,
        {
          signal,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error del servidor: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          'El servidor devolvió datos inválidos.'
        );
      }

      /* ================================================
         SEPARAR STAFF / JUGADORES
      ================================================= */

      const staffData = data
        .filter(isStaffMember)
        .sort(
          (a, b) =>
            getRolePriority(a?.role) -
            getRolePriority(b?.role)
        );

      const playersData = data.filter(
        (person) => !isStaffMember(person)
      );

      /**
       * ORDEN ALEATORIO
       *
       * Cada vez que fetchPlayers recibe los datos,
       * los jugadores se mezclan.
       *
       * Al actualizar la página:
       * nueva petición → nuevo shuffle → nuevo orden.
       */
      const playersShuffled =
        shufflePlayers(playersData);

      setStaff(staffData);
      setPlayers(playersShuffled);
    } catch (err) {
      if (err?.name === 'AbortError') {
        return;
      }

      console.error(
        'Error al buscar jugadores:',
        err
      );

      setError(
        'No hemos podido cargar la plantilla. Inténtalo de nuevo en unos momentos.'
      );

      setStaff([]);
      setPlayers([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchPlayers(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchPlayers]);

  /* =======================================================
     JUGADORES FILTRABLES
  ======================================================= */

  /**
   * Lista utilizada EXCLUSIVAMENTE para la sección
   * "Plantilla de Jugadores".
   *
   * Incluye:
   * - todos los jugadores normales
   * - miembros del staff que también tienen categoría deportiva
   *
   * Esto permite que Carlos Sanchis:
   * - siga apareciendo en "Cuerpo Técnico y Directiva"
   * - aparezca también en "ATAQUE" si su posición/categoría
   *   está configurada como ATAQUE.
   */
  const filterablePlayers = useMemo(() => {
    const staffPlayers = staff.filter(
      (person) => getPersonCategory(person) !== null
    );

    const combined = [
      ...players,
      ...staffPlayers,
    ];

    // Evitar duplicados por ID
    const uniquePlayers = Array.from(
      new Map(
        combined.map((person) => [
          String(person.id),
          person,
        ])
      ).values()
    );

    return uniquePlayers;
  }, [players, staff]);

  /* =======================================================
     FILTROS
  ======================================================= */

  const filteredPlayers = useMemo(() => {
    if (filter === 'TODOS') {
      return filterablePlayers;
    }

    return filterablePlayers.filter(
      (person) =>
        getPersonCategory(person) === filter
    );
  }, [filterablePlayers, filter]);

  /* =======================================================
     CONTADORES
  ======================================================= */

  const totalMembers =
    staff.length + players.length;

  const attackCount = useMemo(
    () =>
      filterablePlayers.filter(
        (person) =>
          getPersonCategory(person) === 'ATAQUE'
      ).length,
    [filterablePlayers]
  );

  const defenseCount = useMemo(
    () =>
      filterablePlayers.filter(
        (person) =>
          getPersonCategory(person) === 'DEFENSA'
      ).length,
    [filterablePlayers]
  );

  /* =======================================================
     MODAL
  ======================================================= */

  useEffect(() => {
    if (!selectedPerson) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedPerson(null);
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedPerson]);

  /* =======================================================
     IMAGE FALLBACK
  ======================================================= */

  const handleImageError = (event) => {
    const image = event.currentTarget;

    if (image.dataset.fallback === 'true') {
      image.style.display = 'none';

      const fallback =
        image.parentElement?.querySelector(
          '[data-image-fallback]'
        );

      if (fallback) {
        fallback.classList.remove('hidden');
        fallback.classList.add('flex');
      }

      return;
    }

    image.dataset.fallback = 'true';
    image.src = FALLBACK_IMAGE;
  };

  /* =======================================================
     CARD
  ======================================================= */

  const renderCard = (person) => {
    const category =
      getPersonCategory(person);

    return (
      <article
        key={person.id}
        onClick={() =>
          setSelectedPerson(person)
        }
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            setSelectedPerson(person);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Ver ficha de ${
          person.name || 'miembro'
        }`}
        className="
          group
          relative
          bg-zinc-900
          border
          border-zinc-800
          hover:border-red-600/60
          focus:border-red-600
          focus:outline-none
          transition-all
          duration-300
          cursor-pointer
          overflow-hidden
        "
      >
        {/* FOTO */}
        <div className="relative h-72 sm:h-80 bg-zinc-800 overflow-hidden">
          <img
            src={
              person.image ||
              FALLBACK_IMAGE
            }
            alt={
              person.name
                ? `Foto de ${person.name}`
                : 'Miembro de Lobos Quad Rugby'
            }
            className="
              w-full
              h-full
              object-cover
              object-top
              grayscale
              group-hover:grayscale-0
              group-focus:grayscale-0
              group-hover:scale-[1.04]
              group-focus:scale-[1.04]
              transition-all
              duration-700
            "
            loading="lazy"
            onError={handleImageError}
          />

          <div
            data-image-fallback
            className="absolute inset-0 hidden items-center justify-center bg-zinc-950"
          >
            <img
              src={FALLBACK_IMAGE}
              alt=""
              className="w-24 h-24 object-contain opacity-20"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 pointer-events-none" />

          {person.classification && (
            <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-700 px-3 py-2">
              <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] block">
                Class
              </span>

              <span className="text-xl font-display text-red-500">
                {person.classification}
              </span>
            </div>
          )}

          <div className="absolute bottom-5 right-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition-all duration-300">
            Ver ficha

            <ArrowUpRight className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* INFO */}
        <div className="p-5 sm:p-6">
          <h3 className="font-display text-xl text-white group-hover:text-red-500 group-focus:text-red-500 transition-colors leading-tight mb-3">
            {person.name || 'Sin nombre'}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]">
            <span
              className={`
                w-2
                h-2
                rounded-full
                shrink-0
                ${
                  category === 'ATAQUE'
                    ? 'bg-red-500'
                    : category === 'DEFENSA'
                    ? 'bg-blue-500'
                    : getRoleColor(person.role)
                }
              `}
            />

            <span>
              {person.role || 'Sin rol'}
            </span>

            {person.nationality && (
              <>
                <span className="text-zinc-700">
                  •
                </span>

                <span>
                  {person.nationality}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 transition-transform duration-500 origin-left" />
      </article>
    );
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[620px] md:min-h-[680px] flex items-end overflow-hidden bg-zinc-950 border-b border-zinc-800">

        {/* FOTO HERO */}
        <img
          src={HERO_IMAGE}
          alt="Equipo Lobos Quad Rugby"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(event) => {
            event.currentTarget.src =
              FALLBACK_HERO_IMAGE;
          }}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-zinc-950/55" />

        {/* DEGRADÊ LATERAL — protege o texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/20" />

        {/* DEGRADÊ INFERIOR */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent" />

        {/* RED LIGHT */}
        <div className="absolute -top-40 right-[-100px] w-[600px] h-[600px] rounded-full bg-red-700/15 blur-3xl pointer-events-none" />

        {/* CONTEÚDO */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 md:pb-20 pt-32">

          <div className="max-w-4xl">

            {/* EYEBROW */}
            <div className="flex items-center gap-4 mb-6">
              <span className="block w-10 h-[2px] bg-red-600" />

              <p className="text-red-500 font-bold tracking-[0.28em] text-[10px] md:text-[11px] uppercase">
                Plantilla Oficial
              </p>
            </div>

            {/* TITLE */}
            <h1 className="font-display text-[4rem] sm:text-[5rem] md:text-[7rem] lg:text-[8.5rem] leading-[0.82] tracking-[-0.035em] text-white uppercase mb-8">
              EL
              <br />
              <span className="text-zinc-500">
                EQUIPO
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-zinc-300 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
              Atletas, entrenadores y voluntarios
              que hacen posible este proyecto.
            </p>

          </div>

          {/* STATS */}
          {!loading && !error && (
            <div className="mt-14 md:mt-16 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8 max-w-5xl">

              <div>
                <p className="font-display text-3xl md:text-4xl text-white">
                  {totalMembers}
                </p>

                <p className="mt-2 text-[9px] text-zinc-400 uppercase tracking-[0.2em]">
                  Miembros
                </p>
              </div>

              <div>
                <p className="font-display text-3xl md:text-4xl text-white">
                  {players.length}
                </p>

                <p className="mt-2 text-[9px] text-zinc-400 uppercase tracking-[0.2em]">
                  Jugadores
                </p>
              </div>

              <div>
                <p className="font-display text-3xl md:text-4xl text-white">
                  {staff.length}
                </p>

                <p className="mt-2 text-[9px] text-zinc-400 uppercase tracking-[0.2em]">
                  Staff
                </p>
              </div>

              <div>
                <p className="font-display text-3xl md:text-4xl text-white">
                  VAL
                </p>

                <p className="mt-2 text-[9px] text-zinc-400 uppercase tracking-[0.2em]">
                  Valencia
                </p>
              </div>

            </div>
          )}

        </div>

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-6 right-6 md:right-12 hidden md:flex items-center gap-3 text-zinc-500">
          <span className="text-[8px] uppercase tracking-[0.25em]">
            El equipo
          </span>

          <span className="block w-12 h-px bg-zinc-700" />
        </div>

      </section>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <section
          className="py-16 bg-zinc-950"
          aria-label="Cargando plantilla"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-10">
              <div className="h-3 w-24 bg-zinc-800 animate-pulse mb-4" />
              <div className="h-8 w-72 bg-zinc-800 animate-pulse" />
            </div>

            <SkeletonGrid count={4} />

            <div className="mt-20 mb-10">
              <div className="h-3 w-24 bg-zinc-800 animate-pulse mb-4" />
              <div className="h-8 w-72 bg-zinc-800 animate-pulse" />
            </div>

            <SkeletonGrid count={8} />

          </div>
        </section>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <section className="py-32 bg-zinc-950">
          <div className="max-w-xl mx-auto px-4 text-center">

            <div className="w-16 h-16 mx-auto mb-6 border border-red-600/40 flex items-center justify-center text-red-500">
              <RefreshIcon className="w-6 h-6" />
            </div>

            <p className="text-white font-display text-2xl mb-3">
              No hemos podido cargar el equipo
            </p>

            <p className="text-zinc-500 leading-relaxed mb-8">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                const controller =
                  new AbortController();

                fetchPlayers(controller.signal);
              }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-[0.15em] transition-colors"
            >
              <RefreshIcon className="w-4 h-4" />
              Reintentar
            </button>

          </div>
        </section>
      )}

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {!loading && !error && (
        <>

          {/* =================================================
              STAFF
          ================================================= */}

          <section className="py-16 md:py-20 bg-zinc-950 border-b border-zinc-800">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

                <div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-[2px] w-10 bg-red-600" />

                    <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                      El club
                    </p>
                  </div>

                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                    Cuerpo Técnico
                    <br />
                    <span className="text-zinc-600">
                      y Directiva
                    </span>
                  </h2>

                </div>

                <div className="flex items-center gap-3 text-zinc-500">

                  <UsersIcon className="w-4 h-4" />

                  <span className="text-[10px] uppercase tracking-[0.15em]">
                    {staff.length}{' '}
                    {staff.length === 1
                      ? 'miembro'
                      : 'miembros'}
                  </span>

                </div>

              </div>

              {staff.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                  {staff.map(renderCard)}
                </div>
              ) : (
                <div className="py-12 border border-zinc-800 text-center">
                  <p className="text-zinc-600">
                    No hay miembros del cuerpo técnico registrados aún.
                  </p>
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              PLAYERS
          ================================================= */}

          <section className="py-16 md:py-20 bg-zinc-900">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">

                <div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-[2px] w-10 bg-red-600" />

                    <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                      Plantilla
                    </p>
                  </div>

                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                    Plantilla de
                    <br />
                    <span className="text-zinc-600">
                      Jugadores
                    </span>
                  </h2>

                </div>

                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filtrar jugadores"
                >

                  {FILTERS.map((style) => {

                    const count =
                      style === 'TODOS'
                        ? filterablePlayers.length
                        : style === 'ATAQUE'
                        ? attackCount
                        : defenseCount;

                    const isActive =
                      filter === style;

                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() =>
                          setFilter(style)
                        }
                        aria-pressed={isActive}
                        className={`
                          group/filter
                          inline-flex
                          items-center
                          gap-2
                          px-4
                          sm:px-5
                          py-2.5
                          text-[10px]
                          sm:text-xs
                          font-bold
                          uppercase
                          tracking-[0.15em]
                          border
                          transition-all
                          duration-300
                          ${
                            isActive
                              ? 'bg-red-600 border-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.18)]'
                              : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-white'
                          }
                        `}
                      >
                        {style}

                        <span
                          className={`text-[9px] ${
                            isActive
                              ? 'text-red-100'
                              : 'text-zinc-700 group-hover/filter:text-zinc-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                </div>

              </div>

              {filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                  {filteredPlayers.map(renderCard)}
                </div>
              ) : (
                <div className="py-16 text-center border border-zinc-800/70">

                  <p className="font-display text-2xl text-zinc-500 mb-2">
                    Sin jugadores
                  </p>

                  <p className="text-zinc-600 text-sm">
                    No hay jugadores en esta categoría aún.
                  </p>

                </div>
              )}

            </div>

          </section>

        </>
      )}

      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedPerson && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="person-modal-title"
          onMouseDown={() =>
            setSelectedPerson(null)
          }
        >

          <div
            className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[94vh] overflow-y-auto shadow-2xl relative"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="relative h-64 sm:h-72 bg-zinc-800 overflow-hidden">

              <button
                type="button"
                onClick={() =>
                  setSelectedPerson(null)
                }
                aria-label="Cerrar ficha"
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              <img
                src={
                  selectedPerson.image ||
                  FALLBACK_IMAGE
                }
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top opacity-40 grayscale"
                onError={handleImageError}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

                <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                  {selectedPerson.role ||
                    'Miembro de la manada'}
                </p>

                <h2
                  id="person-modal-title"
                  className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-none"
                >
                  {selectedPerson.name ||
                    'Sin nombre'}
                </h2>

              </div>

            </div>

            <div className="p-5 sm:p-8">

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">

                {selectedPerson.classification && (
                  <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">

                    <p className="text-[9px] text-zinc-500 uppercase tracking-[0.18em] mb-2">
                      Clasificación
                    </p>

                    <p className="font-display text-3xl sm:text-4xl text-red-500">
                      {selectedPerson.classification}
                    </p>

                  </div>
                )}

                <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">

                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.18em] mb-2">
                    Posición / Rol
                  </p>

                  <p className="font-bold text-sm sm:text-base text-white">
                    {selectedPerson.role ||
                      'Sin rol'}
                  </p>

                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">

                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.18em] mb-2">
                    Nacionalidad
                  </p>

                  <p className="font-bold text-sm sm:text-base text-white">
                    {selectedPerson.nationality ||
                      '—'}
                  </p>

                </div>

              </div>

              {selectedPerson.bio && (
                <div>

                  <div className="flex items-center gap-3 mb-5">

                    <span className="w-8 h-[2px] bg-red-600" />

                    <h3 className="font-display text-xl sm:text-2xl text-white uppercase">
                      Biografía
                    </h3>

                  </div>

                  <p className="text-zinc-400 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                    {selectedPerson.bio}
                  </p>

                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedPerson(null)
                }
                className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-[0.18em] transition-colors border border-zinc-700"
              >
                Cerrar ficha
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
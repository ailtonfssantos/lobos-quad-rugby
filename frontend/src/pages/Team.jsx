import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/* =========================================================
   CONSTANTES
========================================================= */

const FILTERS = ['TODOS', 'ATAQUE', 'DEFENSA'];

const FALLBACK_IMAGE = '/assets/logo1.png';
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

const normalizeSlug = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getRolePriority = (role) => {
  const r = normalizeText(role);
  if (!r) return 99;
  if (r.includes('PRESIDENTE') && !r.includes('VICE')) return 1;
  if (r.includes('VICEPRESIDENTE') || r.includes('VICE PRESIDENTE')) return 2;
  if (r.includes('CAPITAN')) return 3;
  if (r.includes('ENTRENADOR PRINCIPAL') || r.includes('ENTRENADOR JEFE') || r === 'ENTRENADOR') return 4;
  if (r.includes('2º ENTRENADOR') || r.includes('2O ENTRENADOR') || r.includes('SEGUNDO ENTRENADOR') || r.includes('ASISTENTE')) return 5;
  if (r.includes('VOLUNTARIO') || r.includes('VOLUNTARIOS')) return 6;
  return 99;
};

const isStaffMember = (person) => getRolePriority(person?.role) < 99;

const getPersonCategory = (person) => {
  const role = normalizeText(person?.role);
  const position = normalizeText(person?.position || person?.posicion || person?.posición);
  const combined = `${role} ${position}`;
  if (combined.includes('ATAQUE')) return 'ATAQUE';
  if (combined.includes('DEFENSA')) return 'DEFENSA';
  return null;
};

const getRoleColor = (role) => {
  const r = normalizeText(role);
  if (r.includes('PRESIDENTE') || r.includes('VICEPRESIDENTE')) return 'bg-purple-500';
  if (r.includes('ENTRENADOR') || r.includes('CAPITAN')) return 'bg-yellow-500';
  if (r.includes('ASISTENTE') || r.includes('VOLUNTARIO')) return 'bg-zinc-500';
  return 'bg-zinc-600';
};

const shufflePlayers = (players) => {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/* =========================================================
   ICONS
========================================================= */

const ArrowUpRight = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M7 7h10v10" />
  </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const RefreshIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
  </svg>
);

/* =========================================================
   SKELETON
========================================================= */

const SkeletonCard = () => (
  <div className="bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse" aria-hidden="true">
    <div className="aspect-[3/4] bg-zinc-800" />
    <div className="p-6 space-y-3">
      <div className="h-6 bg-zinc-800 rounded-sm w-3/4" />
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
  const [searchParams] = useSearchParams();

  const fetchPlayers = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error('VITE_API_URL no está configurada.');

      const response = await fetch(`${apiUrl}/api/jogadores`, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('El servidor devolvió datos inválidos.');

      const staffData = data.filter(isStaffMember).sort((a, b) => getRolePriority(a?.role) - getRolePriority(b?.role));
      const playersData = data.filter((person) => !isStaffMember(person));
      const playersShuffled = shufflePlayers(playersData);

      setStaff(staffData);
      setPlayers(playersShuffled);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.error('Error al buscar jugadores:', err);
      setError('No hemos podido cargar la plantilla. Inténtalo de nuevo en unos momentos.');
      setStaff([]);
      setPlayers([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPlayers(controller.signal);
    return () => controller.abort();
  }, [fetchPlayers]);

  useEffect(() => {
    const jugadorSlug = searchParams.get('jugador');
    if (!jugadorSlug || loading) return;

    const allPeople = [...players, ...staff];
    const aliases = {
      'jairo-beses': ['jairo-beses'],
      'jose-garcia': ['jose-garcia', 'jose-garcia-pepe'],
      'cristhian-adrian-sanches': ['cristhian-adrian-sanches', 'cristhian-adrian-sanches-xamaco'],
    };
    const acceptedSlugs = aliases[jugadorSlug] || [jugadorSlug];

    const person = allPeople.find((item) => {
      const personSlug = normalizeSlug(item?.name);
      return acceptedSlugs.includes(personSlug);
    });

    if (person) setSelectedPerson(person);
  }, [players, staff, loading, searchParams]);

  const filterablePlayers = useMemo(() => {
    const staffPlayers = staff.filter((person) => getPersonCategory(person) !== null);
    const combined = [...players, ...staffPlayers];
    return Array.from(new Map(combined.map((person) => [String(person.id), person])).values());
  }, [players, staff]);

  const filteredPlayers = useMemo(() => {
    if (filter === 'TODOS') return filterablePlayers;
    return filterablePlayers.filter((person) => getPersonCategory(person) === filter);
  }, [filterablePlayers, filter]);

  const totalMembers = staff.length + players.length;
  const attackCount = useMemo(() => filterablePlayers.filter((person) => getPersonCategory(person) === 'ATAQUE').length, [filterablePlayers]);
  const defenseCount = useMemo(() => filterablePlayers.filter((person) => getPersonCategory(person) === 'DEFENSA').length, [filterablePlayers]);

  useEffect(() => {
    if (!selectedPerson) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedPerson(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPerson]);

  const handleImageError = (event) => {
    const image = event.currentTarget;
    if (image.dataset.fallback === 'true') {
      image.style.display = 'none';
      const fallback = image.parentElement?.querySelector('[data-image-fallback]');
      if (fallback) {
        fallback.classList.remove('hidden');
        fallback.classList.add('flex');
      }
      return;
    }
    image.dataset.fallback = 'true';
    image.src = FALLBACK_IMAGE;
  };

  const renderCard = (person) => {
    const category = getPersonCategory(person);
    
    // ✅ LÓGICA: Mostra o número gigante APENAS se for jogador OU se tiver classificação (ex: Presidente que também joga)
    const isPlayer = category !== null;
    const hasClassification = Boolean(person.classification);
    const shouldShowNumber = isPlayer || hasClassification;

    return (
      <article
        key={person.id}
        onClick={() => setSelectedPerson(person)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setSelectedPerson(person);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Ver ficha de ${person.name || 'miembro'}`}
        className="group relative bg-zinc-900 border border-zinc-800 hover:border-red-600/50 focus:border-red-600 focus:outline-none transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
      >
        {/* FOTO */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-zinc-800 overflow-hidden">
          <img
            src={person.image || FALLBACK_IMAGE}
            alt={person.name ? `Foto de ${person.name}` : 'Miembro de Lobos Quad Rugby'}
            className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-focus:grayscale-0 group-hover:scale-105 group-focus:scale-105 transition-all duration-700"
            loading="lazy"
            onError={handleImageError}
          />

          <div data-image-fallback className="absolute inset-0 hidden items-center justify-center bg-zinc-950">
            <img src={FALLBACK_IMAGE} alt="" className="w-24 h-24 object-contain opacity-20" />
          </div>

          {/* Gradiente inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />

          {/* ✅ Número/Clasificación gigante de fondo (Condicional) */}
          {shouldShowNumber && (
            <span className="absolute top-4 right-4 text-6xl sm:text-7xl font-black text-white/5 group-hover:text-red-600/10 transition-colors duration-500 leading-none select-none">
              {person.classification || `#${person.id}`}
            </span>
          )}

          {/* Botón Ver Perfil */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition-all duration-300">
            Ver perfil
            <ArrowUpRight className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* INFO */}
        <div className="relative p-5 sm:p-6 mt-auto">
          <h3 className="font-display text-2xl sm:text-3xl text-white group-hover:text-red-500 transition-colors leading-[0.95] mb-3 uppercase tracking-tight">
            {person.name || 'Sin nombre'}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.15em]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${category === 'ATAQUE' ? 'bg-red-500' : category === 'DEFENSA' ? 'bg-blue-500' : getRoleColor(person.role)}`} />
            <span>{person.role || 'Miembro'}</span>
            {person.nationality && (
              <>
                <span className="text-zinc-700">•</span>
                <span>{person.nationality}</span>
              </>
            )}
          </div>
        </div>

        {/* Línea roja inferior */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative min-h-[75vh] lg:min-h-[85vh] flex items-end overflow-hidden bg-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Equipo Lobos Quad Rugby"
            className="w-full h-full object-cover object-center grayscale opacity-60 scale-105"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_HERO_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 via-60% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute -top-40 right-[-100px] w-[600px] h-[600px] rounded-full bg-red-700/10 blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-20 md:pb-28 pt-32">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="block w-10 h-[2px] bg-red-600" />
              <p className="text-red-500 font-bold tracking-[0.28em] text-[10px] md:text-[11px] uppercase">Plantilla Oficial</p>
            </div>

            <h1 className="font-display text-[5rem] sm:text-[6.5rem] md:text-[8rem] lg:text-[9rem] leading-[0.8] tracking-[-0.04em] text-white uppercase mb-8">
              EL
              <br />
              <span className="text-zinc-600">EQUIPO</span>
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
              Lobos Quad Rugby. El equipo que representa a Valencia con orgullo, intensidad y compromiso dentro y fuera de la pista.
            </p>

            <div className="flex items-center gap-6 text-zinc-500">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">2017</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Valencia</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">España</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOADING
      ===================================================== */}
      {loading && (
        <section className="py-16 bg-zinc-950" aria-label="Cargando plantilla">
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
            <p className="text-white font-display text-2xl mb-3">No hemos podido cargar el equipo</p>
            <p className="text-zinc-500 leading-relaxed mb-8">{error}</p>
            <button
              type="button"
              onClick={() => {
                const controller = new AbortController();
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
          {/* STAFF */}
          <section className="py-16 md:py-20 bg-zinc-950 border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-[2px] w-10 bg-red-600" />
                    <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">El club</p>
                  </div>
                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                    Cuerpo Técnico
                    <br />
                    <span className="text-zinc-600">y Directiva</span>
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-zinc-500">
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.15em]">
                    {staff.length} {staff.length === 1 ? 'miembro' : 'miembros'}
                  </span>
                </div>
              </div>

              {staff.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                  {staff.map(renderCard)}
                </div>
              ) : (
                <div className="py-12 border border-zinc-800 text-center">
                  <p className="text-zinc-600">No hay miembros del cuerpo técnico registrados aún.</p>
                </div>
              )}
            </div>
          </section>

          {/* PLAYERS */}
          <section className="py-16 md:py-20 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-[2px] w-10 bg-red-600" />
                    <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">Plantilla</p>
                  </div>
                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                    Plantilla de
                    <br />
                    <span className="text-zinc-600">Jugadores</span>
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar jugadores">
                  {FILTERS.map((style) => {
                    const count = style === 'TODOS' ? filterablePlayers.length : style === 'ATAQUE' ? attackCount : defenseCount;
                    const isActive = filter === style;

                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFilter(style)}
                        aria-pressed={isActive}
                        className={`group/filter inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
                          isActive
                            ? 'bg-red-600 border-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.18)]'
                            : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        {style}
                        <span className={`text-[9px] ${isActive ? 'text-red-100' : 'text-zinc-700 group-hover/filter:text-zinc-400'}`}>
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
                  <p className="font-display text-2xl text-zinc-500 mb-2">Sin jugadores</p>
                  <p className="text-zinc-600 text-sm">No hay jugadores en esta categoría aún.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* =====================================================
          MODAL (PERFIL INDIVIDUAL)
      ===================================================== */}
      {selectedPerson && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="person-modal-title"
          onMouseDown={() => setSelectedPerson(null)}
        >
          <div
            className="bg-zinc-950 border border-zinc-800 w-full max-w-5xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Botón cerrar flotante */}
            <button
              type="button"
              onClick={() => setSelectedPerson(null)}
              aria-label="Cerrar ficha"
              className="absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center bg-black/50 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors rounded-full"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* LADO IZQUIERDO: FOTO */}
            <div className="relative w-full md:w-2/5 h-72 md:h-auto bg-zinc-900 overflow-hidden shrink-0">
              <img
                src={selectedPerson.image || FALLBACK_IMAGE}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top grayscale md:grayscale-0 transition-all duration-500"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:bg-gradient-to-r" />
              
              {/* ✅ Número gigante en el modal (Condicional, misma lógica) */}
              {(() => {
                const modalIsPlayer = getPersonCategory(selectedPerson) !== null;
                const modalHasClassification = Boolean(selectedPerson.classification);
                const modalShouldShowNumber = modalIsPlayer || modalHasClassification;

                return modalShouldShowNumber ? (
                  <span className="absolute bottom-4 left-4 text-8xl md:text-9xl font-black text-white/5 leading-none select-none">
                    {selectedPerson.classification || `#${selectedPerson.id}`}
                  </span>
                ) : null;
              })()}
            </div>

            {/* LADO DERECHO: INFO */}
            <div className="w-full md:w-3/5 p-6 sm:p-10 md:p-12 flex flex-col">
              <div className="mb-8">
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                  {selectedPerson.role || 'Miembro del equipo'}
                </p>
                <h2 id="person-modal-title" className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-[0.9] uppercase tracking-tight mb-6">
                  {selectedPerson.name || 'Sin nombre'}
                </h2>

                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="inline-flex items-center px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                    Lobos Quad Rugby
                  </span>
                  {selectedPerson.nationality && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                      {selectedPerson.nationality}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-10 border-t border-zinc-800 pt-8">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.18em] mb-1">Categoría / Clasificación</p>
                  <p className="text-lg text-white font-display">{selectedPerson.classification || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.18em] mb-1">Posición / Rol</p>
                  <p className="text-lg text-white font-display">{selectedPerson.role || '—'}</p>
                </div>
              </div>

              {selectedPerson.bio && (
                <div className="mt-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-[2px] bg-red-600" />
                    <h3 className="font-display text-xl text-white uppercase">Sobre el jugador</h3>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-base whitespace-pre-line">
                    {selectedPerson.bio}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedPerson(null)}
                className="mt-10 w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.18em] transition-colors border border-zinc-800 hover:border-zinc-700 text-center"
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
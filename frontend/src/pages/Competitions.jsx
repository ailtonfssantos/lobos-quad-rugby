import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL, getImageUrl } from "../config";

/* =========================================================
   ICON COMPONENT
========================================================= */
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

/* =========================================================
   YOUTUBE / PLAY ICON
========================================================= */
const PlayIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.14v13.72c0 .78.85 1.26 1.52.86l10.94-6.86a1 1 0 000-1.72L9.52 4.28C8.85 3.88 8 4.36 8 5.14Z" />
  </svg>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function Competitions() {
  const [jornadas, setJornadas] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [selectedTemporadaId, setSelectedTemporadaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /* =======================================================
     LOAD DATA (Temporadas + Jornadas)
  ======================================================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // 1. Obtener temporadas
        const resTemp = await fetch(`${API_URL}/api/temporadas`);
        if (resTemp.ok) {
          const tempsData = await resTemp.json();
          setTemporadas(tempsData);
          // Seleccionar la primera (más reciente) por defecto
          if (tempsData.length > 0) {
            setSelectedTemporadaId(tempsData[0].id);
          }
        }

        // 2. Obtener jornadas
        const resJor = await fetch(`${API_URL}/api/jornadas`);
        if (!resJor.ok) throw new Error(`Error HTTP: ${resJor.status}`);
        const jorData = await resJor.json();
        setJornadas(Array.isArray(jorData) ? jorData : []);

      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* =======================================================
     UPDATE CURRENT TIME
  ======================================================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Filtrar jornadas por temporada seleccionada y que estén activas
  const jornadasFiltradas = jornadas.filter(j => 
    j.isActive === true && j.temporadaId === selectedTemporadaId
  );

  const temporadaActual = temporadas.find(t => t.id === selectedTemporadaId);

  /* =======================================================
     FUNCIONES DE FECHA Y ESTADO (Código original intacto)
  ======================================================= */
  const meses = {
    ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
    JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11,
  };

  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const parseJornadaDates = (fechas) => {
    if (!fechas || typeof fechas !== "string") return null;
    const texto = fechas.trim().toUpperCase();
    const slashMatch = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) return { year: parseInt(slashMatch[3], 10), month: parseInt(slashMatch[2], 10) - 1, days: [parseInt(slashMatch[1], 10)] };
    
    const yearMatch = texto.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
    
    const monthMatch = texto.match(/DE\s+(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)/);
    const month = monthMatch ? meses[monthMatch[1]] : null;
    
    const rangeMatch = texto.match(/(\d{1,2})\s*(?:Y|-|A)\s*(\d{1,2})/);
    if (rangeMatch) return { year, month, days: [parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)] };
    
    const singleDayMatch = texto.match(/(?:^|\s)(\d{1,2})(?:\s+DE|\s*$)/);
    if (singleDayMatch) return { year, month, days: [parseInt(singleDayMatch[1], 10)] };
    
    return null;
  };

  const getMatchDate = (jornada, partido) => {
    const specificDate = partido?.fecha || partido?.date || partido?.fechaPartido;
    if (specificDate) {
      const isoMatch = String(specificDate).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) return { year: parseInt(isoMatch[1], 10), month: parseInt(isoMatch[2], 10) - 1, day: parseInt(isoMatch[3], 10) };
      const slashMatch = String(specificDate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (slashMatch) return { year: parseInt(slashMatch[3], 10), month: parseInt(slashMatch[2], 10) - 1, day: parseInt(slashMatch[1], 10) };
    }
    const parsed = parseJornadaDates(jornada?.fechas);
    if (!parsed || parsed.days.length === 0) return null;
    let dayIndex = (partido?.diaSemana || "").toLowerCase().includes("domingo") ? 1 : 0;
    const day = parsed.days[dayIndex] || parsed.days[0];
    if (parsed.month === null || !day) return null;
    return { year: parsed.year, month: parsed.month, day };
  };

  const getMatchDateTime = (jornada, partido) => {
    const date = getMatchDate(jornada, partido);
    if (!date) return null;
    if (!partido?.horario) return new Date(date.year, date.month, date.day, 0, 0, 0);
    const timeParts = String(partido.horario).split(":").map(Number);
    return new Date(date.year, date.month, date.day, Number.isFinite(timeParts[0]) ? timeParts[0] : 0, Number.isFinite(timeParts[1]) ? timeParts[1] : 0, 0);
  };

  const getMatchEndDateTime = (jornada, partido) => {
    const start = getMatchDateTime(jornada, partido);
    if (!start) return null;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 120);
    return end;
  };

  const getDynamicStatus = (jornada, partido) => {
    const backendStatus = String(partido?.status || "").toUpperCase();
    if (backendStatus === "CANCELADO") return "CANCELADO";
    if (backendStatus === "FINALIZADO" || backendStatus === "FINAL") return "FINALIZADO";
    
    const start = getMatchDateTime(jornada, partido);
    const end = getMatchEndDateTime(jornada, partido);
    if (!start || !end) return "PROGRAMADO";
    if (currentTime >= start && currentTime <= end) return "EN_DIRECTO";
    if (currentTime < start) return "PROGRAMADO";
    
    const hasScore = partido?.lobosScore !== null && partido?.lobosScore !== undefined && partido?.rivalScore !== null && partido?.rivalScore !== undefined;
    if (hasScore) return "FINALIZADO";
    return "PENDIENTE";
  };

  const getHomeTeam = (partido) => ({
    name: partido?.equipoLocal?.nombre || partido?.equipoLocalNombre || partido?.localNombre || "Lobos Quad Rugby",
    logo: partido?.equipoLocal?.logo || partido?.equipoLocalLogo || partido?.localLogo || null,
  });

  const getAwayTeam = (partido) => ({
    name: partido?.equipoVisitante?.nombre || partido?.equipoVisitanteNombre || partido?.visitanteNombre || partido?.rival || "Rival",
    logo: partido?.equipoVisitante?.logo || partido?.equipoVisitanteLogo || partido?.visitanteLogo || partido?.rivalLogo || null,
  });

  const getFormattedDay = (jornada, partido) => {
    if (partido?.diaSemana) return partido.diaSemana.charAt(0).toUpperCase() + partido.diaSemana.slice(1);
    const date = getMatchDateTime(jornada, partido);
    return date ? diasSemana[date.getDay()] : "";
  };

  const formatFullDate = (jornada) => jornada?.fechas || "";

  const TeamLogo = ({ logo, name, size = "large" }) => {
    const dimensions = size === "large" ? "w-20 h-20 md:w-24 md:h-24" : "w-14 h-14 md:w-16 md:h-16";
    if (!logo) {
      return (
        <div className={`${dimensions} rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center`}>
          <span className="text-zinc-600 text-[10px] font-bold uppercase text-center px-2">{name?.substring(0, 3)}</span>
        </div>
      );
    }
    return (
      <div className={`${dimensions} rounded-full bg-white/95 border border-zinc-700 p-2 flex items-center justify-center overflow-hidden group-hover:border-red-500/40 transition-colors duration-300`}>
        <img src={getImageUrl(logo)} alt={`Logo ${name}`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    if (status === "EN_DIRECTO") return <span className="inline-flex items-center gap-2 px-4 py-2 border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] rounded-full animate-pulse"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>En directo</span>;
    if (status === "FINALIZADO") return <span className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 bg-zinc-900 text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] rounded-full">Finalizado</span>;
    if (status === "CANCELADO") return <span className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] rounded-full">Cancelado</span>;
    if (status === "PENDIENTE") return <span className="inline-flex items-center gap-2 px-4 py-2 border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] rounded-full">Pendiente de resultado</span>;
    return <span className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] rounded-full">Programado</span>;
  };

  const YoutubeButton = ({ link, status }) => {
    if (!link) return null;
    let label = "Ver en vivo";
    if (status === "EN_DIRECTO") label = "Ver ahora";
    if (status === "FINALIZADO" || status === "PENDIENTE") label = "Ver el partido";
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.12em] rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 active:scale-95">
        <PlayIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />{label}
      </a>
    );
  };

  const Score = ({ homeScore, awayScore, homeName, awayName }) => {
    const home = Number(homeScore), away = Number(awayScore);
    const homeWinner = Number.isFinite(home) && Number.isFinite(away) && home > away;
    const awayWinner = Number.isFinite(home) && Number.isFinite(away) && away > home;
    return (
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <div className="text-center min-w-[70px] md:min-w-[90px]">
          <p className={`font-display text-4xl md:text-5xl font-bold leading-none ${homeWinner ? "text-red-500" : "text-white"}`}>{homeScore}</p>
          <p className="mt-2 text-[9px] md:text-[10px] uppercase tracking-wider text-zinc-600 max-w-[90px] mx-auto truncate">{homeName}</p>
        </div>
        <span className="text-zinc-700 text-2xl md:text-3xl font-light">-</span>
        <div className="text-center min-w-[70px] md:min-w-[90px]">
          <p className={`font-display text-4xl md:text-5xl font-bold leading-none ${awayWinner ? "text-red-500" : "text-white"}`}>{awayScore}</p>
          <p className="mt-2 text-[9px] md:text-[10px] uppercase tracking-wider text-zinc-600 max-w-[90px] mx-auto truncate">{awayName}</p>
        </div>
      </div>
    );
  };

  const MatchCard = ({ jornada, partido, index }) => {
    const status = getDynamicStatus(jornada, partido);
    const home = getHomeTeam(partido);
    const away = getAwayTeam(partido);
    const dia = getFormattedDay(jornada, partido);
    const youtubeLink = partido?.youtubeLink || partido?.youtube || partido?.videoUrl || null;
    const hasScore = partido?.lobosScore !== null && partido?.lobosScore !== undefined && partido?.rivalScore !== null && partido?.rivalScore !== undefined;

    return (
      <article className="group relative bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-sm overflow-hidden transition-all duration-300">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent group-hover:via-red-600/60 transition-colors duration-500"></div>
        <div className="p-5 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <Icon path="M12 8v4l3 3 M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-3.5 h-3.5" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">{dia}</span>
              {partido?.horario && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-red-500 text-sm md:text-base font-display font-bold tracking-wider">{partido.horario}</span>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10">
            <div className="flex flex-col items-center text-center">
              <TeamLogo logo={home.logo} name={home.name} />
              <h3 className="mt-4 text-sm md:text-base font-bold uppercase tracking-wide text-white max-w-[180px]">{home.name}</h3>
            </div>
            <div className="flex flex-col items-center min-w-[130px]">
              {status === "FINALIZADO" && hasScore ? (
                <Score homeScore={partido.lobosScore} awayScore={partido.rivalScore} homeName={home.name} awayName={away.name} />
              ) : (
                <span className="font-display text-lg md:text-xl text-zinc-700">VS</span>
              )}
            </div>
            <div className="flex flex-col items-center text-center">
              <TeamLogo logo={away.logo} name={away.name} />
              <h3 className="mt-4 text-sm md:text-base font-bold uppercase tracking-wide text-white max-w-[180px]">{away.name}</h3>
            </div>
          </div>

          <div className="sm:hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="flex flex-col items-center text-center">
                <TeamLogo logo={home.logo} name={home.name} size="small" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-white leading-tight max-w-[100px]">{home.name}</p>
              </div>
              <div className="flex flex-col items-center px-2">
                {status === "FINALIZADO" && hasScore ? (
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold text-white">{partido.lobosScore}</span>
                    <span className="text-zinc-700">-</span>
                    <span className="font-display text-2xl font-bold text-white">{partido.rivalScore}</span>
                  </div>
                ) : (
                  <span className="font-display text-sm text-zinc-700">VS</span>
                )}
              </div>
              <div className="flex flex-col items-center text-center">
                <TeamLogo logo={away.logo} name={away.name} size="small" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-white leading-tight max-w-[100px]">{away.name}</p>
              </div>
            </div>
          </div>

          <div className="my-6 md:my-7 border-t border-zinc-900"></div>

          <div className="flex flex-col items-center gap-4">
            <StatusBadge status={status} />
            <YoutubeButton link={youtubeLink} status={status} />
            {status === "CANCELADO" && <p className="mt-4 text-center text-[10px] text-red-400 uppercase tracking-wider">Este partido ha sido cancelado.</p>}
            {status === "PENDIENTE" && !hasScore && <p className="mt-4 text-center text-[10px] text-zinc-600 uppercase tracking-wider">Resultado pendiente de actualización.</p>}
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Cargando competiciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <section className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <div className="w-14 h-14 border border-red-500/20 bg-red-500/5 flex items-center justify-center mx-auto mb-6">
              <Icon path="M12 9v3.75m0 3h.007M10.29 3.86l-7.82 13.5A1.5 1.5 0 003.77 19.6h16.46a1.5 1.5 0 001.3-2.24l-7.82-13.5a1.5 1.5 0 00-2.6 0z" className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="font-display text-3xl text-white mb-3">No se pudieron cargar las competiciones</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">Se ha producido un error al conectar con el calendario de competición. Inténtalo de nuevo más tarde.</p>
          </div>
        </section>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ===================================================
          HERO
      =================================================== */}
      <section className="relative py-20 md:py-28 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          
          {/* SELECTOR DE TEMPORADAS (Estilo Dark Premium) */}
          {temporadas.length > 0 && (
            <div className="mb-8 flex justify-center relative z-20">
              <select
                value={selectedTemporadaId || ""}
                onChange={(e) => setSelectedTemporadaId(e.target.value ? parseInt(e.target.value) : null)}
                className="
                  appearance-none
                  bg-zinc-900/80 backdrop-blur-md
                  border border-zinc-700 
                  text-white 
                  px-6 py-3 pr-10
                  rounded-sm 
                  text-xs font-bold uppercase tracking-[0.15em] 
                  focus:border-red-600 focus:ring-1 focus:ring-red-600/50
                  outline-none 
                  cursor-pointer 
                  hover:border-zinc-500 hover:bg-zinc-800
                  transition-all duration-300
                  shadow-lg shadow-black/50
                "
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.75rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.25rem 1.25rem`
                }}
              >
                {temporadas.map((temp) => (
                  <option key={temp.id} value={temp.id} className="bg-zinc-900 text-white">
                    {temp.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* TEXTOS ORIGINALES RESTAURADOS */}
          <p className="text-red-500 font-bold tracking-[0.25em] text-[10px] md:text-xs mb-5 uppercase">
            {temporadaActual ? `Calendario: ${temporadaActual.nome}` : "Calendario Oficial"}
          </p>

          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl leading-none mb-6 text-white">
            COMPETICIONES
          </h1>

          <p className="text-zinc-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Consulta el calendario de Lobos Quad Rugby, sigue nuestros partidos
            en directo y revisa los resultados de la temporada.
          </p>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {jornadasFiltradas.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 border border-zinc-800 bg-zinc-900 flex items-center justify-center mx-auto mb-6">
              <Icon path="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-zinc-600 italic text-sm">
              No hay jornadas programadas para esta temporada.
            </p>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {jornadasFiltradas.map((jornada) => (
              <section key={jornada.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                {jornada.bannerUrl && (
                  <div className="relative w-full h-44 md:h-64 overflow-hidden bg-zinc-800">
                    <img src={getImageUrl(jornada.bannerUrl)} alt={`Jornada ${jornada.numero}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                      <p className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-1">{jornada.competicion || "Competición"}</p>
                      <h2 className="font-display text-3xl md:text-5xl text-white">Jornada {jornada.numero}</h2>
                    </div>
                  </div>
                )}

                <div className={`p-5 md:p-8 ${jornada.bannerUrl ? "pt-5 md:pt-7" : ""}`}>
                  {!jornada.bannerUrl && (
                    <div className="border-b border-zinc-800 pb-6 mb-6">
                      <p className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase mb-2">{jornada.competicion || "Competición"}</p>
                      <h2 className="font-display text-3xl md:text-5xl text-white">Jornada {jornada.numero}</h2>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-7 md:mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-600 mb-1">Ciudad</p>
                        <p className="text-sm text-zinc-200 font-medium">{jornada.ciudad || "Por confirmar"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <Icon path="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-600 mb-1">Local</p>
                        <p className="text-sm text-zinc-200 font-medium">{jornada.pabellon || "Por confirmar"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <Icon path="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-600 mb-1">Fecha</p>
                        <p className="text-sm text-zinc-200 font-medium">{formatFullDate(jornada)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.isArray(jornada.partidos) && jornada.partidos.length > 0 ? (
                      jornada.partidos.map((partido, index) => (
                        <MatchCard key={partido.id || `${jornada.id}-${index}`} jornada={jornada} partido={partido} index={index} />
                      ))
                    ) : (
                      <div className="py-10 text-center border border-zinc-800 bg-zinc-950">
                        <p className="text-zinc-600 text-xs uppercase tracking-wider">No hay partidos disponibles para esta jornada.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ===================================================
          CTA
      =================================================== */}
      <section className="py-16 md:py-24 bg-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_45%)]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-red-100 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] mb-4">Lobos Quad Rugby</p>
          <h2 className="font-display text-4xl md:text-6xl mb-6 text-white">¿QUIERES VERNOS EN ACCIÓN?</h2>
          <p className="text-sm md:text-lg mb-8 md:mb-10 text-red-100 font-light max-w-2xl mx-auto">
            Sigue nuestros próximos partidos, consulta los resultados y acompáñanos durante toda la temporada.
          </p>
          <Link to="/entrenamientos" className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-zinc-950 text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-black transition-all duration-300 shadow-2xl">
            Ver Calendario y Ubicación
            <Icon path="M5 12h14m-6-6l6 6-6 6" className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
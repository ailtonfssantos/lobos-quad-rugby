import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, getImageUrl } from '../config';

/* =========================================================
   ICONS
========================================================= */

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

const PlayIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.06-6.86a1.02 1.02 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
  </svg>
);

/* =========================================================
   DATE HELPERS
========================================================= */

const SPANISH_MONTHS = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const parseSpanishDate = (value, fallbackYear = new Date().getFullYear()) => {
  if (!value) return null;

  const text = String(value)
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  /* dd/mm/yyyy */
  const numericMatch = text.match(
    /^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/
  );

  if (numericMatch) {
    const day = Number(numericMatch[1]);
    const month = Number(numericMatch[2]) - 1;
    let year = numericMatch[3]
      ? Number(numericMatch[3])
      : fallbackYear;

    if (year < 100) {
      year += 2000;
    }

    const date = new Date(year, month, day);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /* "10 septiembre 2026" */
  const monthMatch = text.match(
    /^(\d{1,2})\s+([a-záéíóúñ]+)(?:\s+(\d{4}))?$/
  );

  if (monthMatch) {
    const day = Number(monthMatch[1]);
    const monthName = normalizeText(monthMatch[2]);
    const month = SPANISH_MONTHS[monthName];
    const year = monthMatch[3]
      ? Number(monthMatch[3])
      : fallbackYear;

    if (month !== undefined) {
      const date = new Date(year, month, day);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
};

const parseJornadaDates = (value) => {
  if (!value) {
    return {
      start: null,
      end: null,
    };
  }

  const text = String(value)
    .replace(/\s+/g, ' ')
    .trim();

  /*
    Examples supported:
    10/09/2026
    10/09/2026 - 11/09/2026
    10 y 11 de septiembre de 2026
    10-11 septiembre 2026
    10 septiembre 2026
  */

  const fullDates = [
    ...text.matchAll(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/g),
  ];

  if (fullDates.length >= 2) {
    return {
      start: parseSpanishDate(fullDates[0][1]),
      end: parseSpanishDate(fullDates[1][1]),
    };
  }

  if (fullDates.length === 1) {
    return {
      start: parseSpanishDate(fullDates[0][1]),
      end: parseSpanishDate(fullDates[0][1]),
    };
  }

  const monthPattern =
    /(\d{1,2})(?:\s*(?:y|-|\/)\s*(\d{1,2}))?\s+de?\s*([a-záéíóúñ]+)(?:\s+de?\s*(\d{4}))?/i;

  const monthMatch = text.match(monthPattern);

  if (monthMatch) {
    const firstDay = Number(monthMatch[1]);
    const secondDay = monthMatch[2]
      ? Number(monthMatch[2])
      : firstDay;

    const monthName = normalizeText(monthMatch[3]);
    const month = SPANISH_MONTHS[monthName];

    const year = monthMatch[4]
      ? Number(monthMatch[4])
      : new Date().getFullYear();

    if (month !== undefined) {
      return {
        start: new Date(year, month, firstDay),
        end: new Date(year, month, secondDay),
      };
    }
  }

  const simpleMonthMatch = text.match(
    /(\d{1,2})(?:\s*(?:y|-|\/)\s*(\d{1,2}))?\s+([a-záéíóúñ]+)\s*(\d{4})?/i
  );

  if (simpleMonthMatch) {
    const firstDay = Number(simpleMonthMatch[1]);
    const secondDay = simpleMonthMatch[2]
      ? Number(simpleMonthMatch[2])
      : firstDay;

    const monthName = normalizeText(simpleMonthMatch[3]);
    const month = SPANISH_MONTHS[monthName];

    const year = simpleMonthMatch[4]
      ? Number(simpleMonthMatch[4])
      : new Date().getFullYear();

    if (month !== undefined) {
      return {
        start: new Date(year, month, firstDay),
        end: new Date(year, month, secondDay),
      };
    }
  }

  const singleDate = parseSpanishDate(text);

  return {
    start: singleDate,
    end: singleDate,
  };
};

/* =========================================================
   MATCH DATE / TIME
========================================================= */

const getMatchDate = (match, jornada) => {
  const specificDate =
    match?.fecha ||
    match?.date ||
    match?.fechaPartido;

  if (specificDate) {
    const parsed = new Date(specificDate);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    const spanishParsed = parseSpanishDate(specificDate);

    if (spanishParsed) {
      return spanishParsed;
    }
  }

  const jornadaDates = parseJornadaDates(jornada?.fechas);

  if (!jornadaDates.start) {
    return null;
  }

  /*
    If the match has a day of the week, use it to choose
    the correct date inside the jornada range.
  */

  const day = normalizeText(
    match?.diaSemana ||
      match?.dayOfWeek ||
      match?.dia ||
      ''
  );

  if (day) {
    const isSunday = day.includes('domingo');

    if (isSunday && jornadaDates.end) {
      return jornadaDates.end;
    }

    const isSaturday = day.includes('sabado');

    if (isSaturday) {
      return jornadaDates.start;
    }
  }

  return jornadaDates.start;
};

const getMatchDateTime = (match, jornada) => {
  const date = getMatchDate(match, jornada);

  if (!date) return null;

  const result = new Date(date);

  const horario =
    match?.horario ||
    match?.hora ||
    match?.time ||
    '';

  if (horario) {
    const timeMatch = String(horario).match(
      /(\d{1,2})[:.](\d{2})/
    );

    if (timeMatch) {
      result.setHours(
        Number(timeMatch[1]),
        Number(timeMatch[2]),
        0,
        0
      );
    }
  }

  return result;
};

/*
  The backend does not currently provide an explicit
  match duration, so we use 120 minutes only for live
  status estimation.
*/
const getMatchEndDateTime = (match, jornada) => {
  const start = getMatchDateTime(match, jornada);

  if (!start) return null;

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 120);

  return end;
};

/* =========================================================
   STATUS
========================================================= */

const getMatchStatus = (match, jornada, currentTime) => {
  const backendStatus = normalizeText(match?.status);

  if (
    backendStatus === 'cancelado' ||
    backendStatus === 'cancelled'
  ) {
    return 'CANCELADO';
  }

  if (
    backendStatus === 'finalizado' ||
    backendStatus === 'final'
  ) {
    return 'FINALIZADO';
  }

  const start = getMatchDateTime(match, jornada);
  const end = getMatchEndDateTime(match, jornada);

  if (start && end) {
    if (currentTime >= start && currentTime <= end) {
      return 'EN_DIRECTO';
    }

    if (currentTime < start) {
      return 'PROGRAMADO';
    }
  }

  const hasScores =
    match?.lobosScore !== null &&
    match?.lobosScore !== undefined &&
    match?.rivalScore !== null &&
    match?.rivalScore !== undefined;

  if (start && currentTime > start && hasScores) {
    return 'FINALIZADO';
  }

  return 'PENDIENTE';
};

/* =========================================================
   TEAM HELPERS
========================================================= */

const getHomeTeam = (match) => {
  return (
    match?.equipoLocal?.nombre ||
    match?.homeTeam?.nombre ||
    match?.local ||
    match?.equipoLocalNombre ||
    'Lobos Quad Rugby'
  );
};

const getAwayTeam = (match) => {
  return (
    match?.equipoVisitante?.nombre ||
    match?.awayTeam?.nombre ||
    match?.visitante ||
    match?.equipoVisitanteNombre ||
    match?.rival ||
    'Rival'
  );
};

const getHomeLogo = (match) => {
  return (
    match?.equipoLocal?.logo ||
    match?.homeTeam?.logo ||
    match?.localLogo ||
    match?.equipoLocalLogo ||
    '/assets/logo-lobos.png'
  );
};

const getAwayLogo = (match) => {
  return (
    match?.equipoVisitante?.logo ||
    match?.awayTeam?.logo ||
    match?.visitanteLogo ||
    match?.equipoVisitanteLogo ||
    match?.rivalLogo
  );
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatDate = (date) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatShortDate = (date) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  })
    .format(date)
    .replace('.', '')
    .toUpperCase();
};

const formatTime = (match, date) => {
  const horario =
    match?.horario ||
    match?.hora ||
    match?.time;

  if (horario) {
    const matchTime = String(horario).match(
      /(\d{1,2})[:.](\d{2})/
    );

    if (matchTime) {
      return `${matchTime[1].padStart(2, '0')}:${matchTime[2]}`;
    }
  }

  if (date) {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  return '';
};

const getJornadaTitle = (jornada) => {
  const competition = normalizeText(
    jornada?.competicion || ''
  );

  const numero = String(jornada?.numero ?? '').trim();

  if (
    competition.includes('autonomica') ||
    competition.includes('campeonato')
  ) {
    return numero || 'Competición';
  }

  if (/^\d+$/.test(numero)) {
    return `Jornada ${numero}`;
  }

  return numero || 'Jornada';
};

const getJornadaNumber = (jornada) => {
  const value = Number(jornada?.numero);

  return Number.isFinite(value) ? value : null;
};

/* =========================================================
   TEAM LOGO
========================================================= */

const TeamLogo = ({
  src,
  name,
  size = 'normal',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClass =
    size === 'large'
      ? 'w-20 h-20 sm:w-24 sm:h-24'
      : 'w-14 h-14 sm:w-16 sm:h-16';

  const initials = String(name || 'EQ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const imageUrl = src ? getImageUrl(src) : null;

  if (!imageUrl || imageError) {
    return (
      <div
        className={`${sizeClass} shrink-0 border border-white/10 bg-zinc-900 flex items-center justify-center`}
        aria-label={name}
      >
        <span className="text-sm font-bold tracking-widest text-zinc-500">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} shrink-0 border border-white/10 bg-white flex items-center justify-center overflow-hidden`}
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-contain p-2"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = {
    EN_DIRECTO: {
      label: 'EN DIRECTO',
      className:
        'border-red-500/60 bg-red-500/10 text-red-400',
      live: true,
    },
    FINALIZADO: {
      label: 'FINALIZADO',
      className:
        'border-white/15 bg-white/[0.04] text-zinc-300',
    },
    CANCELADO: {
      label: 'CANCELADO',
      className:
        'border-red-500/30 bg-red-500/5 text-red-400',
    },
    PROGRAMADO: {
      label: 'PROGRAMADO',
      className:
        'border-white/15 bg-transparent text-zinc-400',
    },
    PENDIENTE: {
      label: 'PENDIENTE',
      className:
        'border-white/10 bg-transparent text-zinc-500',
    },
  };

  const current = config[status] || config.PENDIENTE;

  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] ${current.className}`}
    >
      {current.live && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
          aria-hidden="true"
        />
      )}

      {current.label}
    </span>
  );
};

/* =========================================================
   YOUTUBE BUTTON
========================================================= */

const YoutubeButton = ({ link, status }) => {
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white transition-colors hover:border-red-500 hover:text-red-400"
      aria-label={
        status === 'EN_DIRECTO'
          ? 'Ver partido en directo en YouTube'
          : 'Ver partido en YouTube'
      }
    >
      <PlayIcon className="w-3.5 h-3.5" />

      {status === 'EN_DIRECTO'
        ? 'Ver en directo'
        : 'Ver en YouTube'}
    </a>
  );
};

/* =========================================================
   SCORE
========================================================= */

const Score = ({ match, status }) => {
  const homeScore = match?.lobosScore;
  const awayScore = match?.rivalScore;

  const hasScores =
    homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined;

  if (!hasScores) {
    return (
      <div className="text-center">
        <div className="text-2xl sm:text-3xl font-display font-bold text-zinc-700 tracking-wider">
          VS
        </div>

        {status === 'PROGRAMADO' && (
          <div className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            Por jugar
          </div>
        )}
      </div>
    );
  }

  const homeWins = Number(homeScore) > Number(awayScore);
  const awayWins = Number(awayScore) > Number(homeScore);

  return (
    <div className="text-center min-w-[110px]">
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-3xl sm:text-4xl font-display font-bold ${
            homeWins ? 'text-white' : 'text-zinc-500'
          }`}
        >
          {homeScore}
        </span>

        <span className="text-zinc-700 text-xl">—</span>

        <span
          className={`text-3xl sm:text-4xl font-display font-bold ${
            awayWins ? 'text-white' : 'text-zinc-500'
          }`}
        >
          {awayScore}
        </span>
      </div>

      {status === 'FINALIZADO' && (
        <div className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
          Resultado final
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MATCH CARD
========================================================= */

const MatchCard = ({
  match,
  jornada,
  currentTime,
}) => {
  const status = getMatchStatus(
    match,
    jornada,
    currentTime
  );

  const date = getMatchDateTime(match, jornada);

  const homeTeam = getHomeTeam(match);
  const awayTeam = getAwayTeam(match);

  const homeLogo = getHomeLogo(match);
  const awayLogo = getAwayLogo(match);

  return (
    <article
      className={`group relative border bg-zinc-950/80 transition-all duration-300 ${
        status === 'EN_DIRECTO'
          ? 'border-red-500/40'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-px ${
          status === 'EN_DIRECTO'
            ? 'bg-red-500'
            : 'bg-white/10 group-hover:bg-white/20'
        }`}
      />

      <div className="p-5 sm:p-7">
        {/* Match metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            {date && (
              <div className="text-2xl sm:text-3xl font-display font-bold text-white uppercase">
                {formatShortDate(date)}
              </div>
            )}

            <div className="h-8 w-px bg-white/10" />

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {date
                  ? new Intl.DateTimeFormat('es-ES', {
                      weekday: 'long',
                    }).format(date)
                  : 'Fecha pendiente'}
              </div>

              {formatTime(match, date) && (
                <div className="mt-1 text-sm font-medium text-zinc-300">
                  {formatTime(match, date)} h
                </div>
              )}
            </div>
          </div>

          <StatusBadge status={status} />
        </div>

        {/* Desktop matchup */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-8 py-10">
          {/* Home */}
          <div className="flex items-center justify-end gap-5 text-right">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">
                Local
              </div>

              <h3 className="text-lg lg:text-xl font-display font-bold uppercase tracking-wide text-white">
                {homeTeam}
              </h3>
            </div>

            <TeamLogo
              src={homeLogo}
              name={homeTeam}
              size="large"
            />
          </div>

          {/* Score */}
          <Score
            match={match}
            status={status}
          />

          {/* Away */}
          <div className="flex items-center gap-5">
            <TeamLogo
              src={awayLogo}
              name={awayTeam}
              size="large"
            />

            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">
                Visitante
              </div>

              <h3 className="text-lg lg:text-xl font-display font-bold uppercase tracking-wide text-white">
                {awayTeam}
              </h3>
            </div>
          </div>
        </div>

        {/* Mobile matchup */}
        <div className="md:hidden py-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-center">
              <TeamLogo
                src={homeLogo}
                name={homeTeam}
                size="normal"
              />

              <h3 className="mt-4 text-xs font-display font-bold uppercase tracking-wide text-white">
                {homeTeam}
              </h3>

              <div className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                Local
              </div>
            </div>

            <Score
              match={match}
              status={status}
            />

            <div className="text-center">
              <TeamLogo
                src={awayLogo}
                name={awayTeam}
                size="normal"
              />

              <h3 className="mt-4 text-xs font-display font-bold uppercase tracking-wide text-white">
                {awayTeam}
              </h3>

              <div className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                Visitante
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.15em] text-zinc-600">
            {match?.pabellon && (
              <span className="inline-flex items-center gap-2">
                <Icon
                  className="w-3.5 h-3.5"
                  path="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                />

                {match.pabellon}
              </span>
            )}

            {match?.ciudad && (
              <span>{match.ciudad}</span>
            )}
          </div>

          <YoutubeButton
            link={match?.youtubeLink}
            status={status}
          />
        </div>

        {status === 'EN_DIRECTO' && (
          <div className="mt-5 border-l-2 border-red-500 bg-red-500/5 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
              El partido está en juego
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              Sigue la retransmisión en directo desde YouTube.
            </p>
          </div>
        )}

        {status === 'CANCELADO' && (
          <div className="mt-5 border-l-2 border-red-500/50 bg-red-500/5 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
              Partido cancelado
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

/* =========================================================
   JORNADA HEADER
========================================================= */

const JornadaHeader = ({
  jornada,
  index,
}) => {
  const number =
    getJornadaNumber(jornada) ??
    index + 1;

  const dates = parseJornadaDates(
    jornada?.fechas
  );

  return (
    <div className="grid lg:grid-cols-[100px_1fr_auto] gap-6 lg:gap-10 items-end">
      <div className="hidden lg:block">
        <div className="text-5xl font-display font-bold text-zinc-800 leading-none">
          {String(number).padStart(2, '0')}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
            {jornada?.competicion || 'Competición'}
          </span>

          <span className="h-px w-8 bg-red-500/40" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight text-white">
          {getJornadaTitle(jornada)}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
          {jornada?.ciudad && (
            <span>{jornada.ciudad}</span>
          )}

          {jornada?.pabellon && (
            <>
              <span className="text-zinc-800">/</span>
              <span>{jornada.pabellon}</span>
            </>
          )}
        </div>
      </div>

      {dates.start && (
        <div className="lg:text-right">
          <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            Fecha
          </div>

          <div className="mt-1 text-sm font-medium text-zinc-300 capitalize">
            {formatDate(dates.start)}
          </div>

          {dates.end &&
            dates.start.getTime() !==
              dates.end.getTime() && (
              <div className="mt-1 text-xs text-zinc-600">
                hasta {formatDate(dates.end)}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Competitions() {
  const [jornadas, setJornadas] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [selectedTemporadaId, setSelectedTemporadaId] =
    useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  /* -------------------------------------------------------
     Fetch data
  ------------------------------------------------------- */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        temporadasResponse,
        jornadasResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/temporadas`),
        fetch(`${API_URL}/api/jornadas`),
      ]);

      if (!temporadasResponse.ok) {
        throw new Error(
          'No se pudieron cargar las temporadas.'
        );
      }

      if (!jornadasResponse.ok) {
        throw new Error(
          'No se pudieron cargar las jornadas.'
        );
      }

      const temporadasData =
        await temporadasResponse.json();

      const jornadasData =
        await jornadasResponse.json();

      const normalizedTemporadas = Array.isArray(
        temporadasData
      )
        ? temporadasData
        : temporadasData?.temporadas || [];

      const normalizedJornadas = Array.isArray(
        jornadasData
      )
        ? jornadasData
        : jornadasData?.jornadas || [];

      setTemporadas(normalizedTemporadas);
      setJornadas(normalizedJornadas);

      if (
        normalizedTemporadas.length > 0 &&
        !selectedTemporadaId
      ) {
        setSelectedTemporadaId(
          String(normalizedTemporadas[0].id)
        );
      }
    } catch (err) {
      console.error(
        'Error cargando competiciones:',
        err
      );

      setError(
        err?.message ||
          'No se pudieron cargar las competiciones.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* -------------------------------------------------------
     Update current time
     Needed for live match detection.
  ------------------------------------------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------
     Selected season
  ------------------------------------------------------- */

  const temporadaActual = useMemo(() => {
    return temporadas.find(
      (temporada) =>
        String(temporada.id) ===
        String(selectedTemporadaId)
    );
  }, [
    temporadas,
    selectedTemporadaId,
  ]);

  /* -------------------------------------------------------
     Filter jornadas
  ------------------------------------------------------- */

  const jornadasFiltradas = useMemo(() => {
    return jornadas
      .filter((jornada) => {
        if (jornada?.isActive !== true) {
          return false;
        }

        return (
          String(jornada?.temporadaId) ===
          String(selectedTemporadaId)
        );
      })
      .sort((a, b) => {
        const numberA = getJornadaNumber(a);
        const numberB = getJornadaNumber(b);

        if (
          numberA !== null &&
          numberB !== null
        ) {
          return numberA - numberB;
        }

        return String(a?.numero || '').localeCompare(
          String(b?.numero || ''),
          'es',
          { numeric: true }
        );
      });
  }, [
    jornadas,
    selectedTemporadaId,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="min-h-[70vh] flex items-center justify-center px-6">
          <div
            className="text-center"
            aria-live="polite"
          >
            <div className="w-10 h-10 border border-white/10 border-t-red-500 rounded-full animate-spin mx-auto" />

            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              Cargando competiciones
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
              Error
            </div>

            <h1 className="mt-4 text-3xl font-display font-bold uppercase">
              No se pudieron cargar las competiciones
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchData}
              className="mt-8 inline-flex items-center gap-3 bg-red-600 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500"
            >
              Reintentar

              <Icon
                className="w-4 h-4"
                path="M20 11a8.1 8.1 0 0 0-15.5-3M4 4v4h4M4 13a8.1 8.1 0 0 0 15.5 3M20 20v-4h-4"
              />
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-red-600/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-7">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
                Calendario oficial
              </span>

              <span className="h-px w-12 bg-red-500/50" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-bold uppercase tracking-tight leading-[0.9]">
              Competiciones
            </h1>

            <p className="mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-500">
              Sigue la temporada de Lobos Quad Rugby,
              conoce nuestras jornadas y consulta todos
              los enfrentamientos de la manada.
            </p>
          </div>

          {/* Season selector */}
          {temporadas.length > 0 && (
            <div className="mt-14 lg:mt-20 max-w-md">
              <label
                htmlFor="temporada"
                className="block mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-600"
              >
                Temporada
              </label>

              <div className="relative">
                <select
                  id="temporada"
                  value={selectedTemporadaId}
                  onChange={(event) =>
                    setSelectedTemporadaId(
                      event.target.value
                    )
                  }
                  className="w-full appearance-none border border-white/15 bg-zinc-950 px-5 py-4 pr-12 text-sm font-bold uppercase tracking-wider text-white outline-none transition-colors focus:border-red-500"
                  aria-label="Seleccionar temporada"
                >
                  {temporadas.map((temporada) => (
                    <option
                      key={temporada.id}
                      value={temporada.id}
                      className="bg-zinc-950"
                    >
                      {temporada.nombre ||
                        temporada.temporada ||
                        temporada.name ||
                        temporada.id}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Icon
                    className="w-4 h-4"
                    path="m6 9 6 6 6-6"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================
          SEASON INTRO
      =================================================== */}

      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600">
                Temporada seleccionada
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold uppercase">
                {temporadaActual?.nombre ||
                  temporadaActual?.temporada ||
                  temporadaActual?.name ||
                  'Temporada'}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-display font-bold text-white">
                {jornadasFiltradas.length
                  .toString()
                  .padStart(2, '0')}
              </div>

              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                Jornadas activas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          JORNADAS
      =================================================== */}

      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
        {jornadasFiltradas.length === 0 ? (
          <div className="border border-white/10 py-20 px-6 text-center">
            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              Sin jornadas
            </div>

            <h2 className="mt-4 text-2xl font-display font-bold uppercase text-zinc-300">
              No hay jornadas disponibles
            </h2>

            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed text-zinc-600">
              Todavía no hay competiciones publicadas
              para esta temporada.
            </p>
          </div>
        ) : (
          <div className="space-y-24">
            {jornadasFiltradas.map(
              (jornada, jornadaIndex) => (
                <section
                  key={
                    jornada.id ||
                    `${jornada.temporadaId}-${jornada.numero}-${jornadaIndex}`
                  }
                >
                  <JornadaHeader
                    jornada={jornada}
                    index={jornadaIndex}
                  />

                  {/* Banner */}
                  {jornada?.bannerUrl && (
                    <div className="relative mt-10 overflow-hidden border border-white/10 aspect-[21/7] bg-zinc-950">
                      <img
                        src={getImageUrl(
                          jornada.bannerUrl
                        )}
                        alt={
                          jornada?.competicion ||
                          'Competición Lobos Quad Rugby'
                        }
                        className="w-full h-full object-cover grayscale opacity-70 transition-all duration-500 hover:grayscale-0 hover:opacity-90"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            'none';
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/60 pointer-events-none" />
                    </div>
                  )}

                  {/* Matches */}
                  <div className="mt-10 space-y-4">
                    {Array.isArray(
                      jornada?.partidos
                    ) &&
                    jornada.partidos.length > 0 ? (
                      jornada.partidos.map(
                        (match, matchIndex) => (
                          <MatchCard
                            key={
                              match.id ||
                              `${jornada.id}-match-${matchIndex}`
                            }
                            match={match}
                            jornada={jornada}
                            currentTime={currentTime}
                          />
                        )
                      )
                    ) : (
                      <div className="border border-white/10 px-6 py-12 text-center">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-700">
                          Partidos
                        </div>

                        <p className="mt-3 text-sm text-zinc-600">
                          No hay partidos publicados
                          para esta jornada.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </section>

      {/* ===================================================
          CTA
      =================================================== */}

      <section className="border-t border-white/10 bg-red-600">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-200">
                Fuera de la pista
              </div>

              <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold uppercase leading-[0.95]">
                Vive la manada
              </h2>

              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-red-100/80">
                Entrena con nosotros, descubre el
                wheelchair rugby y forma parte de Lobos.
              </p>
            </div>

            <Link
              to="/entrenamientos"
              className="inline-flex items-center justify-between gap-8 border border-white/30 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-black hover:border-black"
            >
              Ver entrenamientos

              <Icon
                className="w-4 h-4"
                path="M5 12h14M13 6l6 6-6 6"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

/* =========================================================
   ICONS
========================================================= */

const ClockIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7v5l3 2"
    />
  </svg>
);

const MapPinIcon = ({ className = 'w-5 h-5' }) => (
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
      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
    />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const CalendarIcon = ({ className = 'w-5 h-5' }) => (
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
      d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
    />
  </svg>
);

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

const ChevronLeftIcon = ({ className = 'w-5 h-5' }) => (
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
      d="m15 18-6-6 6-6"
    />
  </svg>
);

const ChevronRightIcon = ({ className = 'w-5 h-5' }) => (
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
      d="m9 18 6-6-6-6"
    />
  </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
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

const CheckIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5 12 4 4L19 7"
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
   HELPERS
========================================================= */

const getEventTypeStyle = (type) => {
  const normalized = String(type || '').toUpperCase();

  if (
    normalized === 'PUERTAS ABIERTAS' ||
    normalized === 'JORNADA DE PUERTAS ABIERTAS'
  ) {
    return {
      wrapper:
        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
    };
  }

  if (
    normalized === 'CLINICA' ||
    normalized === 'CLÍNICA'
  ) {
    return {
      wrapper:
        'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dot: 'bg-blue-400',
    };
  }

  return {
    wrapper:
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
  };
};

/* =========================================================
   DATE HELPERS
========================================================= */

/*
 * El modelo Evento no tiene dateISO.
 *
 * Los campos disponibles son:
 * date  -> día
 * month -> mes
 * day   -> día de la semana
 *
 * Por eso construimos una fecha únicamente para ordenar.
 */

const MONTHS = {
  ENERO: 0,
  FEBRERO: 1,
  MARZO: 2,
  ABRIL: 3,
  MAYO: 4,
  JUNIO: 5,
  JULIO: 6,
  AGOSTO: 7,
  SEPTIEMBRE: 8,
  SETIEMBRE: 8,
  OCTUBRE: 9,
  NOVIEMBRE: 10,
  DICIEMBRE: 11,

  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
};

const normalizeMonth = (month) => {
  if (!month) return null;

  const value = String(month)
    .trim()
    .toUpperCase()
    .replace(
      /Á/g,
      'A'
    )
    .replace(
      /É/g,
      'E'
    )
    .replace(
      /Í/g,
      'I'
    )
    .replace(
      /Ó/g,
      'O'
    )
    .replace(
      /Ú/g,
      'U'
    );

  if (
    Object.prototype.hasOwnProperty.call(
      MONTHS,
      value
    )
  ) {
    return MONTHS[value];
  }

  const numericMonth = Number(value);

  if (
    Number.isInteger(numericMonth) &&
    numericMonth >= 1 &&
    numericMonth <= 12
  ) {
    return numericMonth - 1;
  }

  const shortMonth = value.slice(0, 3);

  const match = Object.entries(
    MONTHS
  ).find(([name]) =>
    name.startsWith(shortMonth)
  );

  return match ? match[1] : null;
};

const getEventDate = (evento) => {
  if (!evento) return null;

  /*
   * Compatibilidad con una eventual versión futura
   * que incluya dateISO.
   */
  if (evento.dateISO) {
    const dateISO = new Date(
      evento.dateISO
    );

    if (
      !Number.isNaN(
        dateISO.getTime()
      )
    ) {
      return dateISO;
    }
  }

  /*
   * Para eventos finalizados, completedAt es la
   * referencia más fiable disponible en el modelo.
   */
  if (evento.completedAt) {
    const completedAt = new Date(
      evento.completedAt
    );

    if (
      !Number.isNaN(
        completedAt.getTime()
      )
    ) {
      return completedAt;
    }
  }

  const day = parseInt(
    String(evento.date || '').replace(
      /\D/g,
      ''
    ),
    10
  );

  const month = normalizeMonth(
    evento.month
  );

  if (
    !Number.isInteger(day) ||
    month === null
  ) {
    return null;
  }

  const now = new Date();

  let year = now.getFullYear();

  let date = new Date(
    year,
    month,
    day
  );

  /*
   * Para un evento PROGRAMADO cuya fecha ya pasó,
   * asumimos el siguiente año para poder ordenar
   * correctamente el calendario.
   *
   * Esto solamente afecta a la ordenación visual.
   * El estado real lo controla el administrador.
   */
  if (
    evento.status !== 'FINALIZADO' &&
    date < new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
  ) {
    year += 1;

    date = new Date(
      year,
      month,
      day
    );
  }

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};

/*
 * IMPORTANTE:
 *
 * El estado real del evento viene del backend.
 *
 * FINALIZADO = historial
 * PROGRAMADO = próximo
 *
 * completedAt queda como respaldo.
 *
 * No utilizamos la fecha para decidir si un evento
 * está realizado porque el administrador es quien
 * confirma que realmente terminó.
 */
const isEventCompleted = (evento) => {
  if (!evento) return false;

  const status = String(
    evento.status ||
      evento.estado ||
      ''
  )
    .trim()
    .toUpperCase();

  if (
    status === 'FINALIZADO' ||
    status === 'COMPLETADO' ||
    status === 'REALIZADO' ||
    status === 'FINISHED' ||
    status === 'COMPLETED'
  ) {
    return true;
  }

  if (evento.completedAt) {
    return true;
  }

  /*
   * Compatibilidad con datos antiguos que pudieran
   * utilizar isCompleted.
   */
  if (evento.isCompleted === true) {
    return true;
  }

  return false;
};

const formatEventDate = (evento) => {
  const date = getEventDate(evento);

  /*
   * Si no podemos construir una fecha real,
   * utilizamos directamente los valores guardados.
   */
  if (!date) {
    return {
      day: evento?.date || '—',
      month: evento?.month || '',
      weekday: evento?.day || '',
    };
  }

  return {
    day: new Intl.DateTimeFormat(
      'es-ES',
      {
        day: '2-digit',
      }
    ).format(date),

    month: new Intl.DateTimeFormat(
      'es-ES',
      {
        month: 'short',
      }
    )
      .format(date)
      .replace('.', '')
      .toUpperCase(),

    weekday: new Intl.DateTimeFormat(
      'es-ES',
      {
        weekday: 'long',
      }
    ).format(date),
  };
};

/* =========================================================
   PHOTO HELPERS
========================================================= */

/*
 * El backend Prisma devuelve:
 *
 * evento.fotos
 *
 * No:
 *
 * evento.photos
 *
 * Mantenemos ambos para compatibilidad.
 */
const getEventPhotos = (evento) => {
  const photos =
    evento?.fotos ??
    evento?.photos ??
    [];

  if (!Array.isArray(photos)) {
    return [];
  }

  return photos.filter((photo) => {
    if (typeof photo === 'string') {
      return Boolean(photo);
    }

    return Boolean(
      photo?.url ||
        photo?.secure_url ||
        photo?.secureUrl
    );
  });
};

const getPhotoUrl = (photo) => {
  if (typeof photo === 'string') {
    return photo;
  }

  return (
    photo?.url ||
    photo?.secure_url ||
    photo?.secureUrl ||
    ''
  );
};

/* =========================================================
   SKELETON EVENT
========================================================= */

const EventSkeleton = () => (
  <div
    className="bg-zinc-950 border border-zinc-800 p-5 sm:p-6 animate-pulse"
    aria-hidden="true"
  >
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-28 h-28 bg-zinc-900 border border-zinc-800" />

      <div className="flex-1 space-y-4">
        <div className="h-4 w-32 bg-zinc-800" />
        <div className="h-7 w-2/3 bg-zinc-800" />
        <div className="h-4 w-1/2 bg-zinc-800" />
        <div className="h-4 w-full max-w-xl bg-zinc-800" />
      </div>
    </div>
  </div>
);

/* =========================================================
   EVENT CARD
========================================================= */

const EventCard = ({
  evento,
  past = false,
  onRegister,
  onOpenGallery,
}) => {
  const typeStyle =
    getEventTypeStyle(
      evento?.type
    );

  const date =
    formatEventDate(evento);

  const photos =
    getEventPhotos(evento);

  return (
    <article
      className={`group bg-zinc-950 border ${
        past
          ? 'border-zinc-800'
          : 'border-zinc-800 hover:border-red-600/50'
      } transition-all duration-300 overflow-hidden`}
    >
      <div className="p-5 sm:p-6 md:p-7">
        <div className="flex flex-col md:flex-row gap-6">

          {/* DATE */}

          <div className="shrink-0">
            <div className="w-full md:w-28 h-24 md:h-28 bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">

              <div
                className={`absolute top-0 left-0 w-full h-[2px] ${
                  past
                    ? 'bg-zinc-700'
                    : 'bg-red-600'
                }`}
              />

              <span className="font-display text-3xl md:text-4xl text-white leading-none">
                {date.day}
              </span>

              <span
                className={`text-[10px] uppercase tracking-[0.18em] mt-2 ${
                  past
                    ? 'text-zinc-500'
                    : 'text-red-500'
                }`}
              >
                {date.month}
              </span>

              <span className="text-zinc-600 text-[9px] uppercase tracking-[0.15em] mt-1">
                {date.weekday}
              </span>

            </div>
          </div>

          {/* INFO */}

          <div className="flex-1 min-w-0">

            <div className="flex flex-wrap items-center gap-3 mb-3">

              {past ? (
                <span className="inline-flex items-center gap-2 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] border bg-zinc-800/60 text-zinc-400 border-zinc-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Evento realizado
                </span>
              ) : (
                evento?.type && (
                  <span
                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] border ${typeStyle.wrapper}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`}
                    />

                    {evento.type}
                  </span>
                )
              )}

              {!past &&
                evento?.time && (
                  <span className="inline-flex items-center gap-2 text-zinc-600 text-[10px] uppercase tracking-[0.12em]">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {evento.time}
                  </span>
                )}

            </div>

            <h3
              className={`font-display text-2xl md:text-3xl text-white mb-3 transition-colors ${
                past
                  ? ''
                  : 'group-hover:text-red-500'
              }`}
            >
              {evento?.name ||
                'Evento'}
            </h3>

            {evento?.location && (
              <div className="flex items-start gap-2 text-zinc-500 text-sm mb-3">
                <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-zinc-700" />

                <span>
                  {evento.location}
                </span>
              </div>
            )}

            {evento?.description && (
              <p className="text-zinc-600 text-sm leading-relaxed max-w-3xl">
                {evento.description}
              </p>
            )}

          </div>

          {/* ARROW */}

          {!past && (
            <div className="hidden md:flex items-start justify-end">
              <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-red-500 group-hover:border-red-600/40 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          )}

        </div>

        {/* REGISTRATION */}

        {!past &&
          evento?.isPublic && (
            <div className="mt-6 pt-5 border-t border-zinc-800">

              <button
                type="button"
                onClick={() =>
                  onRegister(evento)
                }
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
              >
                Inscribirme al evento

                <ArrowUpRight className="w-4 h-4" />
              </button>

            </div>
          )}

        {/* GALLERY BUTTON */}

        {past &&
          photos.length > 0 && (
            <div className="mt-6 pt-5 border-t border-zinc-800">

              <button
                type="button"
                onClick={() =>
                  onOpenGallery(
                    evento
                  )
                }
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
              >
                Ver galería

                <ArrowUpRight className="w-4 h-4" />
              </button>

            </div>
          )}

        {/* INLINE GALLERY PREVIEW */}

        {past &&
          photos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-800">

              <div className="flex items-center justify-between gap-4 mb-4">

                <div>
                  <p className="text-red-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">
                    Recuerdos
                  </p>

                  <p className="text-zinc-600 text-[10px] uppercase tracking-[0.15em]">
                    {photos.length}{' '}
                    {photos.length ===
                    1
                      ? 'fotografía'
                      : 'fotografías'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenGallery(
                      evento
                    )
                  }
                  className="text-zinc-600 hover:text-white text-[9px] font-bold uppercase tracking-[0.15em] transition-colors"
                >
                  Ver todas
                </button>

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                {photos
                  .slice(0, 4)
                  .map(
                    (
                      photo,
                      index
                    ) => {
                      const url =
                        getPhotoUrl(
                          photo
                        );

                      return (
                        <button
                          key={`${evento.id}-photo-${index}`}
                          type="button"
                          onClick={() =>
                            onOpenGallery(
                              evento,
                              index
                            )
                          }
                          className="relative aspect-[4/3] overflow-hidden bg-zinc-900 group/photo"
                          aria-label={`Ver fotografía ${index + 1}`}
                        >
                          <img
                            src={url}
                            alt={`${evento?.name || 'Evento'} — fotografía ${index + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover grayscale group-hover/photo:grayscale-0 group-hover/photo:scale-105 transition-all duration-700"
                          />

                          <div className="absolute inset-0 bg-black/10 group-hover/photo:bg-transparent transition-colors" />

                          {index ===
                            3 &&
                            photos.length >
                              4 && (
                              <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                                <span className="text-white font-display text-xl">
                                  +
                                  {photos.length -
                                    4}
                                </span>
                              </div>
                            )}
                        </button>
                      );
                    }
                  )}

              </div>

            </div>
          )}

      </div>
    </article>
  );
};

/* =========================================================
   GALLERY MODAL
========================================================= */

const GalleryModal = ({
  evento,
  currentIndex,
  setCurrentIndex,
  onClose,
}) => {
  if (!evento) return null;

  const photos =
    getEventPhotos(evento);

  if (!photos.length) return null;

  const currentPhoto =
    photos[currentIndex] ||
    photos[0];

  const currentUrl =
    getPhotoUrl(currentPhoto);

  const previousPhoto = () => {
    setCurrentIndex(
      (current) =>
        current === 0
          ? photos.length - 1
          : current - 1
    );
  };

  const nextPhoto = () => {
    setCurrentIndex(
      (current) =>
        current ===
        photos.length - 1
          ? 0
          : current + 1
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${evento.name || 'evento'}`}
      onMouseDown={onClose}
    >

      <div
        className="relative w-full max-w-6xl h-full max-h-[92vh] flex flex-col"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="shrink-0 flex items-center justify-between gap-4 pb-4">

          <div className="min-w-0">

            <p className="text-red-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">
              Galería
            </p>

            <h2 className="font-display text-xl sm:text-2xl text-white uppercase truncate">
              {evento.name ||
                'Evento'}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar galería"
            className="shrink-0 w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

        </div>

        {/* MAIN IMAGE */}

        <div className="relative flex-1 min-h-0 bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">

          <img
            src={currentUrl}
            alt={`${evento.name || 'Evento'} — fotografía ${currentIndex + 1}`}
            className="max-w-full max-h-full w-full h-full object-contain"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousPhoto}
                aria-label="Fotografía anterior"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-black/70 border border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 transition-colors flex items-center justify-center"
              >
                <ChevronLeftIcon />
              </button>

              <button
                type="button"
                onClick={nextPhoto}
                aria-label="Fotografía siguiente"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-black/70 border border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 transition-colors flex items-center justify-center"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 border border-zinc-800 px-4 py-2 text-white text-[9px] font-bold uppercase tracking-[0.15em]">
            {currentIndex + 1} /{' '}
            {photos.length}
          </div>

        </div>

        {/* THUMBNAILS */}

        {photos.length > 1 && (
          <div className="shrink-0 pt-4 overflow-x-auto">

            <div className="flex gap-2 min-w-max">

              {photos.map(
                (
                  photo,
                  index
                ) => {
                  const url =
                    getPhotoUrl(
                      photo
                    );

                  return (
                    <button
                      key={`thumbnail-${index}`}
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          index
                        )
                      }
                      className={`relative w-20 h-14 sm:w-24 sm:h-16 overflow-hidden border transition-all ${
                        index ===
                        currentIndex
                          ? 'border-red-600'
                          : 'border-zinc-800 opacity-50 hover:opacity-100'
                      }`}
                      aria-label={`Ver fotografía ${index + 1}`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                }
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

/* =========================================================
   TRAINING
========================================================= */

export default function Training() {
  const [eventos, setEventos] =
    useState([]);

  const [loadingEventos, setLoadingEventos] =
    useState(true);

  const [errorEventos, setErrorEventos] =
    useState(null);

  const eventosAbortControllerRef =
    useRef(null);

  const [inscricaoModal, setInscricaoModal] =
    useState(null);

  const [galleryModal, setGalleryModal] =
    useState(null);

  const [galleryIndex, setGalleryIndex] =
    useState(0);

  const [inscricaoForm, setInscricaoForm] =
    useState({
      fullName: '',
      email: '',
      phone: '',
      message: '',
    });

  const [inscricaoSucesso, setInscricaoSucesso] =
    useState(false);

  const [inscricaoLoading, setInscricaoLoading] =
    useState(false);

  const [inscricaoError, setInscricaoError] =
    useState(null);

  /* =======================================================
     FETCH EVENTOS
  ======================================================= */

  const fetchEventos =
    useCallback(async () => {
      setLoadingEventos(true);
      setErrorEventos(null);

      if (
        eventosAbortControllerRef.current
      ) {
        eventosAbortControllerRef.current.abort();
      }

      const controller =
        new AbortController();

      eventosAbortControllerRef.current =
        controller;

      try {
        if (!API_URL) {
          throw new Error(
            'La configuración de la API no está disponible.'
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/eventos`,
            {
              signal:
                controller.signal,
              headers: {
                Accept:
                  'application/json',
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status}`
          );
        }

        const data =
          await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            'El servidor devolvió datos inválidos.'
          );
        }

        /*
         * El backend público debe devolver únicamente
         * eventos activos y públicos.
         *
         * Mantenemos la comprobación de isActive aquí
         * como segunda capa de seguridad visual.
         */
        const eventosActivos =
          data
            .filter(
              (evento) =>
                evento?.isActive === true &&
                (
                  evento?.isPublic === true ||
                  evento?.status ===
                    'FINALIZADO'
                )
            );

        setEventos(
          eventosActivos
        );

      } catch (error) {
        if (
          error?.name ===
          'AbortError'
        ) {
          return;
        }

        console.error(
          'Error al cargar eventos:',
          error
        );

        setErrorEventos(
          'No hemos podido cargar los eventos.'
        );

        setEventos([]);

      } finally {
        if (
          eventosAbortControllerRef.current ===
          controller
        ) {
          setLoadingEventos(
            false
          );

          eventosAbortControllerRef.current =
            null;
        }
      }
    }, []);

  useEffect(() => {
    fetchEventos();

    return () => {
      if (
        eventosAbortControllerRef.current
      ) {
        eventosAbortControllerRef.current.abort();

        eventosAbortControllerRef.current =
          null;
      }
    };
  }, [fetchEventos]);

  /* =======================================================
     SEPARAR EVENTOS
  ======================================================= */

  const {
    proximosEventos,
    eventosRealizados,
  } = useMemo(() => {
    const proximos = [];
    const realizados = [];

    eventos.forEach((evento) => {
      if (
        isEventCompleted(
          evento
        )
      ) {
        realizados.push(
          evento
        );
      } else {
        proximos.push(
          evento
        );
      }
    });

    /*
     * PRÓXIMOS
     *
     * Ordenamos por día/mes cuando es posible.
     */
    proximos.sort((a, b) => {
      const dateA =
        getEventDate(a)?.getTime() ??
        Number.MAX_SAFE_INTEGER;

      const dateB =
        getEventDate(b)?.getTime() ??
        Number.MAX_SAFE_INTEGER;

      return dateA - dateB;
    });

    /*
     * HISTORIAL
     *
     * completedAt tiene prioridad porque representa
     * el momento real en que el administrador finalizó
     * el evento.
     */
    realizados.sort((a, b) => {
      const completedA =
        a?.completedAt
          ? new Date(
              a.completedAt
            ).getTime()
          : 0;

      const completedB =
        b?.completedAt
          ? new Date(
              b.completedAt
            ).getTime()
          : 0;

      if (
        completedA &&
        completedB
      ) {
        return (
          completedB -
          completedA
        );
      }

      const dateA =
        getEventDate(a)?.getTime() ??
        0;

      const dateB =
        getEventDate(b)?.getTime() ??
        0;

      return dateB - dateA;
    });

    return {
      proximosEventos:
        proximos,
      eventosRealizados:
        realizados,
    };
  }, [eventos]);

  /* =======================================================
     ABRIR INSCRIPCIÓN
  ======================================================= */

  const abrirInscricao = (
    evento
  ) => {
    setInscricaoModal(
      evento
    );

    setInscricaoForm({
      fullName: '',
      email: '',
      phone: '',
      message: '',
    });

    setInscricaoSucesso(
      false
    );

    setInscricaoError(
      null
    );
  };

  /* =======================================================
     CERRAR MODAL INSCRIPCIÓN
  ======================================================= */

  const fecharInscricao =
    useCallback(() => {
      if (
        inscricaoLoading
      ) {
        return;
      }

      setInscricaoModal(
        null
      );

      setInscricaoSucesso(
        false
      );

      setInscricaoError(
        null
      );
    }, [
      inscricaoLoading,
    ]);

  /* =======================================================
     GALERÍA
  ======================================================= */

  const abrirGaleria =
    useCallback(
      (
        evento,
        index = 0
      ) => {
        const photos =
          getEventPhotos(
            evento
          );

        if (
          !photos.length
        ) {
          return;
        }

        setGalleryModal(
          evento
        );

        setGalleryIndex(
          Math.min(
            Math.max(
              index,
              0
            ),
            photos.length - 1
          )
        );
      },
      []
    );

  const fecharGaleria =
    useCallback(() => {
      setGalleryModal(
        null
      );

      setGalleryIndex(
        0
      );
    }, []);

  /* =======================================================
     ESC + TECLAS DE NAVEGACIÓN
  ======================================================= */

  useEffect(() => {
    if (
      !inscricaoModal &&
      !galleryModal
    ) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        if (
          galleryModal
        ) {
          fecharGaleria();
          return;
        }

        if (
          inscricaoModal
        ) {
          fecharInscricao();
        }
      }

      if (
        galleryModal &&
        event.key ===
          'ArrowLeft'
      ) {
        const photos =
          getEventPhotos(
            galleryModal
          );

        if (
          photos.length > 1
        ) {
          setGalleryIndex(
            (current) =>
              current === 0
                ? photos.length -
                  1
                : current - 1
          );
        }
      }

      if (
        galleryModal &&
        event.key ===
          'ArrowRight'
      ) {
        const photos =
          getEventPhotos(
            galleryModal
          );

        if (
          photos.length > 1
        ) {
          setGalleryIndex(
            (current) =>
              current ===
              photos.length - 1
                ? 0
                : current + 1
          );
        }
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    inscricaoModal,
    galleryModal,
    fecharInscricao,
    fecharGaleria,
  ]);

  /* =======================================================
     FORM
  ======================================================= */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setInscricaoForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (
      inscricaoError
    ) {
      setInscricaoError(
        null
      );
    }
  };

  /* =======================================================
     ENVIAR INSCRIPCIÓN
  ======================================================= */

  const enviarInscricao =
    async (event) => {
      event.preventDefault();

      if (
        !inscricaoModal?.id
      ) {
        setInscricaoError(
          'No se ha podido identificar el evento.'
        );

        return;
      }

      setInscricaoLoading(
        true
      );

      setInscricaoError(
        null
      );

      try {
        if (!API_URL) {
          throw new Error(
            'La configuración de la API no está disponible.'
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/inscricoes-eventos`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
                Accept:
                  'application/json',
              },

              body: JSON.stringify(
                {
                  ...inscricaoForm,

                  fullName:
                    inscricaoForm.fullName.trim(),

                  email:
                    inscricaoForm.email.trim(),

                  phone:
                    inscricaoForm.phone.trim(),

                  message:
                    inscricaoForm.message.trim(),

                  eventId:
                    inscricaoModal.id,
                }
              ),
            }
          );

        if (
          !response.ok
        ) {
          let message =
            'No se ha podido completar la inscripción.';

          try {
            const data =
              await response.json();

            if (
              data?.message
            ) {
              message =
                data.message;
            }
          } catch {
            // Respuesta sin JSON
          }

          throw new Error(
            message
          );
        }

        setInscricaoSucesso(
          true
        );

      } catch (error) {
        console.error(
          'Error al enviar inscripción:',
          error
        );

        setInscricaoError(
          error?.message ||
            'Error al inscribirse. Inténtalo de nuevo.'
        );

      } finally {
        setInscricaoLoading(
          false
        );
      }
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[620px] md:min-h-[680px] flex items-center bg-zinc-950 border-b border-zinc-800 overflow-hidden">

        <div className="absolute inset-0">

          <img
            src="/assets/IMG_8358.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center grayscale opacity-60 md:opacity-70"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/95 via-55% to-zinc-950/35" />

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />

          <div className="absolute inset-0 bg-zinc-950/35 md:bg-transparent" />

        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">

          <div className="max-w-3xl">

            <div className="flex items-center gap-4 mb-6">

              <span className="w-12 h-[2px] bg-red-600" />

              <p className="text-red-500 font-bold tracking-[0.28em] text-[10px] sm:text-xs uppercase">
                Entrena con nosotros
              </p>

            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[110px] leading-[0.82] tracking-tight text-white mb-8">
              ENTRENAMIENTOS
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
              El lugar donde empieza el equipo.
              Entrenamos, competimos y crecemos juntos.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">

              <a
                href="#horarios"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-colors"
              >
                Ver horarios

                <ArrowUpRight className="w-4 h-4" />
              </a>

              <Link
                to="/unete"
                className="inline-flex items-center gap-3 text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-colors"
              >
                Quiero formar parte

                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </Link>

            </div>

          </div>

          <div className="hidden md:flex absolute right-8 bottom-10 items-center gap-4 text-zinc-600">

            <span className="text-[9px] uppercase tracking-[0.2em]">
              Lobos Quad Rugby
            </span>

            <span className="w-10 h-px bg-zinc-700" />

            <span className="text-[9px] uppercase tracking-[0.2em]">
              Valencia
            </span>

          </div>

        </div>

      </section>

      {/* =====================================================
          HORARIOS
      ===================================================== */}

      <section
        id="horarios"
        className="py-16 md:py-20 bg-zinc-950"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">

            <div>

              <div className="flex items-center gap-4 mb-4">

                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Cada semana
                </p>

              </div>

              <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                Horarios
                <br />
                <span className="text-zinc-600">
                  habituales
                </span>
              </h2>

            </div>

            <div className="hidden md:block text-right">

              <p className="text-zinc-700 text-[9px] uppercase tracking-[0.18em]">
                Entrenamiento
              </p>

              <p className="text-zinc-500 text-xs mt-1">
                Valencia, España
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

            <div className="group relative bg-zinc-900 border border-zinc-800 p-6 md:p-8 hover:border-red-600/50 transition-all duration-300 overflow-hidden">

              <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 blur-2xl group-hover:bg-red-600/10 transition-colors" />

              <MapPinIcon className="w-5 h-5 text-red-500 mb-8" />

              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mb-3">
                Ubicación
              </p>

              <h3 className="font-display text-xl md:text-2xl text-white mb-3 group-hover:text-red-500 transition-colors">
                PABELLÓN
                <br />
                MALVARROSA
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed">
                Av. de Neptú, s/n
                <br />
                46011 Valencia, España
              </p>

            </div>

            <div className="group relative bg-zinc-900 border border-zinc-800 p-6 md:p-8 hover:border-red-600/50 transition-all duration-300 overflow-hidden">

              <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 blur-2xl group-hover:bg-red-600/10 transition-colors" />

              <ClockIcon className="w-5 h-5 text-red-500 mb-8" />

              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mb-3">
                Lunes y miércoles
              </p>

              <h3 className="font-display text-3xl md:text-4xl text-white mb-3 group-hover:text-red-500 transition-colors">
                17:00
                <span className="text-zinc-600 mx-2">
                  —
                </span>
                19:30
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed">
                Sesiones semanales de entrenamiento
                y preparación del equipo.
              </p>

            </div>

            <div className="group relative bg-zinc-900 border border-zinc-800 p-6 md:p-8 hover:border-red-600/50 transition-all duration-300 overflow-hidden">

              <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 blur-2xl group-hover:bg-red-600/10 transition-colors" />

              <CalendarIcon className="w-5 h-5 text-red-500 mb-8" />

              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mb-3">
                Viernes
              </p>

              <h3 className="font-display text-3xl md:text-4xl text-white mb-3 group-hover:text-red-500 transition-colors">
                10:00
                <span className="text-zinc-600 mx-2">
                  —
                </span>
                11:30
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed">
                Sesión matinal de entrenamiento y
                preparación de nuevos jugadores.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          GALERÍA
      ===================================================== */}

      <section className="py-20 md:py-28 bg-zinc-900 border-y border-zinc-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-6 mb-10">

            <div>

              <div className="flex items-center gap-4 mb-4">

                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  En acción
                </p>

              </div>

              <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                Así se
                <br />
                <span className="text-zinc-600">
                  entrena
                </span>
              </h2>

            </div>

            <p className="hidden md:block text-zinc-600 text-[10px] uppercase tracking-[0.18em]">
              Lobos Quad Rugby
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">

            <div className="relative aspect-[4/3] overflow-hidden group">

              <img
                src="/assets/IMG_8325.jpg"
                alt="Equipo Lobos Quad Rugby durante entrenamiento"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">

                <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  Entrenamiento
                </p>

                <p className="text-white text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
                  Intensidad y esfuerzo
                </p>

              </div>

            </div>

            <div className="relative aspect-[4/3] overflow-hidden group">

              <img
                src="/assets/IMG_8356.jpg"
                alt="Jugadores de Lobos Quad Rugby en competición"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">

                <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  Competición
                </p>

                <p className="text-white text-xl md:text-2xl font-display font-bold uppercase tracking-wide">
                  Compromiso y pasión
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRÓXIMOS EVENTOS
      ===================================================== */}

      <section className="py-16 md:py-20 bg-zinc-950">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

            <div>

              <div className="flex items-center gap-4 mb-4">

                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Calendario
                </p>

              </div>

              <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                Próximos
                <br />
                <span className="text-zinc-600">
                  eventos
                </span>
              </h2>

            </div>

            {!loadingEventos &&
              !errorEventos &&
              proximosEventos.length >
                0 && (

                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.18em]">

                  {proximosEventos.length}{' '}

                  {proximosEventos.length ===
                  1
                    ? 'evento programado'
                    : 'eventos programados'}

                </p>
              )}

          </div>

          {loadingEventos && (
            <div className="space-y-4">
              <EventSkeleton />
              <EventSkeleton />
            </div>
          )}

          {!loadingEventos &&
            errorEventos && (

              <div className="border border-zinc-800 bg-zinc-950 p-10 md:p-14 text-center">

                <RefreshIcon className="w-8 h-8 text-red-500 mx-auto mb-5" />

                <h3 className="font-display text-2xl text-white mb-3">
                  No hemos podido cargar los eventos
                </h3>

                <p className="text-zinc-500 text-sm mb-7">
                  {errorEventos}
                </p>

                <button
                  type="button"
                  onClick={
                    fetchEventos
                  }
                  disabled={
                    loadingEventos
                  }
                  className="inline-flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/40 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-colors"
                >
                  <RefreshIcon className="w-4 h-4" />

                  {loadingEventos
                    ? 'Cargando...'
                    : 'Reintentar'}
                </button>

              </div>
            )}

          {!loadingEventos &&
            !errorEventos &&
            proximosEventos.length >
              0 && (

              <div className="space-y-4">

                {proximosEventos.map(
                  (evento) => (
                    <EventCard
                      key={evento.id}
                      evento={evento}
                      past={false}
                      onRegister={
                        abrirInscricao
                      }
                      onOpenGallery={
                        abrirGaleria
                      }
                    />
                  )
                )}

              </div>
            )}

          {!loadingEventos &&
            !errorEventos &&
            proximosEventos.length ===
              0 && (

              <div className="border border-zinc-800 bg-zinc-950 p-12 md:p-16 text-center">

                <CalendarIcon className="w-10 h-10 text-zinc-700 mx-auto mb-6" />

                <h3 className="font-display text-2xl md:text-3xl text-zinc-400 mb-3">
                  No hay próximos eventos
                </h3>

                <p className="text-zinc-600 text-sm max-w-md mx-auto leading-relaxed">
                  En este momento no hay eventos
                  especiales programados. Consulta
                  nuestros horarios habituales de
                  entrenamiento.
                </p>

              </div>
            )}

        </div>

      </section>

      {/* =====================================================
          EVENTOS REALIZADOS
      ===================================================== */}

      {!loadingEventos &&
        !errorEventos &&
        eventosRealizados.length >
          0 && (

          <section className="py-16 md:py-24 bg-zinc-900 border-y border-zinc-800">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

                <div>

                  <div className="flex items-center gap-4 mb-4">

                    <span className="w-10 h-[2px] bg-red-600" />

                    <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                      Nuestro recorrido
                    </p>

                  </div>

                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                    Eventos
                    <br />
                    <span className="text-zinc-600">
                      realizados
                    </span>
                  </h2>

                </div>

                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.18em]">
                  Momentos que forman nuestra historia
                </p>

              </div>

              <div className="space-y-4">

                {eventosRealizados.map(
                  (evento) => (
                    <EventCard
                      key={evento.id}
                      evento={evento}
                      past
                      onRegister={
                        abrirInscricao
                      }
                      onOpenGallery={
                        abrirGaleria
                      }
                    />
                  )
                )}

              </div>

            </div>

          </section>
        )}

      {/* =====================================================
          MAPA
      ===================================================== */}

      <section className="py-16 md:py-20 bg-zinc-950">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">

            <div>

              <div className="flex items-center gap-4 mb-4">

                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Encuéntranos
                </p>

              </div>

              <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-tight">
                Nuestra
                <br />
                <span className="text-zinc-600">
                  ubicación
                </span>
              </h2>

            </div>

            <div className="flex items-center gap-2 text-zinc-600 text-[10px] uppercase tracking-[0.15em]">

              <MapPinIcon className="w-4 h-4 text-red-500" />

              Valencia, España

            </div>

          </div>

          <div className="relative bg-zinc-900 border border-zinc-800 overflow-hidden group">

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3079.3920446386073!2d-0.32886762490259597!3d39.48306121193713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6048770f04218d%3A0xd97df836238c0cd7!2sPabell%C3%B3n%20Malvarrosa!5e0!3m2!1ses!2ses!4v1788012711007!5m2!1ses!2ses"
              width="100%"
              height="420"
              style={{
                border: 0,
                filter:
                  'grayscale(1) invert(0.9) contrast(1.2)',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Ubicación Pabellón Malvarrosa"
            />

            <div className="absolute bottom-4 left-4 bg-zinc-950/95 backdrop-blur border border-zinc-800 px-4 py-3 pointer-events-none">

              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.18em] mb-1">
                Entrenamientos
              </p>

              <p className="text-xs text-white font-medium">
                Pabellón Malvarrosa
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="relative py-20 md:py-28 bg-red-600 overflow-hidden">

        <div className="absolute -right-6 -bottom-16 font-display text-[180px] md:text-[260px] leading-none text-black/10 select-none">
          L
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">

          <p className="text-red-100/80 text-[10px] uppercase tracking-[0.25em] font-bold mb-5">
            El siguiente paso
          </p>

          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl text-white leading-none mb-6">
            ¿LISTO PARA
            <br />
            ENTRENAR?
          </h2>

          <p className="text-red-100 text-base md:text-xl max-w-2xl mx-auto mb-9 leading-relaxed">
            Únete al equipo y descubre el rugby en silla de ruedas.
          </p>

          <Link
            to="/unete"
            className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-2xl"
          >
            Quiero unirme

            <ArrowUpRight className="w-4 h-4" />
          </Link>

        </div>

      </section>

      {/* =====================================================
          MODAL INSCRIPCIÓN
      ===================================================== */}

      {inscricaoModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inscripcion-title"
          onMouseDown={
            fecharInscricao
          }
        >

          <div
            className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto bg-zinc-900 border border-zinc-800 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="relative p-6 sm:p-8 border-b border-zinc-800 overflow-hidden">

              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-red-600/10 blur-3xl" />

              <button
                type="button"
                onClick={
                  fecharInscricao
                }
                disabled={
                  inscricaoLoading
                }
                aria-label="Cerrar inscripción"
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-40"
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              <p className="relative text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                Inscripción
              </p>

              <h2
                id="inscripcion-title"
                className="relative font-display text-3xl sm:text-4xl text-white leading-none pr-12"
              >
                {inscricaoModal.name ||
                  'Inscribirme'}
              </h2>

              {inscricaoModal.date && (
                <p className="relative text-zinc-500 text-sm mt-3">

                  {inscricaoModal.date}

                  {inscricaoModal.month
                    ? ` · ${inscricaoModal.month}`
                    : ''}

                  {inscricaoModal.time
                    ? ` · ${inscricaoModal.time}`
                    : ''}

                </p>
              )}

            </div>

            {inscricaoSucesso ? (

              <div className="p-8 sm:p-10 text-center">

                <div className="w-16 h-16 mx-auto mb-6 border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center">

                  <CheckIcon className="w-8 h-8 text-emerald-500" />

                </div>

                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                  Inscripción confirmada
                </p>

                <h3 className="font-display text-3xl text-white mb-4">
                  ¡Todo listo!
                </h3>

                <p className="text-zinc-400 leading-relaxed max-w-md mx-auto mb-8">
                  Te esperamos en el evento. Recibirás
                  más información por email.
                </p>

                <button
                  type="button"
                  onClick={
                    fecharInscricao
                  }
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-[10px] font-bold uppercase tracking-[0.18em] transition-colors"
                >
                  Cerrar
                </button>

              </div>

            ) : (

              <form
                onSubmit={
                  enviarInscricao
                }
                className="p-6 sm:p-8"
              >

                <div className="space-y-5">

                  <div>

                    <label
                      htmlFor="fullName"
                      className="block text-zinc-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                    >
                      Nombre completo *
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={
                        inscricaoForm.fullName
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                      autoComplete="name"
                      placeholder="Tu nombre completo"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-700 px-4 py-3.5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="email"
                      className="block text-zinc-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                    >
                      Email *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={
                        inscricaoForm.email
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-700 px-4 py-3.5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="phone"
                      className="block text-zinc-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                    >
                      Teléfono
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={
                        inscricaoForm.phone
                      }
                      onChange={
                        handleFormChange
                      }
                      autoComplete="tel"
                      placeholder="+34 600 000 000"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-700 px-4 py-3.5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="message"
                      className="block text-zinc-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
                    >
                      Mensaje

                      <span className="text-zinc-700 ml-2">
                        Opcional
                      </span>
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      value={
                        inscricaoForm.message
                      }
                      onChange={
                        handleFormChange
                      }
                      rows={4}
                      placeholder="¿Tienes alguna pregunta o necesidad especial?"
                      className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-700 px-4 py-3.5 text-sm focus:outline-none focus:border-red-600 transition-colors resize-none"
                    />

                  </div>

                </div>

                {inscricaoError && (

                  <div
                    className="mt-5 border border-red-500/20 bg-red-500/5 p-4"
                    role="alert"
                  >

                    <p className="text-red-400 text-sm leading-relaxed">
                      {inscricaoError}
                    </p>

                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    inscricaoLoading
                  }
                  className="w-full mt-6 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-600/40 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-3"
                >

                  {inscricaoLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Enviando...
                    </>
                  ) : (
                    <>
                      Confirmar inscripción

                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}

                </button>

                <p className="text-center text-zinc-700 text-[9px] uppercase tracking-[0.12em] mt-4">
                  Tus datos serán utilizados únicamente
                  para gestionar esta inscripción.
                </p>

              </form>
            )}

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL GALERÍA
      ===================================================== */}

      {galleryModal && (
        <GalleryModal
          evento={
            galleryModal
          }
          currentIndex={
            galleryIndex
          }
          setCurrentIndex={
            setGalleryIndex
          }
          onClose={
            fecharGaleria
          }
        />
      )}

    </div>
  );
}
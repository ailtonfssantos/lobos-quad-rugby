import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

// ============================================================
// ICON
// ============================================================

const Icon = ({ path, className = 'w-6 h-6', strokeWidth = 1.5 }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={strokeWidth}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// ============================================================
// HELPERS
// ============================================================

const EVENT_TYPES = {
  PUERTAS_ABIERTAS: {
    label: 'PUERTAS ABIERTAS',
    className: 'bg-red-600 text-white',
  },
  CLINICA: {
    label: 'CLÍNICA',
    className: 'bg-white text-black',
  },
  DEFAULT: {
    label: 'EVENTO',
    className: 'bg-zinc-800 text-zinc-200 border border-white/10',
  },
};

const getEventType = (tipo) => {
  if (!tipo) return EVENT_TYPES.DEFAULT;

  const normalized = tipo
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('PUERTA')) {
    return EVENT_TYPES.PUERTAS_ABIERTAS;
  }

  if (normalized.includes('CLINICA')) {
    return EVENT_TYPES.CLINICA;
  }

  return EVENT_TYPES.DEFAULT;
};

const formatDate = (date) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

const formatShortDate = (date) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  })
    .format(parsed)
    .replace('.', '')
    .toUpperCase();
};

const getEventPhotos = (evento) => {
  if (!evento) return [];

  if (Array.isArray(evento.fotos)) {
    return evento.fotos.filter(Boolean);
  }

  if (typeof evento.fotos === 'string') {
    try {
      const parsed = JSON.parse(evento.fotos);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return evento.fotos
        .split(',')
        .map((foto) => foto.trim())
        .filter(Boolean);
    }
  }

  if (evento.galeria && Array.isArray(evento.galeria)) {
    return evento.galeria.filter(Boolean);
  }

  return [];
};

const isPastEvent = (evento) => {
  if (!evento?.dateISO) return false;

  const eventDate = new Date(evento.dateISO);

  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  return eventDate.getTime() < Date.now();
};

// ============================================================
// SKELETON
// ============================================================

const EventSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
    <div className="h-56 bg-zinc-800" />

    <div className="space-y-4 p-6">
      <div className="h-4 w-24 rounded bg-zinc-800" />
      <div className="h-7 w-3/4 rounded bg-zinc-800" />
      <div className="h-4 w-full rounded bg-zinc-800" />
      <div className="h-4 w-2/3 rounded bg-zinc-800" />
    </div>
  </div>
);

// ============================================================
// EVENT CARD
// ============================================================

const EventCard = ({ evento, onRegister, onGallery }) => {
  const type = getEventType(evento?.tipo);
  const photos = getEventPhotos(evento);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:border-red-600/40">
      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden bg-zinc-900">
        {evento?.imagen ? (
          <img
            src={evento.imagen}
            alt={evento.nombre || 'Evento Lobos Quad Rugby'}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <Icon
              path="M6 3v18M18 3v18M3 9h18M3 15h18"
              className="h-12 w-12 text-zinc-700"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute left-5 top-5">
          <span
            className={`inline-flex items-center px-3 py-1.5 text-[9px] font-black tracking-[0.18em] ${type.className}`}
          >
            {type.label}
          </span>
        </div>

        {evento?.dateISO && (
          <div className="absolute bottom-5 left-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              {formatShortDate(evento.dateISO)}
            </p>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-display text-2xl uppercase leading-none tracking-tight text-white">
            {evento?.nombre || 'Evento Lobos Quad Rugby'}
          </h3>
        </div>

        {evento?.descripcion && (
          <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-zinc-400">
            {evento.descripcion}
          </p>
        )}

        <div className="space-y-3 border-t border-white/10 pt-5">
          {evento?.dateISO && (
            <div className="flex items-start gap-3">
              <Icon
                path="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                  Fecha
                </p>

                <p className="mt-1 text-sm text-zinc-300">
                  {formatDate(evento.dateISO)}
                </p>
              </div>
            </div>
          )}

          {evento?.location && (
            <div className="flex items-start gap-3">
              <Icon
                path="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12zM12 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                  Lugar
                </p>

                <p className="mt-1 text-sm text-zinc-300">
                  {evento.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex flex-wrap gap-3">
          {onRegister && (
            <button
              type="button"
              onClick={() => onRegister(evento)}
              className="inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-500"
            >
              Inscribirme
              <Icon
                path="M5 12h14M13 6l6 6-6 6"
                className="h-4 w-4"
              />
            </button>
          )}

          {photos.length > 0 && onGallery && (
            <button
              type="button"
              onClick={() => onGallery(evento)}
              className="inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
            >
              Ver galería
              <Icon
                path="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 15l2.5-3 2 2.5 1.5-2 2.5 3.5M8 8h.01"
                className="h-4 w-4"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

// ============================================================
// GALLERY MODAL
// ============================================================

const GalleryModal = ({ evento, onClose }) => {
  const photos = getEventPhotos(evento);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [evento]);

  useEffect(() => {
    if (!evento) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((current) =>
          current === photos.length - 1 ? 0 : current + 1
        );
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current === 0 ? photos.length - 1 : current - 1
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [evento, onClose, photos.length]);

  if (!evento || photos.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Galería del evento"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex w-full max-w-6xl flex-col">
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 z-20 flex h-11 w-11 translate-y-[-60px] items-center justify-center border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-white hover:text-black"
          aria-label="Cerrar galería"
        >
          <Icon
            path="M6 6l12 12M18 6L6 18"
            className="h-5 w-5"
          />
        </button>

        {/* TITLE */}
        <div className="mb-5">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
            Lobos Quad Rugby
          </p>

          <h3 className="font-display text-3xl uppercase tracking-tight text-white md:text-4xl">
            {evento.nombre}
          </h3>
        </div>

        {/* MAIN IMAGE */}
        <div className="relative overflow-hidden border border-white/10 bg-zinc-950">
          <img
            src={photos[activeIndex]}
            alt={`${evento.nombre} - ${activeIndex + 1}`}
            className="max-h-[68vh] w-full object-contain"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === 0 ? photos.length - 1 : current - 1
                  )
                }
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/10 bg-black/60 text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
                aria-label="Foto anterior"
              >
                <Icon
                  path="M15 18l-6-6 6-6"
                  className="h-5 w-5"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === photos.length - 1 ? 0 : current + 1
                  )
                }
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/10 bg-black/60 text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
                aria-label="Foto siguiente"
              >
                <Icon
                  path="M9 18l6-6-6-6"
                  className="h-5 w-5"
                />
              </button>
            </>
          )}
        </div>

        {/* THUMBNAILS */}
        {photos.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-24 shrink-0 overflow-hidden border transition ${
                  activeIndex === index
                    ? 'border-red-600'
                    : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================

export default function Entrenamientos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [galleryEvent, setGalleryEvent] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [formMessage, setFormMessage] = useState({
    type: '',
    text: '',
  });

  const formRef = useRef(null);

  // ==========================================================
  // FETCH EVENTS
  // ==========================================================

  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/eventos`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los eventos.');
      }

      const data = await response.json();

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.eventos)
          ? data.eventos
          : [];

      setEventos(normalized);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('No se pudieron cargar los eventos en este momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // ==========================================================
  // EVENTS
  // ==========================================================

  const upcomingEvents = useMemo(() => {
    return [...eventos]
      .filter((evento) => !isPastEvent(evento))
      .sort(
        (a, b) =>
          new Date(a.dateISO).getTime() -
          new Date(b.dateISO).getTime()
      );
  }, [eventos]);

  const pastEvents = useMemo(() => {
    return [...eventos]
      .filter((evento) => isPastEvent(evento))
      .sort(
        (a, b) =>
          new Date(b.dateISO).getTime() -
          new Date(a.dateISO).getTime()
      );
  }, [eventos]);

  // ==========================================================
  // OPEN REGISTRATION
  // ==========================================================

  const abrirRegistro = (evento) => {
    setSelectedEvent(evento);
    setFormOpen(true);

    setFormData({
      fullName: '',
      email: '',
      phone: '',
      message: '',
    });

    setFormMessage({
      type: '',
      text: '',
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  const cerrarRegistro = () => {
    if (submitting) return;

    setFormOpen(false);
    setSelectedEvent(null);

    setFormMessage({
      type: '',
      text: '',
    });
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedEvent) return;

    setSubmitting(true);

    setFormMessage({
      type: '',
      text: '',
    });

    try {
      const response = await fetch(
        `${API_URL}/api/inscricoes-eventos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: selectedEvent.id,
            eventoId: selectedEvent.id,
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            message: formData.message.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            'No se pudo completar la inscripción.'
        );
      }

      setFormMessage({
        type: 'success',
        text:
          data?.message ||
          'Inscripción enviada correctamente. Nos pondremos en contacto contigo.',
      });

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (err) {
      console.error('Error en la inscripción:', err);

      setFormMessage({
        type: 'error',
        text:
          err.message ||
          'Ha ocurrido un error. Inténtalo de nuevo.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative flex min-h-[620px] items-end overflow-hidden border-b border-white/10 bg-zinc-950 lg:min-h-[680px]">
        {/* BACKGROUND */}
        <div className="absolute inset-0">
          <img
            src="/assets/IMG_8358.jpg"
            alt=""
            className="h-full w-full scale-105 object-cover object-center grayscale opacity-70"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-[65%] to-black/25" />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-transparent" />

          <div className="pointer-events-none absolute -right-[100px] -top-40 h-[600px] w-[600px] rounded-full bg-red-700/15 blur-3xl" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-32 sm:px-8 md:pb-28 lg:px-12">
          <div className="max-w-5xl">
            {/* EDITORIAL LINE */}
            <div className="mb-7 flex items-center gap-4">
              <span className="block h-[2px] w-10 bg-red-600" />

              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-500 md:text-[11px]">
                Rugby en silla de ruedas · Valencia
              </p>
            </div>

            {/* TITLE */}
            <h1 className="mb-8 font-display text-[3.8rem] uppercase leading-[0.82] tracking-[-0.035em] text-white sm:text-[5rem] md:text-[7rem] lg:text-[8.5rem]">
              ENTRENAMIENTOS
            </h1>

            {/* DESCRIPTION */}
            <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg md:text-xl">
              El lugar donde empieza el equipo. Entrenamos,
              competimos y crecemos juntos.
            </p>

            {/* ACTIONS */}
            <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-5">
              <a
                href="#horarios"
                className="group inline-flex items-center gap-3 bg-red-600 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
              >
                Ver horarios

                <Icon
                  path="M5 12h14M13 6l6 6-6 6"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              <Link
                to="/unete"
                className="group inline-flex items-center gap-3 border border-white/20 bg-black/20 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/5"
              >
                Quiero formar parte

                <Icon
                  path="M5 12h14M13 6l6 6-6 6"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* LOCATION TAG */}
        <div className="absolute bottom-6 right-6 hidden items-center gap-3 md:flex md:right-12">
          <span className="h-px w-8 bg-white/30" />

          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
            Lobos Quad Rugby — Valencia
          </span>
        </div>
      </section>

      {/* ======================================================
          HORARIOS
      ====================================================== */}

      <section
        id="horarios"
        className="border-b border-white/10 bg-zinc-950"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            {/* INTRO */}
            <div>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-[2px] w-10 bg-red-600" />

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
                  Entrenamientos
                </p>
              </div>

              <h2 className="font-display text-4xl uppercase leading-none tracking-tight text-white sm:text-5xl">
                Ven a
                <br />
                entrenar.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-400">
                Nuestros entrenamientos están abiertos a personas
                interesadas en conocer el rugby en silla de ruedas,
                aprender y formar parte del equipo.
              </p>
            </div>

            {/* SCHEDULE */}
            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {/* LOCATION */}
              <div className="bg-zinc-950 p-6 sm:p-7">
                <div className="mb-6 flex h-10 w-10 items-center justify-center bg-red-600/10 text-red-500">
                  <Icon
                    path="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12zM12 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                    className="h-5 w-5"
                  />
                </div>

                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  Lugar
                </p>

                <h3 className="text-base font-bold text-white">
                  Pabellón Malvarrosa
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Av. de Neptú s/n
                </p>
              </div>

              {/* MON/WED */}
              <div className="bg-zinc-950 p-6 sm:p-7">
                <div className="mb-6 flex h-10 w-10 items-center justify-center bg-red-600/10 text-red-500">
                  <Icon
                    path="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                    className="h-5 w-5"
                  />
                </div>

                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  Lunes · Miércoles
                </p>

                <h3 className="text-xl font-bold text-white">
                  17:00 — 19:30
                </h3>

                <p className="mt-2 text-xs text-zinc-500">
                  Entrenamiento de equipo
                </p>
              </div>

              {/* FRIDAY */}
              <div className="bg-zinc-950 p-6 sm:p-7">
                <div className="mb-6 flex h-10 w-10 items-center justify-center bg-red-600/10 text-red-500">
                  <Icon
                    path="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    className="h-5 w-5"
                  />
                </div>

                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  Viernes
                </p>

                <h3 className="text-xl font-bold text-white">
                  10:00 — 11:30
                </h3>

                <p className="mt-2 text-xs text-zinc-500">
                  Sesión de entrenamiento
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          GALLERY / ASÍ SE ENTRENA
      ====================================================== */}

      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-[2px] w-10 bg-red-600" />

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
                  Dentro de la pista
                </p>
              </div>

              <h2 className="font-display text-5xl uppercase leading-none tracking-tight text-white md:text-6xl">
                Así se
                <br />
                entrena.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-zinc-500">
              Intensidad, compañerismo y trabajo en equipo.
              Cada entrenamiento es un paso más.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              '/assets/momento-1.PNG',
              '/assets/momento-2.PNG',
              '/assets/momento-3.PNG',
              '/assets/momento-4.PNG',
              '/assets/momento-5.PNG',
              '/assets/momento-6.PNG',
              '/assets/momento-7.PNG',
            ].map((image, index) => (
              <div
                key={image}
                className={`group relative overflow-hidden bg-zinc-900 ${
                  index === 0
                    ? 'col-span-2 row-span-2'
                    : index === 4
                      ? 'col-span-2'
                      : ''
                }`}
              >
                <img
                  src={image}
                  alt={`Entrenamiento Lobos Quad Rugby ${index + 1}`}
                  className="h-full min-h-[180px] w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0 md:min-h-[220px]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/20 transition duration-500 group-hover:bg-transparent" />

                <div className="absolute bottom-4 left-4 opacity-0 transition duration-500 group-hover:opacity-100">
                  <span className="bg-black/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    Lobos Quad Rugby
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          UPCOMING EVENTS
      ====================================================== */}

      <section className="border-b border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <div className="mb-12">
            <div className="mb-5 flex items-center gap-4">
              <span className="h-[2px] w-10 bg-red-600" />

              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
                Próximamente
              </p>
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <h2 className="font-display text-5xl uppercase leading-none tracking-tight text-white md:text-6xl">
                Próximos
                <br />
                eventos.
              </h2>

              <p className="max-w-md text-sm leading-relaxed text-zinc-500">
                Actividades, clínicas y jornadas especiales
                organizadas por Lobos Quad Rugby.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </div>
          ) : error ? (
            <div className="border border-red-900/40 bg-red-950/20 p-8">
              <div className="flex items-start gap-4">
                <Icon
                  path="M12 9v4M12 17h.01M10.3 3.8L2.5 17a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z"
                  className="h-6 w-6 shrink-0 text-red-500"
                />

                <div>
                  <h3 className="font-bold text-white">
                    No se pudieron cargar los eventos
                  </h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={cargarEventos}
                    className="mt-5 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="border border-white/10 bg-black p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-white/5">
                <Icon
                  path="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                  className="h-6 w-6 text-zinc-600"
                />
              </div>

              <h3 className="font-display text-2xl uppercase text-white">
                Próximamente
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
                En este momento no hay eventos programados.
                Vuelve a visitarnos pronto.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onRegister={abrirRegistro}
                  onGallery={setGalleryEvent}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          PAST EVENTS
      ====================================================== */}

      {pastEvents.length > 0 && (
        <section className="border-b border-white/10 bg-black">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
            <div className="mb-12">
              <div className="mb-5 flex items-center gap-4">
                <span className="h-[2px] w-10 bg-zinc-700" />

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  Archivo
                </p>
              </div>

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <h2 className="font-display text-5xl uppercase leading-none tracking-tight text-white md:text-6xl">
                  Eventos
                  <br />
                  pasados.
                </h2>

                <p className="max-w-md text-sm leading-relaxed text-zinc-500">
                  Revive algunos de los momentos compartidos
                  fuera y dentro de la pista.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onGallery={setGalleryEvent}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          MAP
      ====================================================== */}

      <section className="border-b border-white/10 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <div className="grid overflow-hidden border border-white/10 bg-black lg:grid-cols-[0.7fr_1.3fr]">
            <div className="flex flex-col justify-between p-8 md:p-10">
              <div>
                <div className="mb-5 flex items-center gap-4">
                  <span className="h-[2px] w-10 bg-red-600" />

                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
                    Dónde estamos
                  </p>
                </div>

                <h2 className="font-display text-4xl uppercase leading-none text-white md:text-5xl">
                  Pabellón
                  <br />
                  Malvarrosa.
                </h2>

                <p className="mt-6 text-sm leading-relaxed text-zinc-500">
                  Av. de Neptú s/n
                  <br />
                  Valencia
                </p>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Pabellón+Malvarrosa+Valencia"
                target="_blank"
                rel="noreferrer"
                className="mt-10 inline-flex w-fit items-center gap-3 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Abrir en Google Maps

                <Icon
                  path="M14 3h7v7M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                  className="h-4 w-4"
                />
              </a>
            </div>

            <div className="min-h-[360px] bg-zinc-900">
              <iframe
                title="Ubicación Pabellón Malvarrosa"
                src="https://www.google.com/maps?q=Pabellón+Malvarrosa+Valencia&output=embed"
                className="h-full min-h-[360px] w-full border-0 grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          REGISTRATION MODAL
      ====================================================== */}

      {formOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarRegistro();
            }
          }}
        >
          <div
            ref={formRef}
            className="relative my-8 w-full max-w-2xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            {/* HEADER */}
            <div className="border-b border-white/10 p-6 sm:p-8">
              <button
                type="button"
                onClick={cerrarRegistro}
                disabled={submitting}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-white/10 text-zinc-400 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cerrar formulario"
              >
                <Icon
                  path="M6 6l12 12M18 6L6 18"
                  className="h-5 w-5"
                />
              </button>

              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-red-500">
                Inscripción
              </p>

              <h2 className="pr-12 font-display text-3xl uppercase leading-none text-white sm:text-4xl">
                {selectedEvent.nombre}
              </h2>

              {selectedEvent.dateISO && (
                <p className="mt-4 text-sm text-zinc-500">
                  {formatDate(selectedEvent.dateISO)}
                </p>
              )}
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6 sm:p-8"
            >
              {formMessage.text && (
                <div
                  className={`border p-4 text-sm ${
                    formMessage.type === 'success'
                      ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-300'
                      : 'border-red-900/50 bg-red-950/20 text-red-300'
                  }`}
                >
                  {formMessage.text}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Nombre completo *
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border border-white/10 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Email *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-white/10 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* PHONE */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Teléfono
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-white/10 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600"
                    placeholder="+34 000 000 000"
                  />
                </div>

                {/* MESSAGE */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Mensaje
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full resize-none border border-white/10 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600"
                    placeholder="¿Quieres contarnos algo antes de venir?"
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarRegistro}
                  disabled={submitting}
                  className="border border-white/10 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-3 bg-red-600 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar inscripción'}

                  {!submitting && (
                    <Icon
                      path="M5 12h14M13 6l6 6-6 6"
                      className="h-4 w-4"
                    />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          GALLERY
      ====================================================== */}

      <GalleryModal
        evento={galleryEvent}
        onClose={() => setGalleryEvent(null)}
      />

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-5 py-28 text-center sm:px-8">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.28em] text-red-500">
            El equipo empieza aquí
          </p>

          <h2 className="font-display text-5xl uppercase leading-[0.9] tracking-tight text-white sm:text-6xl md:text-8xl">
            ¿Te apuntas?
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Ven a conocernos, prueba el rugby en silla de ruedas
            y descubre lo que significa formar parte de Lobos.
          </p>

          <div className="mt-9">
            <Link
              to="/unete"
              className="group inline-flex items-center gap-3 bg-red-600 px-7 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
            >
              Quiero formar parte

              <Icon
                path="M5 12h14M13 6l6 6-6 6"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
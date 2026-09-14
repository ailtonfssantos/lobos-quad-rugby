import { useCallback, useEffect, useState } from 'react';
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

  if (normalized === 'PUERTAS ABIERTAS') {
    return {
      wrapper:
        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
    };
  }

  if (normalized === 'CLINICA') {
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
   TRAINING
========================================================= */

export default function Training() {
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [errorEventos, setErrorEventos] = useState(null);

  const [inscricaoModal, setInscricaoModal] =
    useState(null);

  const [inscricaoForm, setInscricaoForm] = useState({
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

  const fetchEventos = useCallback(
    async (signal) => {
      setLoadingEventos(true);
      setErrorEventos(null);

      try {
        if (!API_URL) {
          throw new Error(
            'La configuración de la API no está disponible.'
          );
        }

        const response = await fetch(
          `${API_URL}/api/eventos`,
          {
            signal,
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            'El servidor devolvió datos inválidos.'
          );
        }

        const eventosActivos = data
          .filter(
            (evento) => evento?.isActive === true
          )
          .sort((a, b) => {
            /*
             * Si existe una fecha ISO real, intentamos
             * ordenar cronológicamente.
             */
            const dateA = a?.dateISO
              ? new Date(a.dateISO).getTime()
              : Number.MAX_SAFE_INTEGER;

            const dateB = b?.dateISO
              ? new Date(b.dateISO).getTime()
              : Number.MAX_SAFE_INTEGER;

            return dateA - dateB;
          });

        setEventos(eventosActivos);
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }

        console.error(
          'Error al cargar eventos:',
          error
        );

        setErrorEventos(
          'No hemos podido cargar los próximos eventos.'
        );

        setEventos([]);
      } finally {
        if (!signal?.aborted) {
          setLoadingEventos(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchEventos(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchEventos]);

  /* =======================================================
     ABRIR INSCRIPCIÓN
  ======================================================= */

  const abrirInscricao = (evento) => {
    setInscricaoModal(evento);

    setInscricaoForm({
      fullName: '',
      email: '',
      phone: '',
      message: '',
    });

    setInscricaoSucesso(false);
    setInscricaoError(null);
  };

  /* =======================================================
     FECHAR MODAL
  ======================================================= */

  const fecharInscricao = () => {
    if (inscricaoLoading) return;

    setInscricaoModal(null);
    setInscricaoSucesso(false);
    setInscricaoError(null);
  };

  /* =======================================================
     ESC PARA FECHAR MODAL
  ======================================================= */

  useEffect(() => {
    if (!inscricaoModal) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        fecharInscricao();
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
  }, [inscricaoModal, inscricaoLoading]);

  /* =======================================================
     FORM
  ======================================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setInscricaoForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     ENVIAR INSCRIÇÃO
  ======================================================= */

  const enviarInscricao = async (event) => {
    event.preventDefault();

    if (!inscricaoModal?.id) {
      setInscricaoError(
        'No se ha podido identificar el evento.'
      );

      return;
    }

    setInscricaoLoading(true);
    setInscricaoError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/inscricoes-eventos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...inscricaoForm,
            eventId: inscricaoModal.id,
          }),
        }
      );

      if (!response.ok) {
        let message =
          'No se ha podido completar la inscripción.';

        try {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Respuesta sin JSON
        }

        throw new Error(message);
      }

      setInscricaoSucesso(true);
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
      setInscricaoLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="relative py-24 md:py-32 bg-zinc-950 border-b border-zinc-800 overflow-hidden">

        {/* Background glow */}
        <div
          className="
            absolute
            -top-40
            right-0
            w-[550px]
            h-[550px]
            rounded-full
            bg-red-900/10
            blur-3xl
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
            from-red-900/15
            via-zinc-950
            to-zinc-950
          "
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-4xl">

            <div className="flex items-center gap-4 mb-5">
              <span className="w-10 h-[2px] bg-red-600" />

              <p className="text-red-500 font-bold tracking-[0.25em] text-[10px] sm:text-xs uppercase">
                Entrena con Nosotros
              </p>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl leading-[0.9] tracking-tight text-white mb-7">
              ENTRENAMIENTOS
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
              El lugar donde empieza el equipo.
              Entrenamos, competimos y crecemos juntos.
            </p>

          </div>

        </div>
      </section>

      {/* ===================================================
          HORARIOS
      ==================================================== */}

      <section className="py-16 md:py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">

            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                  
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

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

            {/* LOCATION */}

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

            {/* LUNES / MIÉRCOLES */}

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

            {/* VIERNES */}

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

      {/* ===================================================
          EVENTOS
      ==================================================== */}

      <section className="py-16 md:py-20 bg-zinc-900 border-y border-zinc-800">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

            <div>

              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                   · Calendario
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
              eventos.length > 0 && (
                <p className="text-zinc-600 text-[10px] uppercase tracking-[0.18em]">
                  {eventos.length}{' '}
                  {eventos.length === 1
                    ? 'evento programado'
                    : 'eventos programados'}
                </p>
              )}

          </div>

          {/* LOADING */}

          {loadingEventos && (
            <div className="space-y-4">
              <EventSkeleton />
              <EventSkeleton />
            </div>
          )}

          {/* ERROR */}

          {!loadingEventos && errorEventos && (
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
                onClick={() => {
                  const controller =
                    new AbortController();

                  fetchEventos(controller.signal);
                }}
                className="
                  inline-flex
                  items-center
                  gap-3
                  px-6
                  py-3
                  bg-red-600
                  hover:bg-red-500
                  text-white
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  transition-colors
                "
              >
                <RefreshIcon className="w-4 h-4" />
                Reintentar
              </button>

            </div>
          )}

          {/* EVENTOS */}

          {!loadingEventos &&
            !errorEventos &&
            eventos.length > 0 && (
              <div className="space-y-4">

                {eventos.map((evento) => {

                  const typeStyle =
                    getEventTypeStyle(
                      evento?.type
                    );

                  return (
                    <article
                      key={evento.id}
                      className="
                        group
                        bg-zinc-950
                        border
                        border-zinc-800
                        hover:border-red-600/50
                        transition-all
                        duration-300
                        overflow-hidden
                      "
                    >

                      <div className="p-5 sm:p-6 md:p-7">

                        <div className="flex flex-col md:flex-row gap-6">

                          {/* DATE */}

                          <div className="shrink-0">

                            <div
                              className="
                                w-full
                                md:w-28
                                h-24
                                md:h-28
                                bg-zinc-900
                                border
                                border-zinc-800
                                flex
                                flex-col
                                items-center
                                justify-center
                                relative
                                overflow-hidden
                              "
                            >

                              <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600" />

                              <span className="font-display text-3xl md:text-4xl text-white leading-none">
                                {evento?.date || '—'}
                              </span>

                              <span className="text-red-500 text-[10px] uppercase tracking-[0.18em] mt-2">
                                {evento?.month || ''}
                              </span>

                              <span className="text-zinc-600 text-[9px] uppercase tracking-[0.15em] mt-1">
                                {evento?.day || ''}
                              </span>

                            </div>

                          </div>

                          {/* INFO */}

                          <div className="flex-1 min-w-0">

                            <div className="flex flex-wrap items-center gap-3 mb-3">

                              {evento?.type && (
                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-2.5
                                    py-1.5
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    border
                                    ${typeStyle.wrapper}
                                  `}
                                >
                                  <span
                                    className={`
                                      w-1.5
                                      h-1.5
                                      rounded-full
                                      ${typeStyle.dot}
                                    `}
                                  />

                                  {evento.type}
                                </span>
                              )}

                              {evento?.time && (
                                <span className="inline-flex items-center gap-2 text-zinc-600 text-[10px] uppercase tracking-[0.12em]">
                                  <ClockIcon className="w-3.5 h-3.5" />
                                  {evento.time}
                                </span>
                              )}

                            </div>

                            <h3 className="font-display text-2xl md:text-3xl text-white mb-3 group-hover:text-red-500 transition-colors">
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

                          <div className="hidden md:flex items-start justify-end">
                            <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-red-500 group-hover:border-red-600/40 transition-all">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>

                        </div>

                        {/* REGISTER */}

                        {evento?.isPublic && (
                          <div className="mt-6 pt-5 border-t border-zinc-800">

                            <button
                              type="button"
                              onClick={() =>
                                abrirInscricao(
                                  evento
                                )
                              }
                              className="
                                w-full
                                md:w-auto
                                inline-flex
                                items-center
                                justify-center
                                gap-3
                                px-7
                                py-3.5
                                bg-red-600
                                hover:bg-red-500
                                text-white
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                transition-all
                              "
                            >
                              Inscribirme al evento

                              <ArrowUpRight className="w-4 h-4" />
                            </button>

                          </div>
                        )}

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          {/* EMPTY */}

          {!loadingEventos &&
            !errorEventos &&
            eventos.length === 0 && (
              <div className="border border-zinc-800 bg-zinc-950 p-12 md:p-16 text-center">

                <CalendarIcon className="w-10 h-10 text-zinc-700 mx-auto mb-6" />

                <h3 className="font-display text-2xl md:text-3xl text-zinc-400 mb-3">
                  No hay eventos próximos
                </h3>

                <p className="text-zinc-600 text-sm max-w-md mx-auto leading-relaxed">
                  No hay eventos especiales programados
                  en este momento. Consulta nuestros
                  horarios habituales de entrenamiento.
                </p>

              </div>
            )}

        </div>
      </section>

      {/* ===================================================
          MAPA
      ==================================================== */}

      <section className="py-16 md:py-20 bg-zinc-950">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">

            <div>

              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-[2px] bg-red-600" />

                <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                   · Encuéntranos
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

            {/* Map label */}

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

      {/* ===================================================
          CTA
      ==================================================== */}

      <section className="relative py-20 md:py-28 bg-red-600 overflow-hidden">

        {/* Decorative number */}
        <div className="absolute -right-6 -bottom-16 font-display text-[180px] md:text-[260px] leading-none text-black/10 select-none">
          
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
            Únete al equipo y descubre el rugby en
            silla de ruedas.
          </p>

          <Link
            to="/unete"
            className="
              inline-flex
              items-center
              justify-center
              gap-3
              px-8
              sm:px-10
              py-4
              sm:py-5
              bg-zinc-950
              hover:bg-black
              text-white
              text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              transition-all
              shadow-2xl
            "
          >
            Quiero unirme

            <ArrowUpRight className="w-4 h-4" />
          </Link>

        </div>
      </section>

      {/* ===================================================
          MODAL INSCRIPCIÓN
      ==================================================== */}

      {inscricaoModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-3
            sm:p-5
            bg-black/85
            backdrop-blur-md
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="inscripcion-title"
          onMouseDown={fecharInscricao}
        >

          <div
            className="
              relative
              w-full
              max-w-xl
              max-h-[94vh]
              overflow-y-auto
              bg-zinc-900
              border
              border-zinc-800
              shadow-2xl
            "
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="relative p-6 sm:p-8 border-b border-zinc-800 overflow-hidden">

              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-red-600/10 blur-3xl" />

              <button
                type="button"
                onClick={fecharInscricao}
                disabled={inscricaoLoading}
                aria-label="Cerrar inscripción"
                className="
                  absolute
                  top-5
                  right-5
                  w-10
                  h-10
                  flex
                  items-center
                  justify-center
                  border
                  border-zinc-800
                  text-zinc-500
                  hover:text-white
                  hover:border-zinc-600
                  transition-colors
                  disabled:opacity-40
                "
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
                  {inscricaoModal.date}{' '}
                  {inscricaoModal.month
                    ? `· ${inscricaoModal.month}`
                    : ''}
                  {inscricaoModal.time
                    ? ` · ${inscricaoModal.time}`
                    : ''}
                </p>
              )}

            </div>

            {/* SUCCESS */}

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
                  Te esperamos en el evento.
                  Recibirás más información por
                  email.
                </p>

                <button
                  type="button"
                  onClick={fecharInscricao}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    px-7
                    py-3.5
                    bg-zinc-800
                    hover:bg-zinc-700
                    border
                    border-zinc-700
                    text-white
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    transition-colors
                  "
                >
                  Cerrar
                </button>

              </div>
            ) : (
              /* FORM */

              <form
                onSubmit={enviarInscricao}
                className="p-6 sm:p-8"
              >

                <div className="space-y-5">

                  {/* NAME */}

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
                      onChange={handleFormChange}
                      required
                      autoComplete="name"
                      placeholder="Tu nombre completo"
                      className="
                        w-full
                        bg-zinc-950
                        border
                        border-zinc-800
                        text-white
                        placeholder:text-zinc-700
                        px-4
                        py-3.5
                        text-sm
                        focus:outline-none
                        focus:border-red-600
                        transition-colors
                      "
                    />
                  </div>

                  {/* EMAIL */}

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
                      onChange={handleFormChange}
                      required
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className="
                        w-full
                        bg-zinc-950
                        border
                        border-zinc-800
                        text-white
                        placeholder:text-zinc-700
                        px-4
                        py-3.5
                        text-sm
                        focus:outline-none
                        focus:border-red-600
                        transition-colors
                      "
                    />
                  </div>

                  {/* PHONE */}

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
                      onChange={handleFormChange}
                      autoComplete="tel"
                      placeholder="+34 600 000 000"
                      className="
                        w-full
                        bg-zinc-950
                        border
                        border-zinc-800
                        text-white
                        placeholder:text-zinc-700
                        px-4
                        py-3.5
                        text-sm
                        focus:outline-none
                        focus:border-red-600
                        transition-colors
                      "
                    />
                  </div>

                  {/* MESSAGE */}

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
                      onChange={handleFormChange}
                      rows={4}
                      placeholder="¿Tienes alguna pregunta o necesidad especial?"
                      className="
                        w-full
                        bg-zinc-950
                        border
                        border-zinc-800
                        text-white
                        placeholder:text-zinc-700
                        px-4
                        py-3.5
                        text-sm
                        focus:outline-none
                        focus:border-red-600
                        transition-colors
                        resize-none
                      "
                    />
                  </div>

                </div>

                {/* ERROR */}

                {inscricaoError && (
                  <div className="mt-5 border border-red-500/20 bg-red-500/5 p-4">

                    <p className="text-red-400 text-sm leading-relaxed">
                      {inscricaoError}
                    </p>

                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={inscricaoLoading}
                  className="
                    w-full
                    mt-6
                    py-4
                    bg-red-600
                    hover:bg-red-500
                    disabled:bg-red-600/40
                    disabled:cursor-not-allowed
                    text-white
                    font-bold
                    text-[10px]
                    uppercase
                    tracking-[0.18em]
                    transition-colors
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
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

    </div>
  );
}
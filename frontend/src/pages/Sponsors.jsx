import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// HELPERS
// ============================================================

const parseEuropeanNumber = (value) => {
  const valStr = String(value ?? '').trim();

  if (!valStr) return 0;

  let normalized = valStr
    .replace(/\s/g, '')
    .replace(/€/g, '');

  if (normalized.includes(',')) {
    normalized = normalized
      .replace(/\./g, '')
      .replace(',', '.');
  }

  const numericValue = parseFloat(normalized);

  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const calculateYearlySummaries = (subvenciones) => {
  const summaries = {};

  subvenciones.forEach((sub) => {
    const year = sub.ano;

    if (!summaries[year]) {
      summaries[year] = {
        count: 0,
        total: 0,
      };
    }

    summaries[year].count += 1;
    summaries[year].total += parseEuropeanNumber(sub.valor);
  });

  return Object.keys(summaries)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      year,
      count: summaries[year].count,
      total: formatCurrency(summaries[year].total),
    }));
};

// ============================================================
// ICONS
// ============================================================

const ArrowIcon = ({ className = 'w-4 h-4' }) => (
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
      d="M5 12h14M13 6l6 6-6 6"
    />
  </svg>
);

const ExternalIcon = ({ className = 'w-4 h-4' }) => (
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
      d="M14 5h5v5M19 5l-8 8"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 13v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5"
    />
  </svg>
);

const CheckIcon = ({ muted = false }) => (
  <span
    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border ${
      muted
        ? 'border-zinc-800 text-zinc-700'
        : 'border-red-900/60 bg-red-950/30 text-red-500'
    }`}
    aria-hidden="true"
  >
    {muted ? '—' : '✓'}
  </span>
);

// ============================================================
// COMPONENT
// ============================================================

export default function Sponsors() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sponsorshipType: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [subvenciones, setSubvenciones] = useState([]);
  const [loadingSubvenciones, setLoadingSubvenciones] = useState(true);
  const [subvencionesError, setSubvencionesError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ==========================================================
  // DATA
  // ==========================================================

  const currentSponsors = [
    {
      name: 'Rodem',
      description: 'Ortopedia y Movilidad',
      logo: '/assets/rodem.png',
      url: 'https://rodem.es/',
    },
    {
      name: 'RK Inmocarrillo',
      description: 'Colaborador Oficial',
      logo: '/assets/inmocarrillo.png',
      url: 'https://www.inmocarrillo.com/',
    },
  ];

  const administraciones = [
    {
      name: 'FESA',
      url: 'https://www.fesa.es/',
      logo: '/assets/fesa.png',
    },
    {
      name: 'Fundación Deporte Municipal',
      url: 'https://www.fdmvalencia.es/es/',
      logo: '/assets/fundacion.png',
    },
    {
      name: 'Generalitat Valenciana',
      url: 'https://www.gva.es/es/',
      logo: '/assets/generalitat.png',
    },
  ];

  const modalidades = [
    {
      name: 'Platinum',
      price: '6.000€',
      max: 'Máximo 1',
      eyebrow: 'Patrocinador principal',
      description:
        'La máxima presencia de marca y una colaboración estratégica con Lobos.',
      featured: true,
      borderColor: 'border-red-600',
      benefits: [
        'Exclusividad sectorial',
        'Patrocinador principal en la jornada de liga organizada en Valencia',
        'La marca pone su nombre a la jornada Liga Valencia',
        'Logo destacado en el cartel jornada Liga Valencia',
        'Logo en retransmisión partidos jornada Liga Valencia',
        'Bandera con logo exclusivo en jornada Liga Valencia*',
        'Logo en sillas de ruedas (respaldo)',
        'Logo en vídeo promocional del equipo',
        'Organización de jornada para trabajadores',
        'Publicidad y agradecimiento en redes sociales',
      ],
    },
    {
      name: 'Gold',
      price: '3.000€',
      max: 'Máximo 2',
      eyebrow: 'Alta visibilidad',
      description:
        'Una colaboración con presencia destacada en competición y comunicación.',
      featured: false,
      borderColor: 'border-zinc-700',
      benefits: [
        'Exclusividad sectorial del patrocinador',
        'Logo en sillas de ruedas (ruedas)',
        'Logo en el cartel jornada Liga Valencia',
        'Logo en retransmisión partidos jornada Liga Valencia',
        'Logo en vídeo promocional del equipo',
        'Organización de jornada de sensibilización para trabajadores',
        'Publicidad y agradecimiento en redes sociales',
      ],
    },
    {
      name: 'Silver',
      price: '1.500€',
      max: 'Máximo 5',
      eyebrow: 'Presencia de marca',
      description:
        'Una forma de apoyar al equipo con visibilidad en nuestras principales acciones.',
      featured: false,
      borderColor: 'border-zinc-700',
      benefits: [
        'Logo en el cartel jornada Liga Valencia',
        'Logo en retransmisión partidos jornada Liga Valencia',
        'Logo en vídeo promocional del equipo',
        'Organización de jornada de sensibilización para trabajadores',
        'Publicidad y agradecimiento en redes sociales',
      ],
    },
    {
      name: 'Colabora',
      price: '500€',
      max: 'Sin límite',
      eyebrow: 'Apoyo al proyecto',
      description:
        'Una colaboración directa para contribuir al crecimiento de la manada.',
      featured: false,
      borderColor: 'border-zinc-700',
      benefits: [
        'Organización de jornada de sensibilización para trabajadores',
        'Publicidad y agradecimiento en redes sociales',
      ],
    },
  ];

  const comparativa = [
    {
      feature: 'Precio (sin IVA incluido)',
      platinum: '6.000€',
      gold: '3.000€',
      silver: '1.500€',
      colabora: '500€',
    },
    {
      feature: 'Exclusividad sectorial',
      platinum: true,
      gold: true,
      silver: false,
      colabora: false,
    },
    {
      feature: 'Patrocinador principal jornada Liga Valencia',
      platinum: true,
      gold: false,
      silver: false,
      colabora: false,
    },
    {
      feature: 'La marca pone su nombre a la jornada',
      platinum: true,
      gold: false,
      silver: false,
      colabora: false,
    },
    {
      feature: 'Logo en ruedas',
      platinum: true,
      gold: true,
      silver: false,
      colabora: false,
    },
    {
      feature: 'Logo en cartelería jornada Liga Valencia',
      platinum: true,
      gold: true,
      silver: true,
      colabora: false,
    },
    {
      feature: 'Logo en retransmisión partidos',
      platinum: true,
      gold: true,
      silver: true,
      colabora: false,
    },
    {
      feature: 'Bandera con logo exclusivo',
      platinum: true,
      gold: false,
      silver: false,
      colabora: false,
    },
    {
      feature: 'Logo en respaldo',
      platinum: true,
      gold: false,
      silver: false,
      colabora: false,
    },
    {
      feature: 'Logo en vídeo promocional equipo',
      platinum: true,
      gold: true,
      silver: true,
      colabora: false,
    },
    {
      feature: 'Jornada para trabajadores',
      platinum: true,
      gold: true,
      silver: true,
      colabora: true,
    },
    {
      feature: 'Publicidad y agradecimientos en redes',
      platinum: true,
      gold: true,
      silver: true,
      colabora: true,
    },
  ];

  // ==========================================================
  // FETCH SUBVENCIONES
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchSubvenciones = async () => {
      try {
        setLoadingSubvenciones(true);
        setSubvencionesError('');

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/subvenciones`
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar los datos.');
        }

        const data = await response.json();

        if (!cancelled) {
          setSubvenciones(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error cargando subvenciones:', error);

        if (!cancelled) {
          setSubvencionesError(
            'No ha sido posible cargar los datos de transparencia.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSubvenciones(false);
        }
      }
    };

    fetchSubvenciones();

    return () => {
      cancelled = true;
    };
  }, []);

  const yearlySummaries = useMemo(
    () => calculateYearlySummaries(subvenciones),
    [subvenciones]
  );

  // ==========================================================
  // FORM
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setSubmitError('');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/patrocinadores`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud.');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error enviando solicitud:', error);

      setSubmitError(
        'No hemos podido enviar tu solicitud. Comprueba los datos e inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-5 py-24">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-10 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center border border-red-600">
              <span className="font-display text-5xl text-red-500">
                ✓
              </span>
            </div>
          </div>

          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
            Gracias por contactar
          </p>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-white">
            SOLICITUD ENVIADA
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-8 text-zinc-400">
            Gracias por tu interés en colaborar con Lobos Quad Rugby.
            Nuestro equipo se pondrá en contacto contigo en las próximas
            48 horas.
          </p>

          <Link
            to="/"
            className="mt-10 inline-flex items-center gap-4 border border-red-600 bg-red-600 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-red-500 hover:border-red-500"
          >
            Volver al inicio
            <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[62vh] flex items-end overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="/assets/equipo1.JPG"
            alt=""
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950/70" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 pt-32">
          <div className="max-w-4xl">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-px w-10 bg-red-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
                Colabora con Lobos
              </span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.86] tracking-tight text-white">
              PATROCINA
              <br />
              <span className="text-zinc-500">EL EQUIPO</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base sm:text-lg md:text-xl leading-8 text-zinc-400">
              Une tu marca a un proyecto deportivo que compite,
              representa a Valencia y trabaja por una sociedad más
              inclusiva.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="#modalidades"
                className="inline-flex items-center justify-center gap-4 bg-red-600 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-red-500"
              >
                Ver modalidades
                <ArrowIcon />
              </a>

              <a
                href="#formulario"
                className="inline-flex items-center justify-center gap-4 border border-white/15 bg-white/[0.03] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 transition-all duration-300 hover:border-white/30 hover:text-white"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CURRENT SPONSORS
      ====================================================== */}

      <section className="border-b border-white/10 bg-zinc-950 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end mb-14">
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-8 bg-red-600" />
                <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-red-500">
                  Ya forman parte
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-none text-white">
                QUIENES CONFÍAN
                <br />
                <span className="text-zinc-600">EN LOBOS.</span>
              </h2>
            </div>

            <p className="lg:col-span-5 text-sm sm:text-base leading-7 text-zinc-500">
              Empresas y entidades que deciden apoyar el deporte
              adaptado, la competición y el impacto social desde
              Valencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {currentSponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-zinc-900 p-8 sm:p-10 transition-colors duration-300 hover:bg-zinc-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                  <div className="flex h-28 w-full sm:w-44 shrink-0 items-center justify-center border border-white/5 bg-zinc-950 p-5">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain grayscale opacity-75 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                  </div>

                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl text-white transition-colors group-hover:text-red-500">
                      {sponsor.name}
                    </h3>

                    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      {sponsor.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors group-hover:text-white">
                      Visitar web
                      <ExternalIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          SPONSORSHIP INTRO
      ====================================================== */}

      <section className="border-b border-white/10 bg-zinc-900 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-4">
                <span className="text-[9px] font-bold tracking-[0.25em] text-zinc-600">
                </span>
                <span className="h-px w-8 bg-red-600" />
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-500">
                  Oportunidades
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] text-white">
                TU MARCA.
                <br />
                <span className="text-zinc-600">
                  NUESTRO IMPACTO.
                </span>
              </h2>
            </div>

            <div className="lg:col-span-5 lg:pt-10">
              <p className="text-base leading-8 text-zinc-400">
                El patrocinio de Lobos no es únicamente una
                presencia de marca. Es una oportunidad para asociar
                tu empresa a valores como la competición,
                resiliencia, inclusión y compromiso social.
              </p>

              <p className="mt-5 text-base leading-8 text-zinc-500">
                Hemos diseñado diferentes modalidades para que
                empresas de distintos tamaños puedan formar parte
                del proyecto.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================
          MODALITIES
      ====================================================== */}

      <section
        id="modalidades"
        className="scroll-mt-20 border-b border-white/10 bg-zinc-950 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="mb-14">
            <div className="mb-5 flex items-center gap-4">
              <span className="text-[9px] font-bold tracking-[0.25em] text-zinc-600">
              </span>
              <span className="h-px w-8 bg-red-600" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-500">
                Modalidades
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-none text-white">
                ELIGE CÓMO
                <br />
                <span className="text-zinc-600">FORMAR PARTE.</span>
              </h2>

              <p className="max-w-md text-sm leading-7 text-zinc-500 lg:text-right">
                Todas las modalidades incluyen reconocimiento y
                presencia de marca. El nivel de exposición aumenta
                según la modalidad elegida.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {modalidades.map((mod) => (
              <article
                key={mod.name}
                className={`relative flex flex-col bg-zinc-900 p-7 sm:p-8 transition-colors duration-300 hover:bg-zinc-800 ${
                  mod.featured ? 'ring-1 ring-inset ring-red-600' : ''
                }`}
              >
                {mod.featured && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-[8px] font-bold uppercase tracking-[0.22em] ${
                        mod.featured
                          ? 'text-red-500'
                          : 'text-zinc-600'
                      }`}
                    >
                      {mod.eyebrow}
                    </p>

                    <h3 className="mt-3 font-display text-4xl text-white">
                      {mod.name}
                    </h3>
                  </div>

                  <span className="border border-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                    {mod.max}
                  </span>
                </div>

                <div className="mt-8 border-y border-white/10 py-6">
                  <div className="font-display text-4xl text-white">
                    {mod.price}
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-zinc-600">
                    + IVA
                  </div>
                </div>

                <p className="mt-6 min-h-[72px] text-sm leading-6 text-zinc-500">
                  {mod.description}
                </p>

                <div className="mt-7 border-t border-white/5 pt-6">
                  <p className="mb-4 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Incluye
                  </p>

                  <ul className="space-y-3">
                    {mod.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-3 text-xs leading-5 text-zinc-300"
                      >
                        <span className="mt-1 text-red-500">
                          ✓
                        </span>

                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#formulario"
                  className={`mt-8 flex items-center justify-between border px-4 py-3 text-[9px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                    mod.featured
                      ? 'border-red-600 bg-red-600 text-white hover:bg-red-500'
                      : 'border-white/10 text-zinc-400 hover:border-red-600 hover:bg-red-600 hover:text-white'
                  }`}
                >
                  Contactar
                  <ArrowIcon className="w-3.5 h-3.5" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          COMPARISON
      ====================================================== */}

      <section className="border-b border-white/10 bg-zinc-900 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="mb-12">
            <div className="mb-5 flex items-center gap-4">
              <span className="text-[9px] font-bold tracking-[0.25em] text-zinc-600">
              </span>
              <span className="h-px w-8 bg-red-600" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-500">
                Comparativa
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-none text-white">
              COMPARA.
              <br />
              <span className="text-zinc-600">DECIDE.</span>
            </h2>
          </div>

          <div className="overflow-x-auto border border-white/10">
            <table className="w-full min-w-[850px] border-collapse">
              <thead>
                <tr className="bg-zinc-950">
                  <th className="border-b border-white/10 p-5 text-left text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    Característica
                  </th>

                  {[
                    ['Platinum', '6.000€'],
                    ['Gold', '3.000€'],
                    ['Silver', '1.500€'],
                    ['Colabora', '500€'],
                  ].map(([name, price]) => (
                    <th
                      key={name}
                      className={`border-b border-white/10 p-5 text-center ${
                        name === 'Platinum'
                          ? 'text-red-500'
                          : 'text-zinc-500'
                      }`}
                    >
                      <div className="font-display text-lg">
                        {name}
                      </div>

                      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-700">
                        {price}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparativa.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="p-5 text-sm text-zinc-400">
                      {row.feature}
                    </td>

                    {['platinum', 'gold', 'silver', 'colabora'].map(
                      (tier) => {
                        const value = row[tier];

                        return (
                          <td
                            key={tier}
                            className="p-5 text-center"
                          >
                            {typeof value === 'boolean' ? (
                              <span className="inline-flex justify-center">
                                <CheckIcon muted={!value} />
                              </span>
                            ) : (
                              <span className="font-display text-sm text-white">
                                {value}
                              </span>
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[9px] uppercase tracking-[0.12em] text-zinc-700">
            Desliza horizontalmente para consultar todas las
            modalidades en dispositivos móviles.
          </p>
        </div>
      </section>

      {/* ======================================================
          TRANSPARENCY
      ====================================================== */}

      <section className="border-b border-white/10 bg-zinc-950 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-16">

            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-4">
                <span className="text-[9px] font-bold tracking-[0.25em] text-zinc-600">
                </span>
                <span className="h-px w-8 bg-red-600" />
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-500">
                  Transparencia
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] text-white">
                TRANSPARENCIA
                <br />
                <span className="text-zinc-600">Y COMPROMISO.</span>
              </h2>
            </div>

            <div className="lg:col-span-5 lg:pt-10">
              <p className="text-base leading-8 text-zinc-400">
                Apostamos por un deporte inclusivo, competitivo y
                transparente, en el que cada jugador tenga la
                oportunidad de crecer y competir al máximo nivel.
              </p>
            </div>
          </div>

          {loadingSubvenciones ? (
            <div className="border border-white/10 bg-zinc-900 px-6 py-14 text-center">
              <div className="mx-auto h-8 w-8 animate-spin border-2 border-zinc-700 border-t-red-600" />
              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Cargando datos de transparencia
              </p>
            </div>
          ) : subvencionesError ? (
            <div className="border border-red-900/40 bg-red-950/10 px-6 py-12 text-center">
              <p className="text-sm text-zinc-400">
                {subvencionesError}
              </p>
            </div>
          ) : subvenciones.length === 0 ? (
            <div className="border border-white/10 bg-zinc-900 px-6 py-12 text-center">
              <p className="text-sm text-zinc-500">
                No hay subvenciones registradas públicamente aún.
              </p>
            </div>
          ) : (
            <>
              {/* YEAR SUMMARY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
                {yearlySummaries.map((summary) => (
                  <div
                    key={summary.year}
                    className="bg-zinc-900 p-8 sm:p-10"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                      Total ayudas {summary.year}
                    </p>

                    <div className="mt-5 font-display text-4xl sm:text-5xl text-white">
                      {summary.total}€
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px w-8 bg-red-600" />

                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-red-500">
                        {summary.count}{' '}
                        {summary.count === 1
                          ? 'subvención'
                          : 'subvenciones'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-12 max-w-3xl text-center">
                <p className="text-sm sm:text-base leading-7 text-zinc-500">
                  Estas ayudas nos permiten seguir haciendo crecer
                  el proyecto y cubrir parte de los costes necesarios
                  para nuestra actividad deportiva, como
                  desplazamientos, material, licencias y
                  participación en competiciones oficiales.
                </p>
              </div>

              {/* DETAILED LIST */}

              <div className="mt-16">
                <div className="mb-8">
                  <h3 className="font-display text-2xl sm:text-3xl text-white">
                    SUBVENCIONES RECIBIDAS
                  </h3>

                  <p className="mt-3 max-w-3xl text-xs sm:text-sm leading-6 text-zinc-600">
                    Información suministrada por los órganos y
                    entidades de las Administraciones Públicas a la
                    Base de Datos Nacional de Subvenciones.
                  </p>
                </div>

                <div className="space-y-px bg-white/10">
                  {subvenciones.map((sub) => (
                    <article
                      key={sub.id}
                      className="bg-zinc-900 p-6 sm:p-8 transition-colors hover:bg-zinc-800"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

                        <div className="lg:col-span-8">
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <span className="font-display text-3xl text-red-500">
                              {sub.ano}
                            </span>

                            <span className="font-display text-3xl text-white">
                              {sub.valor}€
                            </span>
                          </div>

                          <h4 className="mt-4 text-base sm:text-lg font-bold text-white">
                            {sub.entidad}
                          </h4>

                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                                Administración
                              </span>

                              <span className="mt-2 block text-sm text-zinc-400">
                                {sub.tipo} - {sub.ambito}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                                Departamento
                              </span>

                              <span className="mt-2 block text-sm text-zinc-400">
                                {sub.departamento ||
                                  'No especificado'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 lg:text-right">
                          <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                            Fecha de concesión
                          </span>

                          <span className="mt-2 block text-sm text-zinc-300">
                            {sub.fechaConcesion}
                          </span>
                        </div>

                        <div className="lg:col-span-12 border-t border-white/5 pt-6">
                          <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">
                            Convocatoria
                          </span>

                          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
                            {sub.convocatoria}
                          </p>

                          {sub.basesLink && (
                            <a
                              href={sub.basesLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-red-500 transition-colors hover:text-red-400"
                            >
                              Ver bases reguladoras (BBRR)
                              <ExternalIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* ADMINISTRATIONS */}

              <div className="mt-20 border-t border-white/10 pt-12">
                <div className="mb-8 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                    Administraciones colaboradoras
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14">
                  {administraciones.map((admin) => (
                    <a
                      key={admin.name}
                      href={admin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Visitar sitio web de ${admin.name}`}
                      className="group"
                    >
                      <img
                        src={admin.logo}
                        alt={admin.name}
                        className="h-14 sm:h-16 md:h-20 w-auto object-contain grayscale opacity-50 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ======================================================
          CONTACT FORM
      ====================================================== */}

      <section
        id="formulario"
        className="scroll-mt-20 bg-zinc-900 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            <div className="lg:col-span-5">
              <div className="sticky top-28">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-[9px] font-bold tracking-[0.25em] text-zinc-600">
                  </span>
                  <span className="h-px w-8 bg-red-600" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-500">
                    Contacto
                  </span>
                </div>

                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] text-white">
                  HABLEMOS
                  <br />
                  <span className="text-zinc-600">DE TU MARCA.</span>
                </h2>

                <p className="mt-7 text-sm sm:text-base leading-7 text-zinc-500">
                  Cuéntanos qué tipo de colaboración tienes en
                  mente. Estudiaremos la propuesta y nos pondremos
                  en contacto contigo.
                </p>

                <div className="mt-10 border-l-2 border-red-600 pl-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                    Respuesta
                  </p>

                  <p className="mt-2 text-sm text-zinc-300">
                    Normalmente respondemos en un plazo máximo de
                    48 horas.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="border border-white/10 bg-zinc-950 p-6 sm:p-8 lg:p-10"
              >
                <div className="mb-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                    Solicitud de patrocinio
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label
                      htmlFor="companyName"
                      className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                    >
                      Nombre de la empresa *
                    </label>

                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      autoComplete="organization"
                      required
                      className="w-full border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors focus:border-red-600"
                      placeholder="Empresa"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactName"
                      className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                    >
                      Nombre del contacto *
                    </label>

                    <input
                      id="contactName"
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                      className="w-full border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors focus:border-red-600"
                      placeholder="Nombre y apellidos"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                    >
                      Email *
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                      className="w-full border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors focus:border-red-600"
                      placeholder="empresa@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                    >
                      Teléfono
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      className="w-full border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors focus:border-red-600"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                </div>

                <div className="mt-6">
                  <label
                    htmlFor="sponsorshipType"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Tipo de patrocinio *
                  </label>

                  <select
                    id="sponsorshipType"
                    name="sponsorshipType"
                    value={formData.sponsorshipType}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-red-600"
                  >
                    <option value="">
                      Selecciona una modalidad
                    </option>
                    <option value="Platinum">
                      Platinum - 6.000€
                    </option>
                    <option value="Gold">
                      Gold - 3.000€
                    </option>
                    <option value="Silver">
                      Silver - 1.500€
                    </option>
                    <option value="Colabora">
                      Colabora - 500€
                    </option>
                  </select>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                  >
                    Mensaje
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full resize-none border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm leading-6 text-white placeholder:text-zinc-700 outline-none transition-colors focus:border-red-600"
                    placeholder="Cuéntanos brevemente qué tipo de colaboración tienes en mente..."
                  />
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="mt-6 border border-red-900/50 bg-red-950/20 px-4 py-4 text-sm text-red-300"
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-8 flex w-full items-center justify-between border border-red-600 bg-red-600 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {submitting
                      ? 'Enviando solicitud...'
                      : 'Enviar solicitud'}
                  </span>

                  {submitting ? (
                    <span className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white" />
                  ) : (
                    <ArrowIcon />
                  )}
                </button>

                <p className="mt-5 text-[8px] leading-5 text-zinc-700">
                  Al enviar este formulario aceptas que Lobos Quad
                  Rugby utilice los datos facilitados para gestionar
                  esta solicitud de contacto.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
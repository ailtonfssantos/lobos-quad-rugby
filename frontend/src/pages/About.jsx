import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/* =========================================================
   ICONS
========================================================= */

const ArrowUpRight = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 17L17 7M7 7h10v10"
    />
  </svg>
);

const ArrowRight = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14M13 6l6 6-6 6"
    />
  </svg>
);

/* =========================================================
   COMPONENT
========================================================= */

export default function About() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  /* =======================================================
     GALLERY
  ======================================================= */

  const gallery = [
    '/assets/momento-1.PNG',
    '/assets/momento-2.PNG',
    '/assets/momento-3.PNG',
    '/assets/momento-4.PNG',
    '/assets/momento-5.PNG',
    '/assets/momento-6.PNG',
    '/assets/momento-7.PNG',
  ];

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  /* =======================================================
     NATIONAL TEAM PLAYERS
  ======================================================= */

  const nationalTeamPlayers = [
    {
      name: 'Jairo Beses',
      nickname: '',
      slug: 'jairo-beses',
      available: true,
    },
    {
      name: 'Jose García',
      nickname: 'Pepe',
      slug: 'jose-garcia',
      available: true,
    },
    {
      name: 'Cristhian Adrián Sanches',
      nickname: 'Xamaco',
      slug: 'cristhian-adrian-sanches',
      available: true,
    },
    {
      name: 'Javi Navarro',
      nickname: 'Manitas',
      slug: 'javi-navarro',
      available: false,
    },
  ];

  return (
    <main className="bg-[#080808] text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.07),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-4xl">

            <p className="mb-6 text-xs font-medium uppercase tracking-[0.35em] text-white/45">
              Sobre nosotros
            </p>

            <h1 className="text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Más que un deporte.
              <br />
              <span className="text-white/45">Somos una familia.</span>
            </h1>

            <p className="mt-10 max-w-2xl text-lg leading-8 text-white/55">
              Lobos Quad Rugby es un club deportivo de Valencia dedicado al
              rugby en silla de ruedas, al deporte inclusivo y a la creación
              de oportunidades para todos.
            </p>

          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8">

          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/35">
              Nuestra misión
            </p>

            <h2 className="max-w-xl text-4xl font-light leading-tight tracking-[-0.03em] sm:text-5xl">
              El deporte como herramienta de inclusión.
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-white/55">
            <p>
              Creemos que el deporte puede transformar vidas. El rugby en
              silla de ruedas nos permite competir, superarnos y, sobre todo,
              construir una comunidad.
            </p>

            <p>
              Lobos Quad Rugby nació con la intención de ofrecer un espacio
              donde las personas con discapacidad puedan practicar deporte,
              competir y sentirse parte de un equipo.
            </p>

            <p>
              Hoy seguimos trabajando para hacer crecer el rugby en silla de
              ruedas en la Comunidad Valenciana y representar a nuestro club
              al más alto nivel.
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          NUMBERS
      ===================================================== */}

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">
              Lobos en números
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">

            <div className="bg-[#080808] p-8 sm:p-10">
              <div className="text-5xl font-light tracking-tight">2017</div>
              <p className="mt-3 text-sm text-white/40">
                Año de fundación
              </p>
            </div>

            <div className="bg-[#080808] p-8 sm:p-10">
              <div className="text-5xl font-light tracking-tight">2019</div>
              <p className="mt-3 text-sm text-white/40">
                Liga Nacional
              </p>
            </div>

            <div className="bg-[#080808] p-8 sm:p-10">
              <div className="text-5xl font-light tracking-tight">4</div>
              <p className="mt-3 text-sm text-white/40">
                Convocados con España
              </p>
            </div>

            <div className="bg-[#080808] p-8 sm:p-10">
              <div className="text-5xl font-light tracking-tight">1</div>
              <p className="mt-3 text-sm text-white/40">
                Equipo de la Comunidad Valenciana
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          HISTORY
      ===================================================== */}

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

          <div className="mb-16 max-w-3xl">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/35">
              Nuestra historia
            </p>

            <h2 className="text-4xl font-light tracking-[-0.03em] sm:text-5xl">
              Un camino construido juntos.
            </h2>
          </div>

          <div className="space-y-0">

            {/* 2017 */}
            <div className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-[160px_1fr]">

              <div className="text-3xl font-light text-white/30">
                2017
              </div>

              <div>
                <h3 className="text-xl font-medium">
                  El nacimiento de Lobos
                </h3>

                <p className="mt-4 max-w-3xl leading-8 text-white/50">
                  Carlos Sanchis funda Lobos Quad Rugby en Valencia con el
                  objetivo de crear un espacio deportivo inclusivo para
                  personas con discapacidad.
                </p>
              </div>

            </div>

            {/* 2019 */}
            <div className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-[160px_1fr]">

              <div className="text-3xl font-light text-white/30">
                2019
              </div>

              <div>
                <h3 className="text-xl font-medium">
                  Llegada a la Liga Nacional
                </h3>

                <p className="mt-4 max-w-3xl leading-8 text-white/50">
                  Lobos se convierte en el primer equipo de la Comunidad
                  Valenciana en competir en la Liga Nacional. Desde entonces,
                  el club ha seguido creciendo y{' '}
                  <span className="text-white/80">
                    cuatro de nuestros jugadores han sido convocados por la
                    Selección Española.
                  </span>
                </p>
              </div>

            </div>

            {/* ACTUALIDAD */}
            <div className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-[160px_1fr]">

              <div className="text-3xl font-light text-white/30">
                Hoy
              </div>

              <div>
                <h3 className="text-xl font-medium">
                  Seguimos creciendo
                </h3>

                <p className="mt-4 max-w-3xl leading-8 text-white/50">
                  Continuamos compitiendo, formando nuevos jugadores y
                  trabajando para que el rugby en silla de ruedas siga
                  creciendo en Valencia y en toda España.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          SELECCIÓN ESPAÑOLA
      ===================================================== */}

      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">

            {/* LEFT */}
            <div>

              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/35">
                Logro
              </p>

              <h2 className="text-4xl font-light tracking-[-0.03em] sm:text-5xl">
                Selección
                <br />
                Española.
              </h2>

              <div className="mt-10">

                <span className="block text-8xl font-light leading-none tracking-[-0.06em]">
                  04
                </span>

                <span className="mt-4 block text-sm uppercase tracking-[0.2em] text-white/40">
                  Convocados con España
                </span>

              </div>

            </div>

            {/* RIGHT */}
            <div>

              <p className="max-w-2xl text-lg leading-8 text-white/55">
                Cuatro jugadores de Lobos han sido convocados con la
                Selección Española. Un reconocimiento al trabajo,
                compromiso y nivel deportivo alcanzado por nuestros atletas.
              </p>

              {/* PLAYERS */}
              <div className="mt-12 grid gap-3 sm:grid-cols-2">

                {nationalTeamPlayers.map((player, index) => {

                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-4">

                        <span className="text-xs text-white/25">
                          0{index + 1}
                        </span>

                        {player.available && (
                          <ArrowUpRight className="h-4 w-4 text-white/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                        )}

                      </div>

                      <div className="mt-8">

                        <h3 className="text-xl font-medium tracking-tight">
                          {player.name}
                        </h3>

                        {player.nickname && (
                          <p className="mt-1 text-sm text-white/40">
                            “{player.nickname}”
                          </p>
                        )}

                        {player.available ? (
                          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/35 transition-colors group-hover:text-white/60">
                            Ver perfil
                          </p>
                        ) : (
                          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/25">
                            Perfil próximamente
                          </p>
                        )}

                      </div>
                    </>
                  );

                  if (player.available) {
                    return (
                      <Link
                        key={player.slug}
                        to={`/equipo?jugador=${player.slug}`}
                        className="group border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={player.slug}
                      className="border border-white/10 bg-white/[0.01] p-6 opacity-80"
                    >
                      {content}
                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/35">
                Momentos
              </p>

              <h2 className="text-4xl font-light tracking-[-0.03em] sm:text-5xl">
                Lobos en acción.
              </h2>

            </div>

            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="group flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-white"
            >
              Ver galería
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {gallery.slice(0, 4).map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`group relative overflow-hidden ${
                  index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
              >

                <img
                  src={image}
                  alt={`Lobos Quad Rugby - momento ${index + 1}`}
                  className={`w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0 ${
                    index === 0
                      ? 'aspect-square sm:aspect-auto sm:h-full'
                      : 'aspect-[4/3]'
                  }`}
                />

                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />

              </button>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          GALLERY MODAL
      ===================================================== */}

      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/95 p-6"
          onClick={() => setGalleryOpen(false)}
        >

          <div className="mx-auto max-w-7xl py-10">

            <div className="mb-8 flex items-center justify-between">

              <h2 className="text-2xl font-light">
                Galería
              </h2>

              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                Cerrar
              </button>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedImage(image);
                  }}
                  className="overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`Lobos Quad Rugby - momento ${index + 1}`}
                    className="w-full object-cover transition duration-500 hover:scale-105"
                  />
                </button>
              ))}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          IMAGE MODAL
      ===================================================== */}

      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"
          onClick={() => setSelectedImage(null)}
        >

          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-6 top-6 z-10 text-sm text-white/50 hover:text-white"
          >
            Cerrar
          </button>

          <img
            src={selectedImage}
            alt="Lobos Quad Rugby"
            className="max-h-[90vh] max-w-full object-contain"
          />

        </div>
      )}

    </main>
  );
}
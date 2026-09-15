import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const galleryImages = [
  '/assets/IMG_8328.jpg',
  '/assets/IMG_8325.jpg',
  '/assets/IMG_8327.jpg',
  '/assets/partido.jpg',
  '/assets/equipo.jpg',
  '/assets/momento-1.PNG',
  '/assets/momento-2.PNG',
  '/assets/momento-3.PNG',
  '/assets/momento-4.PNG',
  '/assets/momento-5.PNG',
  '/assets/momento-6.PNG',
  '/assets/momento-7.PNG',
];

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ArrowUpRight = ({ className = 'w-4 h-4' }) => (
  <Icon className={className} path="M7 17L17 7M7 7h10v10" />
);

const ArrowRight = ({ className = 'w-4 h-4' }) => (
  <Icon className={className} path="M5 12h14M13 6l6 6-6 6" />
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <Icon className={className} path="M5 12l4 4L19 6" />
);

export default function About() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  };

  const previousImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % galleryImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-black text-white overflow-hidden selection:bg-red-600/30">

      {/* =========================================================
          HEADER EDITORIAL
      ========================================================= */}
      <section className="relative py-20 sm:py-24 lg:py-28 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-red-600" />
            <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Quiénes somos</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-7">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tight">
                Somos más que <span className="text-gray-600">un club.</span>
              </h1>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                Lobos Quad Rugby es un club creado en Valencia en 2017. Nuestro objetivo principal es promover la integración social de las personas con discapacidad a través del rugby en silla de ruedas, mejorando su calidad de vida y ofreciendo oportunidades recreativas y competitivas.
              </p>
              <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
                Para nosotros, el rugby no termina cuando acaba un partido. Es un espacio para competir, conocer nuestros límites, superarlos y construir una comunidad en la que cada persona tenga su lugar.
              </p>
              <div className="pt-4 flex items-center gap-4 text-sm uppercase tracking-wider text-white">
                <span className="text-red-500 italic text-2xl font-black leading-none">"</span>
                <span className="text-gray-300">No necesito que sea fácil, solo que sea posible.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOBOS EN NÚMEROS
      ========================================================= */}
      <section className="py-16 sm:py-20 bg-[#080808] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Nuestra trayectoria</span>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black uppercase">Lobos en números</h2>
            </div>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">Una historia construida paso a paso, dentro y fuera de la pista.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 border border-white/10">
            <div className="p-6 sm:p-8 lg:p-10 border-r border-b lg:border-b-0 border-white/10">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">2017</span>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">Año de fundación</p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 lg:border-r border-b lg:border-b-0 border-white/10">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">2019</span>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">Inicio en Liga Nacional</p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 border-r border-white/10">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-red-600">2</span>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">Jugadores con España</p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">VALENCIA</span>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">Nuestra casa</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LO QUE HACEMOS (3 PILARES)
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28 bg-[#080808] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-14">
            <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Nuestro enfoque</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase">Tres pilares</h2>
            <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed">Áreas que definen la actividad de Lobos dentro y fuera de la pista.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            <article className="bg-[#080808] p-6 sm:p-8 lg:p-10 group hover:bg-[#0d0d0d] transition-colors duration-300">
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-gray-600 font-mono">01</span>
                <ArrowUpRight className="text-gray-600 group-hover:text-red-500 transition-colors w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="mt-12 sm:mt-16">
                <h3 className="text-xl sm:text-2xl font-black uppercase">Deporte de competición</h3>
                <p className="mt-4 sm:mt-5 text-gray-500 leading-relaxed text-sm sm:text-base">Primer equipo de la Comunidad Valenciana en la Liga Nacional desde 2019, participando en torneos de élite y formando jugadores de alto rendimiento.</p>
                <Link to="/competiciones" className="inline-flex items-center gap-2 mt-6 sm:mt-7 text-xs uppercase tracking-widest text-white hover:text-red-500 transition-colors">
                  Ver competiciones <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </article>

            <article className="bg-[#080808] p-6 sm:p-8 lg:p-10 group hover:bg-[#0d0d0d] transition-colors duration-300">
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-gray-600 font-mono">02</span>
                <ArrowUpRight className="text-gray-600 group-hover:text-red-500 transition-colors w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="mt-12 sm:mt-16">
                <h3 className="text-xl sm:text-2xl font-black uppercase">Canal de sensibilización</h3>
                <p className="mt-4 sm:mt-5 text-gray-500 leading-relaxed text-sm sm:text-base">Utilizamos el deporte para visibilizar la discapacidad, romper barreras y acercar el rugby en silla de ruedas a todas las personas mediante exhibiciones y charlas.</p>
              </div>
            </article>

            <article className="bg-[#080808] p-6 sm:p-8 lg:p-10 group hover:bg-[#0d0d0d] transition-colors duration-300">
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-gray-600 font-mono">03</span>
                <ArrowUpRight className="text-gray-600 group-hover:text-red-500 transition-colors w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="mt-12 sm:mt-16">
                <h3 className="text-xl sm:text-2xl font-black uppercase">Ocio y Salud</h3>
                <p className="mt-4 sm:mt-5 text-gray-500 leading-relaxed text-sm sm:text-base">Promoción de actividades físico-deportivas no competitivas para personas con discapacidad que desean mantener y mejorar su calidad de vida y autonomía.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================
          HISTORIA
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14">
            <div className="lg:col-span-4">
              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Nuestra historia</span>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight">
                Un camino <span className="text-gray-600">que empezó</span> en 2017.
              </h2>
            </div>

            <div className="lg:col-span-8">
              <div className="relative border-l border-white/10">
                <div className="relative pl-6 sm:pl-8 pb-12 sm:pb-16">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-xs sm:text-sm font-mono text-gray-500">ORIGEN</span>
                  <h3 className="mt-3 text-xl sm:text-2xl font-black uppercase">Rugby en silla de ruedas</h3>
                  <p className="mt-4 text-gray-500 leading-relaxed text-sm sm:text-base">Nació en Canadá a finales de los años 70. Es un deporte de contacto e intensidad diseñado para personas con discapacidad que afecta a las extremidades (tetraplejia, distrofias, amputaciones), ofreciendo una oportunidad única de deporte de alta exigencia.</p>
                </div>

                <div className="relative pl-6 sm:pl-8 pb-12 sm:pb-16">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-xs sm:text-sm font-mono text-red-500">2017</span>
                  <h3 className="mt-3 text-xl sm:text-2xl font-black uppercase">El comienzo</h3>
                  <p className="mt-4 text-gray-500 leading-relaxed text-sm sm:text-base">Carlos Sanchis y un grupo de potenciales jugadores comienzan a dar forma al proyecto en Valencia. Los primeros pasos estuvieron marcados por la dificultad de acceder a material específico, ya que las sillas deportivas suponían una inversión cercana a los 5.000 euros, por lo que se entrenó con sillas multidisciplinares.</p>
                </div>

                <div className="relative pl-6 sm:pl-8">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-xs sm:text-sm font-mono text-red-500">2019</span>
                  <h3 className="mt-3 text-xl sm:text-2xl font-black uppercase">Llegamos a la Liga Nacional</h3>
                  <p className="mt-4 text-gray-500 leading-relaxed text-sm sm:text-base">Lobos se convierte en el primer equipo de la Comunidad Valenciana en competir en la Liga Nacional. Desde entonces, el club ha seguido creciendo y dos de nuestros jugadores han sido convocados por la Selección Española.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
           NUESTRAS INICIOS — FOTOS DOS PRIMEIROS ANOS
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28 bg-[#080808] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Texto lateral */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-red-600" />
                <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                  Nuestros inicios
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-[0.95]">
                De los primeros <span className="text-gray-600">entrenamientos</span> a la competición.
              </h2>

              <p className="mt-6 text-gray-500 leading-relaxed">
                Antes de las sillas específicas, antes de la Liga Nacional, hubo entrenamientos en sillas multidisciplinares, mucho esfuerzo y un grupo de personas que creyeron en el proyecto desde el primer día.
              </p>

              <p className="mt-4 text-gray-500 leading-relaxed">
                Estas imágenes documentan nuestros primeros pasos y nuestra primera jornada oficial, un momento que marcó el inicio de una nueva etapa para Lobos Quad Rugby.
              </p>

              <div className="mt-8 flex items-center gap-6">
                <div>
                  <span className="block text-3xl font-black text-white">2017</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Fundación</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <span className="block text-3xl font-black text-red-600">2019</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Liga Nacional</span>
                </div>
              </div>
            </div>

            {/* Grid de fotos */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">

                {/* Foto P&B 01 — Primeros entrenamientos */}
                <figure className="relative aspect-square overflow-hidden bg-black border border-white/10 group">
                  <img
                    src="/assets/inicio1.jpg"
                    alt="Primeros entrenamientos Lobos Quad Rugby"
                    className="w-full h-full object-cover grayscale opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 bg-black/70 px-2 py-1 inline-block">
                      Primeros entrenamientos
                    </span>
                  </div>
                </figure>

                {/* Foto P&B 02 — Primeros entrenamientos */}
                <figure className="relative aspect-square overflow-hidden bg-black border border-white/10 group">
                  <img
                    src="/assets/inicio2.jpg"
                    alt="Primeros entrenamientos Lobos Quad Rugby"
                    className="w-full h-full object-cover grayscale opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 bg-black/70 px-2 py-1 inline-block">
                      Primeros entrenamientos
                    </span>
                  </div>
                </figure>

                {/* Foto COLORIDA — Primera jornada (destaque) */}
                <figure className="col-span-2 relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-black border border-red-600/30 group">
                  <img
                    src="/assets/inicio.jpg"
                    alt="Primera jornada oficial Lobos Quad Rugby"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-red-500 bg-black/80 px-2.5 py-1.5 inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Primera jornada oficial
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-[0.15em]">
                        El inicio de una nueva etapa
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-white/50">
                      Lobos Quad Rugby · Valencia
                    </span>
                  </div>
                </figure>

                {/* Foto P&B 03 — Jornada */}
                <figure className="relative aspect-square overflow-hidden bg-black border border-white/10 group">
                  <img
                    src="/assets/jornada.jpg"
                    alt="Primeros entrenamientos Lobos Quad Rugby"
                    className="w-full h-full object-cover grayscale opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 bg-black/70 px-2 py-1 inline-block">
                      En la pista
                    </span>
                  </div>
                </figure>

                {/* Bloco decorativo com ano */}
                <figure className="relative aspect-square overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <span className="block text-5xl sm:text-6xl font-black text-red-600 leading-none">
                      2017
                    </span>
                    <span className="block mt-3 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold">
                      Año de fundación
                    </span>
                    <div className="mt-4 w-8 h-px bg-white/20 mx-auto" />
                    <p className="mt-3 text-[10px] text-gray-600 leading-relaxed max-w-[140px] mx-auto">
                      Donde todo comenzó
                    </p>
                  </div>
                </figure>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOGRO — SELECCIÓN ESPAÑOLA
      ========================================================= */}
      <section className="relative py-20 sm:py-24 lg:py-28 bg-red-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-64 sm:w-96 h-64 sm:h-96 border-8 sm:border-[40px] border-black rounded-full" />
          <div className="absolute -right-40 -bottom-40 w-80 sm:w-[500px] h-80 sm:h-[500px] border-12 sm:border-[60px] border-black rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-bold">Orgullo Lobos</span>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-6xl font-black uppercase leading-[0.9] text-black">
                Talento que <span className="block">representa a España.</span>
              </h2>
              <p className="mt-6 sm:mt-8 text-base sm:text-lg text-black/80 max-w-2xl leading-relaxed">Dos jugadores de Lobos han sido convocados con la Selección Española. Un reconocimiento al trabajo, compromiso y nivel deportivo alcanzado por nuestros atletas.</p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <div className="inline-block">
                <span className="block text-6xl sm:text-7xl lg:text-9xl leading-none font-black text-black">02</span>
                <span className="block mt-2 text-xs sm:text-sm uppercase tracking-[0.25em] font-bold text-black/70">Convocados con España</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VIDEO
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 mb-10 sm:mb-12">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">En primera persona</span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase">Vive la experiencia</h2>
            </div>
            <p className="text-gray-500 max-w-md leading-relaxed text-sm sm:text-base">El rugby en silla de ruedas se entiende mejor cuando se vive. Descubre nuestra realidad dentro y fuera de la pista.</p>
          </div>
          <div className="relative aspect-video bg-[#080808] border border-white/10 overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/1WIZn1O7bQ0?si=ke7thQTQvqPBQU9x"
              title="Lobos Quad Rugby Valencia - En Acción"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          GALERÍA
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28 bg-[#080808] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 sm:gap-8 mb-10 sm:mb-12">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Dentro de la pista</span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase">El equipo en acción</h2>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={previousImage} aria-label="Imagen anterior" className="w-10 h-10 sm:w-12 sm:h-12 border border-white/20 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all">
                <span className="text-lg sm:text-xl">←</span>
              </button>
              <button type="button" onClick={nextImage} aria-label="Siguiente imagen" className="w-10 h-10 sm:w-12 sm:h-12 border border-white/20 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all">
                <span className="text-lg sm:text-xl">→</span>
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-black">
            {galleryImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Lobos Quad Rugby - momento ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-white/70">Lobos Quad Rugby · Valencia</span>
              <span className="text-xs font-mono text-white/70">
                {String(currentImage + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
                className={`h-1 transition-all duration-300 ${index === currentImage ? 'w-8 sm:w-10 bg-red-600' : 'w-2 sm:w-5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          VALORES
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 sm:gap-12">
            <div className="lg:col-span-4">
              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Código Lobos</span>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight">
                Nuestros <span className="text-gray-600">valores.</span>
              </h2>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-0">
                {['Inclusión y accesibilidad', 'Esfuerzo y superación', 'Trabajo en equipo', 'Respeto y fair play', 'Pasión por el deporte'].map((valor, index) => (
                  <div key={index} className="py-5 sm:py-6 flex items-center gap-4 sm:gap-5 border-b border-white/10 last:border-0">
                    <CheckIcon className="text-red-600 shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-base sm:text-lg lg:text-xl font-bold uppercase">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA FINAL
      ========================================================= */}
      <section className="py-20 sm:py-24 lg:py-28 bg-red-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-4xl">
            <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-bold">Forma parte del proyecto</span>
            <h2 className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.88] text-black">
              ¿Quieres formar <span className="block">parte de los Lobos?</span>
            </h2>
            <p className="mt-6 sm:mt-8 text-base sm:text-lg text-black/75 max-w-2xl leading-relaxed">Ya sea dentro de la pista, apoyando al equipo o colaborando con el proyecto, hay muchas formas de formar parte de la manada.</p>
            <div className="mt-8 sm:mt-10 flex flex-wrap gap-4">
              <Link to="/unete" className="group inline-flex items-center gap-3 bg-black text-white px-6 sm:px-7 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300">
                Quiero unirme <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
              <Link to="/equipo" className="inline-flex items-center gap-3 border border-black/30 text-black px-6 sm:px-7 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-300">
                Conocer al equipo <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
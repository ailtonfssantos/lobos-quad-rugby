import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const galleryImages = [
  '/assets/momento-1.PNG',
  '/assets/momento-2.PNG',
  '/assets/momento-3.PNG',
  '/assets/momento-4.PNG',
  '/assets/momento-5.PNG',
  '/assets/momento-6.PNG',
  '/assets/momento-7.PNG',
];

const Icon = ({ path, className = 'w-6 h-6' }) => (
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

const ArrowUpRight = ({ className = 'w-5 h-5' }) => (
  <Icon
    className={className}
    path="M7 17L17 7M7 7h10v10"
  />
);

const ArrowRight = ({ className = 'w-5 h-5' }) => (
  <Icon
    className={className}
    path="M5 12h14M13 6l6 6-6 6"
  />
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <Icon
    className={className}
    path="M5 12l4 4L19 6"
  />
);

export default function About() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  };

  const previousImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % galleryImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-black text-white overflow-hidden">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-[78vh] flex items-end overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="/assets/equipo1.JPG"
            alt="Lobos Quad Rugby Valencia"
            className="w-full h-full object-cover grayscale opacity-50"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24">

          <div className="max-w-4xl">

            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px bg-red-600" />
              <span className="text-xs tracking-[0.3em] uppercase text-gray-300">
                Quiénes somos
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] uppercase">
              Lobos
              <span className="block text-gray-400">
                Quad Rugby
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-2xl leading-relaxed">
              Un club de rugby en silla de ruedas nacido en Valencia
              para competir, crecer y abrir camino.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                to="/equipo"
                className="group inline-flex items-center gap-3 bg-white text-black px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:bg-red-600 hover:text-white"
              >
                Conoce al equipo
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                to="/competiciones"
                className="inline-flex items-center gap-3 border border-white/30 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Ver competiciones
                <ArrowRight />
              </Link>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          QUIÉNES SOMOS
      ========================================================= */}
      <section className="py-24 lg:py-32 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

            <div className="lg:col-span-5">

              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                Desde Valencia
              </span>

              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.95]">
                Somos una
                <span className="block text-gray-500">
                  manada.
                </span>
              </h2>

            </div>

            <div className="lg:col-span-7">

              <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
                Lobos Quad Rugby es un club de rugby en silla de ruedas
                creado en Valencia en 2017. Desde nuestros primeros pasos
                hemos trabajado para convertir el deporte adaptado en una
                herramienta de competición, autonomía, inclusión y
                transformación social.
              </p>

              <p className="mt-7 text-gray-400 text-lg leading-relaxed max-w-3xl">
                Para nosotros, el rugby no termina cuando acaba un partido.
                Es un espacio para competir, conocer nuestros límites,
                superarlos y construir una comunidad en la que cada persona
                tenga su lugar.
              </p>

              <div className="mt-10 flex items-center gap-4 text-sm uppercase tracking-wider text-white">
                <span className="text-red-500 italic text-2xl font-black">
                  “
                </span>
                <span>
                  No necesito que sea fácil, solo que sea posible.
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          LOBOS EN NÚMEROS
      ========================================================= */}
      <section className="py-20 bg-[#080808] border-b border-white/10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">

            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                Nuestra trayectoria
              </span>

              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase">
                Lobos en números
              </h2>
            </div>

            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              Una historia construida paso a paso, dentro y fuera de la pista.
            </p>

          </div>


          <div className="grid grid-cols-2 lg:grid-cols-4 border border-white/10">

            <div className="p-7 lg:p-10 border-r border-b lg:border-b-0 border-white/10">
              <span className="text-5xl lg:text-6xl font-black text-white">
                2017
              </span>

              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                Año de fundación
              </p>
            </div>


            <div className="p-7 lg:p-10 lg:border-r border-b lg:border-b-0 border-white/10">
              <span className="text-5xl lg:text-6xl font-black text-white">
                2019
              </span>

              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                Liga Nacional
              </p>
            </div>


            <div className="p-7 lg:p-10 border-r border-white/10">
              <span className="text-5xl lg:text-6xl font-black text-red-600">
                2
              </span>

              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                Jugadores convocados con España
              </p>
            </div>


            <div className="p-7 lg:p-10">
              <span className="text-4xl lg:text-5xl font-black text-white">
                VALENCIA
              </span>

              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
                Nuestra casa
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          MISIÓN
      ========================================================= */}
      <section className="py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-12 gap-12">

            <div className="lg:col-span-4">

              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                Nuestra misión
              </span>

              <h2 className="mt-5 text-4xl lg:text-5xl font-black uppercase leading-tight">
                Competir.
                <span className="block text-gray-500">
                  Inspirar.
                </span>
                Transformar.
              </h2>

            </div>

            <div className="lg:col-span-8">

              <p className="text-2xl lg:text-3xl leading-relaxed text-white">
                Queremos que cualquier persona que se acerque al rugby en
                silla de ruedas encuentre una oportunidad real para practicar
                deporte, competir y formar parte de un equipo.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mt-14">

                <div className="border-l border-red-600 pl-6">
                  <h3 className="font-bold uppercase tracking-wide">
                    Deporte
                  </h3>

                  <p className="mt-3 text-gray-500 leading-relaxed">
                    Impulsamos el rugby en silla de ruedas como deporte de
                    competición y como herramienta de desarrollo personal.
                  </p>
                </div>

                <div className="border-l border-white/20 pl-6">
                  <h3 className="font-bold uppercase tracking-wide">
                    Comunidad
                  </h3>

                  <p className="mt-3 text-gray-500 leading-relaxed">
                    Construimos un espacio donde jugadores, familias,
                    voluntarios y colaboradores puedan crecer juntos.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          LO QUE HACEMOS
      ========================================================= */}
      <section className="py-24 lg:py-32 bg-[#080808] border-y border-white/10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="max-w-2xl mb-14">

            <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
              Nuestro trabajo
            </span>

            <h2 className="mt-4 text-4xl sm:text-5xl font-black uppercase">
              Lo que hacemos
            </h2>

            <p className="mt-5 text-gray-500 text-lg leading-relaxed">
              Tres áreas que definen la actividad de Lobos dentro y fuera
              de la pista.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-px bg-white/10">

            {/* CARD 1 */}
            <article className="bg-[#080808] p-8 lg:p-10 group hover:bg-[#0d0d0d] transition-colors duration-300">

              <div className="flex justify-between items-start">

                <span className="text-sm text-gray-600 font-mono">
                  01
                </span>

                <ArrowUpRight className="text-gray-600 group-hover:text-red-500 transition-colors" />

              </div>

              <div className="mt-16">

                <h3 className="text-2xl font-black uppercase">
                  Deporte de competición
                </h3>

                <p className="mt-5 text-gray-500 leading-relaxed">
                  Entrenamos y competimos al máximo nivel posible,
                  representando a Valencia en la Liga Nacional y en
                  diferentes encuentros deportivos.
                </p>

                <Link
                  to="/competiciones"
                  className="inline-flex items-center gap-2 mt-7 text-xs uppercase tracking-widest text-white hover:text-red-500 transition-colors"
                >
                  Ver competiciones
                  <ArrowRight className="w-4 h-4" />
                </Link>

              </div>
            </article>


            {/* CARD 2 */}
            <article className="bg-[#080808] p-8 lg:p-10 group hover:bg-[#0d0d0d] transition-colors duration-300">

              <div className="flex justify-between items-start">

                <span className="text-sm text-gray-600 font-mono">
                  02
                </span>

                <ArrowUpRight className="text-gray-600 group-hover:text-red-500 transition-colors" />

              </div>

              <div className="mt-16">

                <h3 className="text-2xl font-black uppercase">
                  Inclusión y sensibilización
                </h3>

                <p className="mt-5 text-gray-500 leading-relaxed">
                  Utilizamos el deporte para visibilizar la discapacidad,
                  romper barreras y demostrar que la accesibilidad también
                  se construye desde la experiencia.
                </p>

              </div>
            </article>


            {/* CARD 3 */}
            <article className="bg-[#080808] p-8 lg:p-10 group hover:bg-[#0d0d0d] transition-colors duration-300">

              <div className="flex justify-between items-start">

                <span className="text-sm text-gray-600 font-mono">
                  03
                </span>

                <ArrowUpRight className="text-gray-600 group-hover:text-red-500 transition-colors" />

              </div>

              <div className="mt-16">

                <h3 className="text-2xl font-black uppercase">
                  Ocio y salud
                </h3>

                <p className="mt-5 text-gray-500 leading-relaxed">
                  Fomentamos la práctica deportiva como una vía para
                  mejorar el bienestar, la autonomía y las relaciones
                  sociales.
                </p>

                <Link
                  to="/unete"
                  className="inline-flex items-center gap-2 mt-7 text-xs uppercase tracking-widest text-white hover:text-red-500 transition-colors"
                >
                  Únete a los Lobos
                  <ArrowRight className="w-4 h-4" />
                </Link>

              </div>
            </article>

          </div>
        </div>
      </section>


      {/* =========================================================
          HISTORIA
      ========================================================= */}
      <section className="py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-12 gap-14">

            <div className="lg:col-span-4">

              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                Nuestra historia
              </span>

              <h2 className="mt-5 text-4xl lg:text-5xl font-black uppercase leading-tight">
                Un camino
                <span className="block text-gray-500">
                  que empezó
                </span>
                en 2017.
              </h2>

            </div>


            <div className="lg:col-span-8">

              <div className="relative border-l border-white/10">

                {/* 2017 */}
                <div className="relative pl-8 pb-16">

                  <span className="absolute -left-[5px] top-1 w-2 h-2 bg-red-600 rounded-full" />

                  <span className="text-sm font-mono text-red-500">
                    2017
                  </span>

                  <h3 className="mt-3 text-2xl font-black uppercase">
                    El comienzo
                  </h3>

                  <p className="mt-4 text-gray-500 leading-relaxed max-w-2xl">
                    Lobos Quad Rugby nace en Valencia con el objetivo de
                    crear un espacio estable para la práctica del rugby en
                    silla de ruedas. Carlos Sanchis y un grupo de jugadores
                    interesados en este deporte comienzan a dar forma al
                    proyecto.
                  </p>

                  <p className="mt-4 text-gray-500 leading-relaxed max-w-2xl">
                    En aquellos primeros momentos, las sillas deportivas
                    específicas suponían una inversión cercana a los
                    5.000 euros. El proyecto comenzó utilizando sillas
                    multideportivas mientras se buscaban recursos y
                    oportunidades para seguir creciendo.
                  </p>

                </div>


                {/* 2019 */}
                <div className="relative pl-8">

                  <span className="absolute -left-[5px] top-1 w-2 h-2 bg-red-600 rounded-full" />

                  <span className="text-sm font-mono text-red-500">
                    2019
                  </span>

                  <h3 className="mt-3 text-2xl font-black uppercase">
                    Llegamos a la Liga Nacional
                  </h3>

                  <p className="mt-4 text-gray-500 leading-relaxed max-w-2xl">
                    Lobos se convierte en el primer equipo de la Comunidad
                    Valenciana en competir en la Liga Nacional de rugby en
                    silla de ruedas, consolidando el proyecto dentro del
                    panorama competitivo español.
                  </p>

                  <p className="mt-4 text-gray-500 leading-relaxed max-w-2xl">
                    Desde entonces, el club ha seguido creciendo y dos de
                    nuestros jugadores han recibido convocatorias con la
                    Selección Española.
                  </p>

                </div>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          SELECCIÓN ESPAÑOLA / LOGRO
      ========================================================= */}
      <section className="relative py-24 lg:py-32 bg-red-600 overflow-hidden">

        <div className="absolute inset-0 opacity-10">

          <div className="absolute -right-20 -top-20 w-96 h-96 border-[40px] border-black rounded-full" />
          <div className="absolute -right-40 -bottom-40 w-[500px] h-[500px] border-[60px] border-black rounded-full" />

        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-8">

              <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-bold">
                Orgullo Lobos
              </span>

              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.9] text-black">
                Talento que
                <span className="block">
                  representa a España.
                </span>
              </h2>

              <p className="mt-8 text-lg lg:text-xl text-black/80 max-w-2xl leading-relaxed">
                Dos jugadores de Lobos han sido convocados con la
                Selección Española. Un reconocimiento al trabajo,
                compromiso y nivel deportivo alcanzado por nuestros
                jugadores.
              </p>

            </div>

            <div className="lg:col-span-4 lg:text-right">

              <div className="inline-block">

                <span className="block text-[7rem] lg:text-[9rem] leading-none font-black text-black">
                  02
                </span>

                <span className="block mt-2 text-sm uppercase tracking-[0.25em] font-bold text-black/70">
                  Convocados con España
                </span>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          VIDEO
      ========================================================= */}
      <section className="py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">

            <div>

              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                En primera persona
              </span>

              <h2 className="mt-4 text-4xl sm:text-5xl font-black uppercase">
                Vive la experiencia
              </h2>

            </div>

            <p className="text-gray-500 max-w-md leading-relaxed">
              El rugby en silla de ruedas se entiende mejor cuando se vive.
              Descubre nuestra realidad dentro y fuera de la pista.
            </p>

          </div>


          <div className="relative aspect-video bg-[#080808] border border-white/10 overflow-hidden">

            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/1WIZn1O7bQ0?si=ke7thQTQvqPBQU9x"
              title="Lobos Quad Rugby Valencia"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          </div>

        </div>
      </section>


      {/* =========================================================
          GALERÍA
      ========================================================= */}
      <section className="py-24 lg:py-32 bg-[#080808] border-y border-white/10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">

            <div>

              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                Dentro de la pista
              </span>

              <h2 className="mt-4 text-4xl sm:text-5xl font-black uppercase">
                La manada en acción
              </h2>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={previousImage}
                aria-label="Imagen anterior"
                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
              >
                <span className="text-xl">←</span>
              </button>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Siguiente imagen"
                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
              >
                <span className="text-xl">→</span>
              </button>

            </div>

          </div>


          <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-black">

            {galleryImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Lobos Quad Rugby - momento ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  index === currentImage
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">

              <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                Lobos Quad Rugby · Valencia
              </span>

              <span className="text-xs font-mono text-white/70">
                {String(currentImage + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
              </span>

            </div>

          </div>


          {/* Indicadores */}
          <div className="flex gap-2 mt-5">

            {galleryImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
                className={`h-1 transition-all duration-300 ${
                  index === currentImage
                    ? 'w-10 bg-red-600'
                    : 'w-5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          VALORES
      ========================================================= */}
      <section className="py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-12 gap-12">

            <div className="lg:col-span-4">

              <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">
                Código Lobos
              </span>

              <h2 className="mt-5 text-4xl lg:text-5xl font-black uppercase leading-tight">
                Nuestros
                <span className="block text-gray-500">
                  valores.
                </span>
              </h2>

            </div>


            <div className="lg:col-span-8">

              <div className="divide-y divide-white/10 border-y border-white/10">

                <div className="py-7 flex items-center gap-5">

                  <CheckIcon className="text-red-600 shrink-0" />

                  <span className="text-xl lg:text-2xl font-bold uppercase">
                    Inclusión y accesibilidad
                  </span>

                </div>


                <div className="py-7 flex items-center gap-5">

                  <CheckIcon className="text-red-600 shrink-0" />

                  <span className="text-xl lg:text-2xl font-bold uppercase">
                    Esfuerzo y superación
                  </span>

                </div>


                <div className="py-7 flex items-center gap-5">

                  <CheckIcon className="text-red-600 shrink-0" />

                  <span className="text-xl lg:text-2xl font-bold uppercase">
                    Trabajo en equipo
                  </span>

                </div>


                <div className="py-7 flex items-center gap-5">

                  <CheckIcon className="text-red-600 shrink-0" />

                  <span className="text-xl lg:text-2xl font-bold uppercase">
                    Respeto y fair play
                  </span>

                </div>


                <div className="py-7 flex items-center gap-5">

                  <CheckIcon className="text-red-600 shrink-0" />

                  <span className="text-xl lg:text-2xl font-bold uppercase">
                    Pasión por el deporte
                  </span>

                </div>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          CTA FINAL
      ========================================================= */}
      <section className="py-24 lg:py-32 bg-red-600">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="max-w-4xl">

            <span className="text-xs tracking-[0.3em] uppercase text-black/60 font-bold">
              Forma parte del proyecto
            </span>

            <h2 className="mt-5 text-5xl sm:text-6xl lg:text-8xl font-black uppercase leading-[0.88] text-black">
              ¿Quieres formar
              <span className="block">
                parte de los Lobos?
              </span>
            </h2>

            <p className="mt-8 text-lg lg:text-xl text-black/75 max-w-2xl leading-relaxed">
              Ya sea dentro de la pista, apoyando al equipo o colaborando
              con el proyecto, hay muchas formas de formar parte de la
              manada.
            </p>


            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                to="/unete"
                className="group inline-flex items-center gap-3 bg-black text-white px-7 py-4 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all duration-300"
              >
                Quiero unirme
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>


              <Link
                to="/equipo"
                className="inline-flex items-center gap-3 border border-black/30 text-black px-7 py-4 text-sm font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all duration-300"
              >
                Conocer al equipo
                <ArrowRight />
              </Link>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function About() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const objetivos = [
    {
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      title: 'Inclusión y Accesibilidad',
      description: 'Garantizar que las instalaciones, actividades y eventos sean accesibles para personas con discapacidad, proporcionando material deportivo adaptado de alta calidad.',
    },
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'Fomento del Deporte Adaptado',
      description: 'Organizar eventos y competiciones de élite para personas con discapacidad, participando activamente en la Liga Nacional y torneos inclusivos.',
    },
    {
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
      title: 'Concienciación Social',
      description: 'Realizar charlas, exhibiciones y acciones de sensibilización para dar a conocer el rugby en silla de ruedas y romper barreras en la sociedad.',
    },
  ];

  const pilares = [
    {
      title: 'Deporte de Competición',
      description: 'Primer equipo de rugby en silla de la Comunidad Valenciana, participando en la Liga Nacional desde 2019, con jugadores convocados por la Selección Española.',
    },
    {
      title: 'Canal de Sensibilización',
      description: 'Organización y colaboración en actividades deportivas destinadas a dar a conocer el rugby en silla a todas las personas, con o sin discapacidad.',
    },
    {
      title: 'Deporte de Ocio y Salud',
      description: 'Promoción de actividades físico-deportivas no competitivas para personas con discapacidad que desean mantener y mejorar su calidad de vida.',
    },
  ];

  const valores = [
    'Inclusión y accesibilidad',
    'Esfuerzo y superación',
    'Trabajo en equipo',
    'Respeto y fair play',
    'Pasión por el deporte',
  ];

  const galeriaFotos = [
    { id: 1, src: '/assets/momento-1.PNG', alt: 'Momento 1' },
    { id: 2, src: '/assets/momento-2.PNG', alt: 'Momento 2' },
    { id: 3, src: '/assets/momento-3.PNG', alt: 'Momento 3' },
    { id: 4, src: '/assets/momento-4.PNG', alt: 'Momento 4' },
    { id: 5, src: '/assets/momento-5.PNG', alt: 'Momento 5' },
    { id: 6, src: '/assets/momento-6.PNG', alt: 'Momento 6' },
    { id: 7, src: '/assets/momento-7.PNG', alt: 'Momento 7' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === galeriaFotos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? galeriaFotos.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30">
      
      {/* Header */}
      <section className="relative py-32 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase mb-6">Quiénes Somos</p>
          <h1 className="font-display text-6xl md:text-8xl mb-8 text-white tracking-tight">SOBRE NOSOTROS</h1>
          <p className="text-2xl md:text-3xl text-zinc-400 font-light italic max-w-3xl mx-auto leading-relaxed">
            "No necesito que sea fácil, solo que sea posible"
          </p>
        </div>
      </section>

      {/* Misión */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Nuestra Misión</p>
              <div className="w-12 h-1 bg-red-600"></div>
            </div>
            <div className="md:w-2/3 space-y-6">
              <p className="text-zinc-200 text-xl md:text-2xl leading-relaxed font-light">
                El objetivo principal del Club Lobos Quad Rugby Valencia es promover la integración social de las personas con discapacidad a través del rugby en silla de ruedas.
              </p>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Mejorar la calidad de vida y ofrecer oportunidades tanto recreativas como competitivas, utilizando la práctica deportiva como una herramienta fundamental para el bienestar y la igualdad de oportunidades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objetivos */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">Lo que nos mueve</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">NUESTROS OBJETIVOS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {objetivos.map((obj, index) => (
              <div key={index} className="group bg-zinc-950 border border-zinc-800 p-8 hover:border-red-600/50 transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center mb-6 group-hover:border-red-600/50 group-hover:bg-red-600/10 transition-colors">
                  <Icon path={obj.icon} className="w-6 h-6 text-zinc-400 group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="font-display text-xl text-white mb-4 group-hover:text-red-500 transition-colors">
                  {obj.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{obj.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-16">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">Nuestra Trayectoria</p>
            <h2 className="font-display text-4xl md:text-5xl text-white">NUESTRA HISTORIA</h2>
          </div>
          
          <div className="relative border-l border-zinc-800 ml-3 md:ml-6 space-y-12">
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-red-600 rounded-full ring-4 ring-zinc-950"></div>
              <p className="text-zinc-400 text-lg leading-relaxed mb-4">
                El rugby en silla de ruedas es un deporte de contacto y de emociones fuertes. Nació en Canadá a finales de los años 70, con el objetivo de que puedan practicarlo personas con discapacidad que tengan afectación en las extremidades inferiores y superiores: tetraplejia, distrofias, amputaciones...
              </p>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Es uno de los deportes que más adaptación requiere en su modalidad, ofreciendo una oportunidad única de deporte de contacto de alta intensidad.
              </p>
            </div>

            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-zinc-600 rounded-full ring-4 ring-zinc-950"></div>
              <span className="inline-block bg-zinc-900 border border-zinc-800 text-white font-display text-2xl px-4 py-1 mb-4 rounded-sm">2017</span>
              <h3 className="font-display text-2xl text-white mb-3">El Nacimiento del Club</h3>
              <p className="text-zinc-400 leading-relaxed">
                En 2017, Carlos Sanchis, enamorado de este deporte, se reúne con potenciales jugadores. Los comienzos fueron difíciles por el alto precio de las sillas especiales (unos 5.000€), por lo que los primeros entrenamientos se realizaron con sillas deportivas multidisciplinares.
              </p>
            </div>

            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-zinc-600 rounded-full ring-4 ring-zinc-950"></div>
              <span className="inline-block bg-zinc-900 border border-zinc-800 text-white font-display text-2xl px-4 py-1 mb-4 rounded-sm">2019</span>
              <h3 className="font-display text-2xl text-white mb-3">Liga Nacional</h3>
              <p className="text-zinc-400 leading-relaxed">
                Con la creación del primer equipo de la Comunidad Valenciana, Lobos Quad Rugby participa en la Liga Nacional desde 2019. Dos jugadores han sido convocados por la Selección Española, marcando un hito en la historia del club.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video (YOUTUBE EMBED) */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">En Acción</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">VIVE LA EXPERIENCIA</h2>
          </div>

          {/* Container com aspect-video para manter proporção 16:9 perfeita */}
          <div className="relative w-full bg-black border border-zinc-800 rounded-sm overflow-hidden shadow-2xl shadow-black/50 group aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/1WIZn1O7bQ0?si=ke7thQTQvqPBQU9x"
              title="Lobos Quad Rugby - En Acción"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>

          <p className="text-center text-zinc-500 mt-8 text-lg italic font-light">
            "La intensidad, el compañerismo y la pasión que nos define en cada entrenamiento y partido."
          </p>
        </div>
      </section>

      {/* Galería */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">Momentos</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">LA MANADA EN IMÁGENES</h2>
          </div>

          <div className="relative group">
            <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
              {galeriaFotos.map((foto, index) => (
                <div
                  key={foto.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img 
                    src={foto.src} 
                    alt={foto.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 hidden items-center justify-center bg-zinc-900">
                    <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="w-16 h-16 text-zinc-700" />
                  </div>
                </div>
              ))}

              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-zinc-950/80 hover:bg-red-600 text-white p-3 rounded-sm transition-all backdrop-blur-sm border border-zinc-800 opacity-0 group-hover:opacity-100"
                aria-label="Foto anterior"
              >
                <Icon path="M15.75 19.5L8.25 12l7.5-7.5" className="w-5 h-5" />
              </button>

              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-zinc-950/80 hover:bg-red-600 text-white p-3 rounded-sm transition-all backdrop-blur-sm border border-zinc-800 opacity-0 group-hover:opacity-100"
                aria-label="Foto siguiente"
              >
                <Icon path="M8.25 4.5l7.5 7.5-7.5 7.5" className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {galeriaFotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === currentSlide ? 'bg-red-600 w-8' : 'bg-zinc-800 w-2 hover:bg-zinc-600'
                  }`}
                  aria-label={`Ir a foto ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tres Pilares */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">Nuestro Enfoque</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">TRES PILARES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pilares.map((pilar, index) => (
              <div key={index} className="bg-zinc-950 border border-zinc-800 p-8 hover:border-zinc-600 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50"></div>
                <h3 className="font-display text-xl text-white mb-4">{pilar.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{pilar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">Lo que nos define</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">NUESTROS VALORES</h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-sm">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {valores.map((valor, index) => (
                <li key={index} className="flex items-center gap-4 text-zinc-300 group">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-150 transition-transform"></span>
                  <span className="font-medium tracking-wide">{valor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-red-600 to-red-700"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6 text-white tracking-tight">
            ¿QUIERES FORMAR PARTE?
          </h2>
          <p className="text-xl mb-10 text-red-100 font-light max-w-2xl mx-auto">
            Únete a nuestra manada y ayuda a hacer posible lo que parece imposible.
          </p>
          <Link to="/unete" className="inline-block px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-2xl rounded-sm">
            Únete a los Lobos
          </Link>
        </div>
      </section>

    </div>
  );
}
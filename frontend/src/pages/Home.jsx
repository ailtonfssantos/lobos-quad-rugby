import { Link } from 'react-router-dom';

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] md:h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Imagen de Fondo con efecto sutil */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/equipo1.JPG"
            alt="Equipe Lobos Quad Rugby" 
            className="w-full h-full object-cover object-top md:object-[center_-40%] opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-zinc-950"></div>
          <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <div className="inline-block mb-8 px-4 py-1.5 border border-red-600/30 bg-red-600/5 backdrop-blur-md rounded-sm">
            <span className="text-red-500 font-bold tracking-[0.3em] text-[10px] md:text-xs uppercase">Valencia, España</span>
          </div>
          
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl mb-8 tracking-tighter text-white drop-shadow-2xl">
            LOBOS <span className="text-red-600">QUAD</span> RUGBY
          </h1>
          
          <p className="text-lg md:text-2xl mb-12 text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed italic">
            "Más que un deporte. Somos una manada."
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/equipo" className="group relative px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-widest text-sm overflow-hidden transition-all hover:bg-red-700 rounded-sm">
              <span className="relative z-10">Conoce al Equipo</span>
            </Link>
            <Link to="/unete" className="px-8 py-4 bg-transparent border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-sm hover:border-white hover:text-white hover:bg-white/5 transition-all rounded-sm">
              Únete a la Manada
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE INFORMACIÓN TÉCNICA (Entrenamientos) */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Ubicación */}
            <div className="flex items-start gap-5 border-b md:border-b-0 md:border-r border-zinc-800 pb-6 md:pb-0 md:pr-8">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm text-red-500 shrink-0">
                <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1.5">Ubicación</p>
                <h3 className="text-lg font-display font-bold text-white mb-1">Pabellón Playa Malvarrosa</h3>
                <p className="text-zinc-400 text-sm">Valencia, España</p>
              </div>
            </div>

            {/* Lunes y Miércoles */}
            <div className="flex items-start gap-5 border-b md:border-b-0 md:border-r border-zinc-800 pb-6 md:pb-0 md:pr-8">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm text-red-500 shrink-0">
                <Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1.5">Lunes & Miércoles</p>
                <h3 className="text-lg font-display font-bold text-white mb-1">17:00 – 19:30</h3>
                <p className="text-zinc-400 text-sm">Entrenamiento regular</p>
              </div>
            </div>

            {/* Viernes (NUEVO) */}
            <div className="flex items-start gap-5">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm text-red-500 shrink-0">
                <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1.5">Viernes</p>
                <h3 className="text-lg font-display font-bold text-white mb-1">10:00 – 11:30</h3>
                <p className="text-zinc-400 text-sm">Sesión matinal de entrenamiento</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DE VALORES (CÓDIGO LOBOS) */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-3">Nuestra Filosofía</p>
            <h2 className="font-display text-4xl md:text-6xl text-white mb-4 tracking-tight">CÓDIGO LOBOS</h2>
            <div className="w-16 h-0.5 bg-red-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'INCLUSIÓN', desc: 'El deporte no entiende de barreras. Aquí todos somos atletas.' },
              { title: 'RESILIENCIA', desc: 'Superación personal dentro y fuera de la cancha, cada día.' },
              { title: 'TÁCTICA', desc: 'Velocidad, contacto y estrategia. Rugby de alto nivel.' },
              { title: 'MANADA', desc: 'El equipo es la familia. Nadie se queda atrás.' }
            ].map((item, index) => (
              <div key={index} className="group bg-zinc-900/50 border border-zinc-800 p-8 hover:border-red-600/50 hover:bg-zinc-900 transition-all duration-500 rounded-sm">
                <div className="w-8 h-0.5 bg-zinc-700 group-hover:bg-red-600 mb-6 transition-colors duration-500"></div>
                <h3 className="font-display text-xl text-white mb-3 group-hover:text-red-500 transition-colors tracking-wide">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOBRE NOSOTROS - Resumen */}
      <section className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-4">Quiénes Somos</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-8 tracking-tight">SOBRE NOSOTROS</h2>
          <p className="text-2xl md:text-3xl text-zinc-300 font-light italic mb-8 leading-relaxed">
            "No necesito que sea fácil, solo que sea posible"
          </p>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-3xl mx-auto">
            Desde 2017 promovemos la integración social de las personas con discapacidad a través del 
            rugby en silla de ruedas. Primer equipo de la Comunidad Valenciana en la Liga Nacional desde 2019.
          </p>
          <Link to="/sobre-nosotros" className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-sm hover:bg-red-600 hover:border-red-600 hover:text-white transition-all rounded-sm group">
            Conoce Nuestra Historia 
            <Icon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 5. CALL TO ACTION FINAL */}
      <section className="py-24 bg-red-600 relative overflow-hidden">
        {/* Gradiente sutil de fondo para efecto premium (reemplaza la textura de carbono) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/30 via-red-600 to-red-700"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 text-white tracking-tight">
            ¿TIENES LO QUE HAY QUE TENER?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-red-100 font-light max-w-2xl mx-auto">
            Buscamos nuevos talentos. No importa tu experiencia previa, solo tu actitud.
          </p>
          <Link to="/unete" className="inline-block px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-2xl shadow-black/40 rounded-sm">
            Solicitar Prueba
          </Link>
        </div>
      </section>

    </div>
  );
}
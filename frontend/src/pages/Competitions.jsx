import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Competitions() {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchJornadas = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/jornadas');
        const data = await res.json();
        
        // ✨ FILTRO MÁGICO: Solo guardar las jornadas que están activas (isActive === true)
        const jornadasActivas = data.filter(jornada => jornada.isActive === true);
        
        setJornadas(jornadasActivas);
      } catch (error) { 
        console.error("Error al cargar jornadas:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchJornadas();
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Cargando competiciones...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Temporada 2026/2027</p>
          <h1 className="font-display text-6xl md:text-8xl mb-6 text-white">COMPETICIONES</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Sigue el recorrido de Lobos Quad Rugby en la Liga Nacional y el Autonómico.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {jornadas.length === 0 ? (
          <p className="text-center text-zinc-600 italic">El calendario de la temporada se publicará próximamente.</p>
        ) : (
          jornadas.map((j) => (
            <section key={j.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
              {j.bannerUrl && (
                <div className="w-full h-48 md:h-64 bg-zinc-800 relative">
                  <img src={j.bannerUrl} alt={`Banner Jornada ${j.numero}`} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                </div>
              )}
              
              <div className={`p-6 md:p-8 ${j.bannerUrl ? '-mt-12 relative z-10' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-zinc-800 pb-6">
                  <div>
                    <p className="text-red-500 font-bold tracking-widest text-xs uppercase mb-1">{j.competicion}</p>
                    <h2 className="font-display text-3xl md:text-4xl text-white">Jornada {j.numero}</h2>
                    <p className="text-zinc-400 mt-2 flex items-center gap-2 text-sm">
                      <span className="font-bold text-zinc-300">{j.ciudad}</span> • {j.pabellon} • {j.fechas}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {j.partidos.map((p, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-800 p-5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="text-center min-w-[100px]">
                          <p className="text-zinc-300 font-bold text-sm">{p.diaSemana}</p>
                          <p className="text-red-500 text-lg font-display">{p.horario || 'TBD'}</p>
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-white">
                            Lobos QR <span className="text-zinc-600 mx-2 text-sm">vs</span> {p.rival}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {p.status === 'FINALIZADO' ? (
                          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-sm border border-zinc-800">
                            <div className="text-center">
                              <p className={`font-display text-2xl ${p.lobosScore > p.rivalScore ? 'text-green-500' : 'text-white'}`}>{p.lobosScore}</p>
                            </div>
                            <span className="text-zinc-700 font-display text-xl">-</span>
                            <div className="text-center">
                              <p className={`font-display text-2xl ${p.rivalScore > p.lobosScore ? 'text-green-500' : 'text-white'}`}>{p.rivalScore}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 border text-xs font-bold uppercase tracking-wider rounded-sm ${
                              p.status === 'CANCELADO' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {p.status}
                            </span>
                            {p.youtubeLink && (
                              <a 
                                href={p.youtubeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                              >
                                <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" className="w-4 h-4" />
                                Ver en vivo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      <section className="py-20 bg-red-600 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6 text-white">¿QUIERES VERLOS EN ACCIÓN?</h2>
          <p className="text-xl mb-10 text-red-100 font-light">Ven a apoyar a la manada en nuestro próximo partido en casa o síguenos en directo.</p>
          <Link to="/entrenamientos" className="inline-block px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-2xl">
            Ver Calendario y Ubicación
          </Link>
        </div>
      </section>
    </div>
  );
}
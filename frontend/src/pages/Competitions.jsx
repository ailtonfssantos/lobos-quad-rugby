import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, getImageUrl } from '../config';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Competitions() {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchJornadas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/jornadas`);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const data = await res.json();
        const jornadasActivas = data.filter(jornada => jornada.isActive === true);
        setJornadas(jornadasActivas);
      } catch (error) { 
        console.error("❌ Error al cargar jornadas:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchJornadas();
  }, []);

  // Atualiza o tempo atual a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 segundos
    return () => clearInterval(timer);
  }, []);

  // Função para extrair data da jornada (ex: "13 Y 14 DE DICIEMBRE DE 2026")
  const parseJornadaDates = (fechas) => {
    const meses = {
      'ENERO': 0, 'FEBRERO': 1, 'MARZO': 2, 'ABRIL': 3, 'MAYO': 4, 'JUNIO': 5,
      'JULIO': 6, 'AGOSTO': 7, 'SEPTIEMBRE': 8, 'OCTUBRE': 9, 'NOVIEMBRE': 10, 'DICIEMBRE': 11
    };
    
    // Extrai o ano
    const yearMatch = fechas.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    
    // Extrai o mês
    const monthMatch = fechas.match(/DE\s+(\w+)/);
    const month = monthMatch ? meses[monthMatch[1].toUpperCase()] : 0;
    
    // Extrai os dias (ex: "13 Y 14" ou "17 Y 18")
    const daysMatch = fechas.match(/(\d+)\s+Y\s+(\d+)/);
    const days = daysMatch ? [parseInt(daysMatch[1]), parseInt(daysMatch[2])] : [1, 2];
    
    return { year, month, days };
  };

  // Função para obter o status dinâmico da partida
  const getDynamicStatus = (jornada, partido) => {
    // Se já está finalizado ou cancelado, mantém o status
    if (partido.status === 'FINALIZADO' || partido.status === 'CANCELADO') {
      return partido.status;
    }

    // Se não tem horário ou link, é PROGRAMADO
    if (!partido.horario || !jornada.fechas) {
      return 'PROGRAMADO';
    }

    try {
      // Parseia as datas da jornada
      const { year, month, days } = parseJornadaDates(jornada.fechas);
      
      // Determina qual dia da jornada é este partido (Sábado ou Domingo)
      let dayIndex = 0; // Padrão: primeiro dia (Sábado)
      if (partido.diaSemana?.toLowerCase().includes('domingo')) {
        dayIndex = 1; // Segundo dia (Domingo)
      }
      
      const day = days[dayIndex] || days[0];
      
      // Cria a data completa da partida
      const [hours, minutes] = partido.horario.split(':').map(Number);
      const partidoDateTime = new Date(year, month, day, hours, minutes, 0);
      
      // Calcula o fim da partida (2 horas depois)
      const partidoEndDateTime = new Date(partidoDateTime);
      partidoEndDateTime.setHours(partidoDateTime.getHours() + 2);
      
      // Compara com o tempo atual
      const now = currentTime;
      
      if (now >= partidoDateTime && now <= partidoEndDateTime) {
        return 'EN_DIRECTO'; // Está acontecendo agora
      } else if (now < partidoDateTime) {
        return 'PROGRAMADO'; // Ainda não chegou a hora
      } else {
        return 'PROGRAMADO'; // Já passou, mas não foi marcado como finalizado
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'PROGRAMADO';
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Cargando competiciones...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="relative py-16 md:py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Temporada 2026/2027</p>
          <h1 className="font-display text-4xl md:text-7xl mb-6 text-white">COMPETICIONES</h1>
          <p className="text-zinc-400 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Sigue el recorrido de Lobos Quad Rugby en la Liga Nacional y el Autonómico.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-16">
        {jornadas.length === 0 ? (
          <p className="text-center text-zinc-600 italic">El calendario de la temporada se publicará próximamente.</p>
        ) : (
          jornadas.map((j) => (
            <section key={j.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
              {j.bannerUrl && (
                <div className="w-full h-48 md:h-64 bg-zinc-800 relative">
                  <img src={getImageUrl(j.bannerUrl)} alt={`Banner Jornada ${j.numero}`} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                </div>
              )}
              
              <div className={`p-5 md:p-8 ${j.bannerUrl ? '-mt-12 relative z-10' : ''}`}>
                <div className="mb-6 md:mb-8 border-b border-zinc-800 pb-6">
                  <p className="text-red-500 font-bold tracking-widest text-xs uppercase mb-2">{j.competicion}</p>
                  <h2 className="font-display text-2xl md:text-4xl text-white mb-4">Jornada {j.numero}</h2>
                  <div className="space-y-1 text-sm text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300 font-medium">{j.ciudad}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">•</span>
                      <span>{j.pabellon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">•</span>
                      <span>{j.fechas}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {j.partidos.map((p, idx) => {
                    const dynamicStatus = getDynamicStatus(j, p);
                    
                    return (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-sm">
                        <div className="p-4 md:p-5">
                          
                          {/* MOBILE LAYOUT */}
                          <div className="md:hidden">
                            {dynamicStatus === 'FINALIZADO' ? (
                              <div className="flex flex-col items-center text-center space-y-3 py-2">
                                <div>
                                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider">{p.diaSemana}</p>
                                  <p className="text-red-500 text-lg font-display font-bold">{p.horario || 'TBD'}</p>
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                  Lobos QR <span className="text-zinc-600 mx-2 text-sm">vs</span> {p.rival}
                                </h3>
                                <div className="flex items-center gap-4">
                                  <div className="text-center">
                                    <p className={`font-display text-2xl font-bold ${p.lobosScore > p.rivalScore ? 'text-green-500' : 'text-white'}`}>{p.lobosScore}</p>
                                  </div>
                                  <span className="text-zinc-700 text-xl">-</span>
                                  <div className="text-center">
                                    <p className={`font-display text-2xl font-bold ${p.rivalScore > p.lobosScore ? 'text-green-500' : 'text-white'}`}>{p.rivalScore}</p>
                                  </div>
                                </div>
                                {p.youtubeLink && (
                                  <a 
                                    href={p.youtubeLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-700 transition-colors"
                                  >
                                    <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" className="w-3 h-3" />
                                    Ver el partido
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-center">
                                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">{p.diaSemana}</p>
                                  <p className="text-red-500 text-lg font-display font-bold">{p.horario || 'TBD'}</p>
                                </div>
                                <div className="text-center">
                                  <h3 className="text-lg font-bold text-white">
                                    Lobos QR <span className="text-zinc-600 mx-2 text-sm">vs</span> {p.rival}
                                  </h3>
                                </div>
                                <div className="flex items-center justify-center gap-3 pt-2">
                                  {dynamicStatus === 'EN_DIRECTO' ? (
                                    <span className="px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-sm bg-green-500/10 text-green-500 border-green-500/20 animate-pulse">
                                      🔴 En Directo
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-sm bg-blue-500/10 text-blue-500 border-blue-500/20">
                                      Programado
                                    </span>
                                  )}
                                  {p.youtubeLink && (
                                    <a 
                                      href={p.youtubeLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-red-700 transition-colors"
                                    >
                                      <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" className="w-3 h-3" />
                                      {dynamicStatus === 'EN_DIRECTO' ? 'Ver ahora' : 'Live'}
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* DESKTOP LAYOUT */}
                          <div className="hidden md:flex md:flex-col md:items-center md:text-center md:space-y-3 md:py-2">
                            <div>
                              <p className="text-zinc-500 text-xs uppercase tracking-wider">{p.diaSemana}</p>
                              <p className="text-red-500 text-xl font-display font-bold">{p.horario || 'TBD'}</p>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                              Lobos QR <span className="text-zinc-600 mx-2 text-sm">vs</span> {p.rival}
                            </h3>
                            
                            {dynamicStatus === 'FINALIZADO' ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-4">
                                  <div className="text-center">
                                    <p className={`font-display text-3xl font-bold ${p.lobosScore > p.rivalScore ? 'text-green-500' : 'text-white'}`}>{p.lobosScore}</p>
                                  </div>
                                  <span className="text-zinc-700 text-2xl">-</span>
                                  <div className="text-center">
                                    <p className={`font-display text-3xl font-bold ${p.rivalScore > p.lobosScore ? 'text-green-500' : 'text-white'}`}>{p.rivalScore}</p>
                                  </div>
                                </div>
                                {p.youtubeLink && (
                                  <a 
                                    href={p.youtubeLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-700 transition-colors"
                                  >
                                    <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" className="w-4 h-4" />
                                    Ver el partido
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                {dynamicStatus === 'EN_DIRECTO' ? (
                                  <span className="px-4 py-2 border text-xs font-bold uppercase tracking-wider rounded-sm bg-green-500/10 text-green-500 border-green-500/20 animate-pulse">
                                    🔴 En Directo
                                  </span>
                                ) : (
                                  <span className="px-4 py-2 border text-xs font-bold uppercase tracking-wider rounded-sm bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    Programado
                                  </span>
                                )}
                                {p.youtubeLink && (
                                  <a 
                                    href={p.youtubeLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-700 transition-colors"
                                  >
                                    <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" className="w-4 h-4" />
                                    {dynamicStatus === 'EN_DIRECTO' ? 'Ver ahora' : 'Ver en vivo'}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      <section className="py-16 md:py-20 bg-red-600 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-6xl mb-6 text-white">¿QUIERES VERNOS EN ACCIÓN?</h2>
          <p className="text-lg md:text-xl mb-8 md:mb-10 text-red-100 font-light">Síguenos para estar al tanto del próximo evento o para conocer nuestra dirección y el horario de los entrenamientos.</p>
          <Link to="/entrenamientos" className="inline-block px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-2xl">
            Ver Calendario y Ubicación
          </Link>
        </div>
      </section>
    </div>
  );
}
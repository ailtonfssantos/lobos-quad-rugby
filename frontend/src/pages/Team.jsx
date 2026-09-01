import { useState, useEffect } from 'react';

export default function Team() {
  const [filter, setFilter] = useState('TODOS');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [staff, setStaff] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // FUNCIÓN BLINDADA: Define la prioridad jerárquica manejando valores nulos
  const getRolePriority = (role) => {
    if (!role) return 99; // Si no hay rol, lo trata como jugador/otro
    const r = role.toLowerCase();
    if (r.includes('presidente') && !r.includes('vice')) return 1;
    if (r.includes('vicepresidente')) return 2;
    if (r.includes('entrenador principal')) return 3;
    if (r.includes('capitán') || r.includes('capitan')) return 4;
    if (r.includes('2º entrenador') || r.includes('segundo entrenador')) return 5;
    if (r.includes('asistente') || r.includes('voluntari')) return 6;
    return 99;
  };

  // FUNCIÓN BLINDADA: Define el color del badge manejando valores nulos
  const getRoleColor = (role) => {
    if (!role) return 'bg-zinc-600';
    const r = role.toLowerCase();
    if (r.includes('presidente') || r.includes('vicepresidente')) return 'bg-purple-600';
    if (r.includes('entrenador') || r.includes('capitán') || r.includes('capitan')) return 'bg-yellow-600';
    if (r.includes('asistente') || r.includes('voluntari')) return 'bg-zinc-500';
    if (r.includes('ataque')) return 'bg-red-600';
    if (r.includes('defensa')) return 'bg-blue-600';
    return 'bg-zinc-600';
  };

  // Buscar datos del backend
  useEffect(() => {
    const fetchJogadores = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jogadores`);
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error('Datos inválidos recibidos:', data);
          return;
        }
        
        // Separar staff y jugadores usando la prioridad (ahora segura)
        const staffData = data.filter(j => getRolePriority(j.role) < 99);
        const playersData = data.filter(j => getRolePriority(j.role) === 99);
        
        // 1. ORDENAR STAFF POR JERARQUÍA
        const staffSorted = [...staffData].sort((a, b) => {
          return getRolePriority(a.role) - getRolePriority(b.role);
        });

        // 2. EMBARALHAR JOGADORES (Ordem aleatória)
        const playersShuffled = [...playersData].sort(() => Math.random() - 0.5);
        
        setStaff(staffSorted);
        setPlayers(playersShuffled);
      } catch (error) {
        console.error('Error al buscar jugadores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJogadores();
  }, []);

  const filteredPlayers = filter === 'TODOS' 
    ? players 
    : players.filter(p => p.role && p.role.toUpperCase() === filter);

  // Función para renderizar el card
  const renderCard = (person) => (
    <div
      key={person.id}
      onClick={() => setSelectedPerson(person)}
      className="group relative bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Área de la Foto */}
      <div className="relative h-80 bg-zinc-800 overflow-hidden">
        <img 
          src={person.image || '/assets/logo1.png'} 
          alt={person.name || 'Miembro'} 
          className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-t from-zinc-900 via-zinc-800 to-zinc-700">
          <span className="font-display text-6xl text-zinc-600">🐺</span>
        </div>
        
        {person.classification && (
          <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur border border-zinc-700 px-3 py-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Class</span>
            <span className="text-xl font-display text-red-500">{person.classification}</span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-6">
        <h3 className="font-display text-xl text-white group-hover:text-red-500 transition-colors leading-tight mb-2">
          {person.name || 'Sin nombre'}
        </h3>
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider">
          <span className={`w-2 h-2 rounded-full ${getRoleColor(person.role)}`}></span>
          {person.role || 'Sin rol'}
          {person.nationality && (
            <>
              <span className="text-zinc-700">•</span>
              {person.nationality}
            </>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Plantilla Oficial</p>
          <h1 className="font-display text-6xl md:text-8xl mb-6 text-white">LA MANADA</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Atletas, entrenadores y voluntarios que hacen posible este proyecto.
          </p>
        </div>
      </section>

      {/* Estado de Carga */}
      {loading ? (
        <div className="py-32 text-center">
          <div className="inline-block w-12 h-12 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 text-lg animate-pulse">Cargando la manada...</p>
        </div>
      ) : (
        <>
          {/* Sección 1: Cuerpo Técnico y Directiva (Ordenado jerárquicamente) */}
          <section className="py-16 bg-zinc-950 border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-[2px] w-12 bg-red-600"></div>
                <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wider">Cuerpo Técnico y Directiva</h2>
              </div>

              {staff.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {staff.map((person) => renderCard(person))}
                </div>
              ) : (
                <p className="text-zinc-600 text-center py-8">No hay miembros del cuerpo técnico registrados aún.</p>
              )}
            </div>
          </section>

          {/* Sección 2: Plantilla de Jugadores (Aleatorio) */}
          <section className="py-16 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-red-600"></div>
                  <h2 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wider">Plantilla de Jugadores</h2>
                </div>
                
                {/* Filtros */}
                <div className="flex flex-wrap gap-3">
                  {['TODOS', 'ATAQUE', 'DEFENSA'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setFilter(style)}
                      className={`px-6 py-2 text-sm font-bold tracking-wider transition-all duration-300 border ${
                        filter === style
                          ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                          : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPlayers.map((person) => renderCard(person))}
                </div>
              ) : (
                <p className="text-zinc-600 text-center py-8">No hay jugadores en esta categoría aún.</p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Modal de Detalles */}
      {selectedPerson && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPerson(null)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-zinc-800 flex items-center justify-center border-b border-zinc-800">
              <button
                onClick={() => setSelectedPerson(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors text-2xl z-10"
              >
                ✕
              </button>
              <img 
                src={selectedPerson.image || '/assets/logo1.png'} 
                alt={selectedPerson.name || 'Miembro'}
                className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-zinc-900 to-transparent z-10">
                <h2 className="font-display text-5xl text-white mb-1">{selectedPerson.name || 'Sin nombre'}</h2>
                <p className="text-red-500 font-bold tracking-widest uppercase text-sm">
                  {selectedPerson.role || 'Sin rol'} {selectedPerson.nationality && `• ${selectedPerson.nationality}`}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {selectedPerson.classification && (
                  <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Clasificación</p>
                    <p className="font-display text-4xl text-white">{selectedPerson.classification}</p>
                  </div>
                )}
                <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Posición / Rol</p>
                  <p className="font-bold text-lg text-white">{selectedPerson.role || 'Sin rol'}</p>
                </div>
                <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Nacionalidad</p>
                  <p className="font-bold text-lg text-white">{selectedPerson.nationality || '—'}</p>
                </div>
              </div>

              {selectedPerson.bio && (
                <div>
                  <h3 className="font-display text-2xl text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-red-600"></span>
                    Biografía
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-lg">{selectedPerson.bio}</p>
                </div>
              )}

              <button 
                onClick={() => setSelectedPerson(null)}
                className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest transition-colors border border-zinc-700"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Temporadas() {
  const [temporadas, setTemporadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    dataInicio: '',
    dataFim: '',
    saldoInicial: '',
    cuotaMensual: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchTemporadas = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/temporadas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemporadas(data);
      }
    } catch (error) {
      console.error('Error al cargar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemporadas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/temporadas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setModalOpen(false);
        setFormData({ nome: '', dataInicio: '', dataFim: '', saldoInicial: '', cuotaMensual: '' });
        fetchTemporadas();
      } else {
        alert('Error al crear la temporada');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleGenerarCuotas = async (temporadaId) => {
    if (!window.confirm('¿Estás seguro? Esto creará las cuotas mensuales para todos los jugadores activos de esta temporada.')) return;
    
    setGenerating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/cuotas/generar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ temporadaId })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ¡Éxito! ${data.message}`);
      } else {
        alert('Error al generar las cuotas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al generar cuotas');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-zinc-500 p-8">Cargando temporadas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Gestión de Temporadas</h1>
          <p className="text-zinc-500 text-sm">Configura las temporadas y genera las cuotas de los atletas automáticamente.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm"
        >
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" />
          Nueva Temporada
        </button>
      </div>

      {temporadas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500 mb-4">Aún no hay temporadas registradas.</p>
          <button onClick={() => setModalOpen(true)} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
            Crear Primera Temporada
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Temporada</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Fechas</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Cuota Mensual</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Saldo Inicial</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Estado</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {temporadas.map((temp) => (
                <tr key={temp.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-bold text-lg">{temp.nome}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-300 text-sm">
                      {new Date(temp.dataInicio).toLocaleDateString('es-ES')} - {new Date(temp.dataFim).toLocaleDateString('es-ES')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-green-500 font-bold">{temp.cuotaMensual.toFixed(2)} €</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-300">{temp.saldoInicial.toFixed(2)} €</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                      temp.estado === 'ACTIVA' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}>
                      {temp.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleGenerarCuotas(temp.id)}
                      disabled={generating}
                      className="flex items-center gap-2 ml-auto px-4 py-2 bg-blue-600/10 border border-blue-600/30 text-blue-400 text-xs font-bold uppercase tracking-wider hover:bg-blue-600/20 rounded-sm transition-colors disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" className="w-4 h-4" />
                          Generar Cuotas
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR TEMPORADA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">Nueva Temporada</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white">
                <Icon path="M6 18L18 6M6 6l12 12" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nombre de la Temporada *</label>
                <input 
                  type="text" 
                  value={formData.nome} 
                  onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                  required 
                  placeholder="Ej: Rugby 2026-2027"
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    value={formData.dataInicio} 
                    onChange={(e) => setFormData({...formData, dataInicio: e.target.value})} 
                    required 
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Fecha de Fin *</label>
                  <input 
                    type="date" 
                    value={formData.dataFim} 
                    onChange={(e) => setFormData({...formData, dataFim: e.target.value})} 
                    required 
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Saldo Inicial (€) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.saldoInicial} 
                    onChange={(e) => setFormData({...formData, saldoInicial: e.target.value})} 
                    required 
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Cuota Mensual por Atleta (€) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.cuotaMensual} 
                    onChange={(e) => setFormData({...formData, cuotaMensual: e.target.value})} 
                    required 
                    placeholder="50.00"
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">
                  Crear Temporada
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
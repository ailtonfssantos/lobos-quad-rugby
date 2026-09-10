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
  const [editingId, setEditingId] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    dataInicio: '',
    dataFim: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchTemporadas = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/temporadas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTemporadas(await res.json());
    } catch (error) {
      console.error('Error al cargar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemporadas(); }, []);

  const openModal = (temp = null) => {
    if (temp) {
      setEditingId(temp.id);
      setFormData({
        nome: temp.nome,
        dataInicio: temp.dataInicio.split('T')[0],
        dataFim: temp.dataFim.split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', dataInicio: '', dataFim: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingId ? `${API_URL}/api/temporadas/${editingId}` : `${API_URL}/api/temporadas`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setModalOpen(false);
        fetchTemporadas();
      } else {
        alert('Error al guardar la temporada');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('¿Archivar esta temporada? Pasará a estado FINALIZADA.')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/temporadas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: 'FINALIZADA' })
      });
      fetchTemporadas();
    } catch (error) {
      alert('Error al archivar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar permanentemente? Esta acción no se puede deshacer.')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/temporadas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTemporadas();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleGenerarCuotas = async (temporadaId) => {
    if (!window.confirm('¿Generar cuotas para todos los jugadores activos de esta temporada?')) return;
    setGenerating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/cuotas/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ temporadaId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ ¡Éxito! ${data.message}`);
      } else {
        alert('Error al generar las cuotas');
      }
    } catch (error) {
      alert('Error de conexión');
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
          <p className="text-zinc-500 text-sm">Configura las temporadas y genera las cuotas de los atletas.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Nueva Temporada
        </button>
      </div>

      {temporadas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500 mb-4">Aún no hay temporadas registradas.</p>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
            Crear Primera Temporada
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Temporada</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Fechas</th>
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
                    <span className={`inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                      temp.estado === 'ACTIVA' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}>
                      {temp.estado === 'ACTIVA' ? 'Activa' : 'Finalizada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón Generar Cuotas (Solo si está activa) */}
                      {temp.estado === 'ACTIVA' && (
                        <button 
                          onClick={() => handleGenerarCuotas(temp.id)}
                          disabled={generating}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-sm transition-colors"
                          title="Generar Cuotas"
                        >
                          <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Botón Editar */}
                      <button onClick={() => openModal(temp)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-sm transition-colors" title="Editar">
                        <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" className="w-4 h-4" />
                      </button>

                      {/* Botón Archivar (Solo si está activa) */}
                      {temp.estado === 'ACTIVA' && (
                        <button onClick={() => handleArchive(temp.id)} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-sm transition-colors" title="Archivar (Finalizar)">
                          <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botón Eliminar */}
                      <button onClick={() => handleDelete(temp.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Eliminar permanentemente">
                        <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR/EDITAR TEMPORADA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">{editingId ? 'Editar Temporada' : 'Nueva Temporada'}</h2>
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

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">
                  {editingId ? 'Guardar Cambios' : 'Crear Temporada'}
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
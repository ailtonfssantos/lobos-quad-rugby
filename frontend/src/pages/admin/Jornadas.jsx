import { useEffect, useState } from 'react';
import { getImageUrl } from '../../config'; 

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Jornadas() {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('activas');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Estado inicial actualizado con 'horario' y 'youtubeLink'
  const initialPartido = { rival: '', diaSemana: 'Sábado', horario: '', youtubeLink: '', status: 'PROGRAMADO', lobosScore: '', rivalScore: '' };

  const [formData, setFormData] = useState({
    numero: '', competicion: 'Liga Nacional 26/27', ciudad: '', pabellon: '', fechas: '', bannerUrl: '',
    partidos: [{ ...initialPartido }, { ...initialPartido }, { ...initialPartido }]
  });

  const fetchJornadas = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jornadas`, { headers: { 'Authorization': `Bearer ${token}` } });
      setJornadas(await res.json());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchJornadas(); }, []);

  const openModal = (jornada = null) => {
    if (jornada) {
      setEditingId(jornada.id);
      const partidosRellenos = [...jornada.partidos];
      while (partidosRellenos.length < 3) partidosRellenos.push({ ...initialPartido });
      
      setFormData({
        numero: jornada.numero, competicion: jornada.competicion, ciudad: jornada.ciudad,
        pabellon: jornada.pabellon, fechas: jornada.fechas, bannerUrl: jornada.bannerUrl || '',
        partidos: partidosRellenos.map(p => ({ ...p, lobosScore: p.lobosScore ?? '', rivalScore: p.rivalScore ?? '' }))
      });
    } else {
      setEditingId(null);
      setFormData({ numero: '', competicion: 'Liga Nacional 26/27', ciudad: '', pabellon: '', fechas: '', bannerUrl: '', partidos: [{ ...initialPartido }, { ...initialPartido }, { ...initialPartido }] });
    }
    setModalOpen(true);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploadingBanner(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formDataUpload
      });
      const data = await res.json();
      setFormData(prev => ({ ...prev, bannerUrl: data.url }));
    } catch (err) { alert('Error al subir el banner'); } finally { setUploadingBanner(false); }
  };

  const updatePartido = (index, field, value) => {
    const nuevosPartidos = [...formData.partidos];
    nuevosPartidos[index][field] = value;
    setFormData({ ...formData, partidos: nuevosPartidos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingId ? `${import.meta.env.VITE_API_URL}/api/jornadas/${editingId}` : `${import.meta.env.VITE_API_URL}/api/jornadas`;
    try {
      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      setModalOpen(false);
      fetchJornadas();
    } catch (error) { console.error(error); }
  };

  const toggleActiva = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/jornadas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchJornadas();
    } catch (error) { console.error(error); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/jornadas/${itemToDelete}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJornadas();
      setItemToDelete(null);
    } catch (error) { console.error(error); }
  };

  const displayedJornadas = activeTab === 'activas' ? jornadas.filter(j => j.isActive) : jornadas.filter(j => !j.isActive);

  if (loading) return <div className="text-zinc-500">Cargando jornadas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Gestión de Jornadas</h1>
          <p className="text-zinc-500 text-sm">Administre las jornadas, banners, horarios y enlaces de transmisión.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Nueva Jornada
        </button>
      </div>

      <div className="flex border-b border-zinc-800">
        <button onClick={() => setActiveTab('activas')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'activas' ? 'border-red-600 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Jornadas Activas</button>
        <button onClick={() => setActiveTab('historico')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'historico' ? 'border-red-600 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Histórico</button>
      </div>

      {displayedJornadas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500 mb-4">{activeTab === 'activas' ? 'Aún no hay jornadas activas.' : 'No hay jornadas en el histórico.'}</p>
          {activeTab === 'activas' && <button onClick={() => openModal()} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">Crear Primera Jornada</button>}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Jornada</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Ubicación</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Fechas</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Partidos</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedJornadas.map((j) => (
                <tr key={j.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-bold text-lg">Jornada {j.numero}</p>
                    <p className="text-zinc-500 text-xs uppercase">{j.competicion}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-300 text-sm">{j.ciudad}</p>
                    <p className="text-zinc-500 text-xs">{j.pabellon}</p>
                  </td>
                  <td className="px-6 py-4"><span className="text-zinc-300 text-sm">{j.fechas}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {j.partidos.map((p, idx) => (
                        <span key={idx} className="text-xs text-zinc-400">
                          {p.diaSemana} {p.horario && <span className="text-zinc-300">({p.horario})</span>}: <span className="text-white">{p.rival}</span> 
                          {p.status === 'FINALIZADO' && <span className="text-green-500 ml-1">({p.lobosScore}-{p.rivalScore})</span>}
                          {p.youtubeLink && <span className="text-red-500 ml-1">🔴 En vivo</span>}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(j)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors" title="Editar">
                        <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </button>
                      <button onClick={() => toggleActiva(j.id, j.isActive)} className={`p-2 rounded-sm transition-colors ${j.isActive ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'}`} title={j.isActive ? 'Archivar' : 'Reactivar'}>
                        <Icon path={j.isActive ? 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' : 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'} />
                      </button>
                      <button onClick={() => setItemToDelete(j.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Eliminar">
                        <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-3xl w-full my-8 shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <h2 className="font-display text-2xl text-white">{editingId ? 'Editar Jornada' : 'Nueva Jornada'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white"><Icon path="M6 18L18 6M6 6l12 12" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Número de Jornada *</label>
                  <input type="number" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Competición *</label>
                  <select value={formData.competicion} onChange={(e) => setFormData({...formData, competicion: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none">
                    <option>Liga Nacional 26/27</option>
                    <option>Autonómico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Ciudad *</label>
                  <input type="text" value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Pabellón *</label>
                  <input type="text" value={formData.pabellon} onChange={(e) => setFormData({...formData, pabellon: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Fechas (Ej: 17 y 18 de Octubre) *</label>
                  <input type="text" value={formData.fechas} onChange={(e) => setFormData({...formData, fechas: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Banner Promocional</label>
                  <div className="flex items-center gap-4">
                    {formData.bannerUrl && <img src={getImageUrl(formData.bannerUrl)} alt="Banner" className="h-16 w-auto border border-zinc-700 rounded-sm" />}
                    <label className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 cursor-pointer rounded-sm text-sm">
                      {uploadingBanner ? 'Subiendo...' : 'Elegir Imagen'}
                      <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h3 className="font-display text-lg text-white mb-4">Partidos de la Jornada</h3>
                <div className="space-y-4">
                  {formData.partidos.map((p, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Partido {idx + 1} <span className="text-zinc-700">(Dejar Rival vacío si no se juega)</span></p>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        <input type="text" placeholder="Rival (Ej: Adapta)" value={p.rival} onChange={(e) => updatePartido(idx, 'rival', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none focus:border-red-600 md:col-span-2" />
                        <select value={p.diaSemana} onChange={(e) => updatePartido(idx, 'diaSemana', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none">
                          <option>Sábado</option><option>Domingo</option>
                        </select>
                        <input type="text" placeholder="Hora (Ej: 10:00)" value={p.horario} onChange={(e) => updatePartido(idx, 'horario', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none focus:border-red-600" />
                        <select value={p.status} onChange={(e) => updatePartido(idx, 'status', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none">
                          <option value="PROGRAMADO">Programado</option>
                          <option value="FINALIZADO">Finalizado</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="Enlace de YouTube (Opcional: https://youtube.com/...)" value={p.youtubeLink} onChange={(e) => updatePartido(idx, 'youtubeLink', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none focus:border-red-600" />
                      </div>
                      {p.status === 'FINALIZADO' && (
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Puntos Lobos" value={p.lobosScore} onChange={(e) => updatePartido(idx, 'lobosScore', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none" />
                          <input type="number" placeholder="Puntos Rival" value={p.rivalScore} onChange={(e) => updatePartido(idx, 'rivalScore', e.target.value)} className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2 rounded-sm text-sm outline-none" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">{editingId ? 'Guardar Cambios' : 'Crear Jornada'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-zinc-400 text-sm mb-6">¿Está seguro? Se eliminarán también todos los partidos de esta jornada.</p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase text-sm rounded-sm">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-sm rounded-sm">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
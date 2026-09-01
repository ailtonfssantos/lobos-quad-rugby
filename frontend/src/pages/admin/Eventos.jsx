import { useEffect, useState } from 'react';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [inscricoesModal, setInscricoesModal] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('activos');
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    type: 'PUERTAS ABIERTAS', name: '', date: '', month: '', day: 'Sábado',
    time: '', location: 'Pabellón Playa Malvarrosa', description: '', isPublic: true
  });

  const fetchEventos = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/eventos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEventos(await response.json());
    } catch (error) { console.error('Error al buscar eventos:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEventos(); }, []);

  const openModal = (evento = null) => {
    if (evento) {
      setEditingId(evento.id);
      setFormData({
        type: evento.type || 'PUERTAS ABIERTAS', name: evento.name || '', date: evento.date || '',
        month: evento.month || '', day: evento.day || 'Sábado', time: evento.time || '',
        location: evento.location || 'Pabellón Playa Malvarrosa', description: evento.description || '',
        isPublic: evento.isPublic !== undefined ? evento.isPublic : true
      });
    } else {
      setEditingId(null);
      setFormData({ type: 'PUERTAS ABIERTAS', name: '', date: '', month: '', day: 'Sábado', time: '', location: 'Pabellón Playa Malvarrosa', description: '', isPublic: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingId ? `${import.meta.env.VITE_API_URL}/api/eventos/${editingId}` : `${import.meta.env.VITE_API_URL}/api/eventos`;
    try {
      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      closeModal();
      fetchEventos();
    } catch (error) { console.error('Error al guardar:', error); }
  };

  const toggleActivo = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchEventos();
    } catch (error) { console.error('Error al actualizar:', error); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/eventos/${itemToDelete}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEventos();
      setItemToDelete(null);
    } catch (error) { console.error('Error al eliminar:', error); }
  };

  const verInscricoes = async (evento) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes-eventos/evento/${evento.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInscricoes(await response.json());
      setInscricoesModal(evento);
    } catch (error) { console.error('Error al buscar inscripciones:', error); }
  };

  const getTypeStyle = (type) => {
    if (type === 'PUERTAS ABIERTAS') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (type === 'CLINICA') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (type === 'EVENTO SOCIAL') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  const displayedEventos = activeTab === 'activos' 
    ? eventos.filter(e => e.isActive) 
    : eventos.filter(e => !e.isActive);

  if (loading) return <div className="text-zinc-500">Cargando eventos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Gestión de Eventos</h1>
          <p className="text-zinc-500 text-sm">Gestione puertas abiertas, clínicas y eventos especiales.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Nuevo Evento
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-zinc-800">
        <button onClick={() => setActiveTab('activos')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'activos' ? 'border-red-600 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Eventos Activos</button>
        <button onClick={() => setActiveTab('historico')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'historico' ? 'border-red-600 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Histórico</button>
      </div>

      {displayedEventos.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500 mb-4">{activeTab === 'activos' ? 'Aún no hay eventos activos.' : 'No hay eventos en el histórico.'}</p>
          {activeTab === 'activos' && <button onClick={() => openModal()} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">Crear Primer Evento</button>}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Fecha</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Evento</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Tipo</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Acceso</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Inscritos</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedEventos.map((ev) => (
                <tr key={ev.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-display text-2xl leading-none">{ev.date}</p>
                    <p className="text-red-500 text-[10px] uppercase tracking-widest mt-1">{ev.month} · {ev.day}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{ev.name}</p>
                    <p className="text-zinc-500 text-xs mt-1">{ev.time} · {ev.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getTypeStyle(ev.type)}`}>{ev.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${ev.isPublic ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                      {ev.isPublic ? 'Público' : 'Interno'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ev.isPublic ? (
                      <button onClick={() => verInscricoes(ev)} className="text-blue-500 hover:text-blue-400 text-sm font-bold transition-colors">Ver lista</button>
                    ) : <span className="text-zinc-600 text-sm">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón EDITAR */}
                      <button onClick={() => openModal(ev)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors" title="Editar">
                        <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </button>
                      
                      {/* Botón ARCHIVAR/REACTIVAR */}
                      <button 
                        onClick={() => toggleActivo(ev.id, ev.isActive)} 
                        className={`p-2 rounded-sm transition-colors ${ev.isActive ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'}`} 
                        title={ev.isActive ? 'Archivar (mover al histórico)' : 'Reactivar (volver a eventos activos)'}
                      >
                        <Icon path={ev.isActive ? 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' : 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'} />
                      </button>
                      
                      {/* Botón ELIMINAR */}
                      <button 
                        onClick={() => setItemToDelete(ev.id)} 
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" 
                        title="Eliminar permanentemente"
                      >
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

      {/* MODAL CREAR/EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white"><Icon path="M6 18L18 6M6 6l12 12" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Tipo de Evento *</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none">
                  <option value="PUERTAS ABIERTAS">Puertas Abiertas</option>
                  <option value="CLINICA">Clínica de Rugby</option>
                  <option value="EVENTO SOCIAL">Evento Social</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nombre del Evento *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Día *</label><input type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" /></div>
                <div><label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Mes *</label><input type="text" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" /></div>
                <div className="col-span-2"><label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Día de la Semana *</label><select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"><option>Sábado</option><option>Domingo</option><option>Viernes</option><option>Jueves</option></select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Horario *</label><input type="text" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" /></div>
                <div><label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Ubicación *</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" /></div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none resize-none" />
              </div>
              <div className="bg-zinc-950 border border-zinc-700 p-4 rounded-sm">
                <div className="flex items-center justify-between">
                  <div><p className="text-white font-bold text-sm">¿Abierto al público?</p><p className="text-zinc-500 text-xs mt-1">Si está activado, los visitantes podrán inscribirse desde la web.</p></div>
                  <button type="button" onClick={() => setFormData({...formData, isPublic: !formData.isPublic})} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${formData.isPublic ? 'bg-green-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.isPublic ? 'left-7' : 'left-0.5'}`}></span>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">{editingId ? 'Guardar Cambios' : 'Crear Evento'}</button>
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSCRITOS */}
      {inscricoesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div><h2 className="font-display text-2xl text-white">Inscritos</h2><p className="text-zinc-500 text-sm mt-1">{inscricoesModal.name} · {inscricoes.length} inscrito(s)</p></div>
              <button onClick={() => setInscricoesModal(null)} className="text-zinc-500 hover:text-white"><Icon path="M6 18L18 6M6 6l12 12" /></button>
            </div>
            <div className="p-6">
              {inscricoes.length === 0 ? <p className="text-zinc-500 text-center py-8">Aún no hay inscritos para este evento.</p> : (
                <table className="w-full text-left">
                  <thead className="border-b border-zinc-800"><tr><th className="pb-3 text-zinc-500 text-xs uppercase tracking-wider">Nombre</th><th className="pb-3 text-zinc-500 text-xs uppercase tracking-wider">Email</th><th className="pb-3 text-zinc-500 text-xs uppercase tracking-wider">Teléfono</th><th className="pb-3 text-zinc-500 text-xs uppercase tracking-wider">Fecha</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {inscricoes.map((insc) => (
                      <tr key={insc.id}>
                        <td className="py-3 text-white font-medium">{insc.fullName}</td>
                        <td className="py-3 text-zinc-400 text-sm">{insc.email}</td>
                        <td className="py-3 text-zinc-400 text-sm">{insc.phone || '—'}</td>
                        <td className="py-3 text-zinc-500 text-xs">{new Date(insc.createdAt).toLocaleDateString('es-ES')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-zinc-400 text-sm mb-6">¿Está seguro? Se eliminará permanentemente de la base de datos.</p>
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
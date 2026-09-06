import { useEffect, useState } from 'react';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Formatação de moeda es-ES
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const calculateYearlySummaries = (subvenciones) => {
  const summaries = {};
  subvenciones.forEach(sub => {
    const year = sub.ano;
    if (!summaries[year]) summaries[year] = { count: 0, total: 0 };
    summaries[year].count += 1;
    const numericValue = parseFloat(String(sub.valor).replace(/\./g, '').replace(',', '.'));
    if (!isNaN(numericValue)) summaries[year].total += numericValue;
  });

  return Object.keys(summaries).sort((a, b) => b - a).map(year => ({
    year,
    count: summaries[year].count,
    total: formatCurrency(summaries[year].total)
  }));
};

export default function Patrocinadores() {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [subvenciones, setSubvenciones] = useState([]);
  const [modalSubvencionOpen, setModalSubvencionOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [formDataSub, setFormDataSub] = useState({
    ano: '', valor: '', entidad: '', fechaConcesion: '', tipo: 'Administración',
    ambito: 'Local', departamento: '', convocatoria: '', basesLink: ''
  });
  
  // Estado unificado para deletar (solicitud ou subvencion)
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'solicitud' | 'subvencion', id: number }

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    fetch(`${API_URL}/api/patrocinadores`, { headers }).then(res => res.json()).then(data => setSolicitudes(data)).catch(console.error);
    fetch(`${API_URL}/api/subvenciones`, { headers }).then(res => res.json()).then(data => setSubvenciones(data)).catch(console.error);
  }, []);

  const verSolicitud = async (sol) => {
    setSelectedSolicitud(sol);
    if (sol.status === 'PENDIENTE') {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/patrocinadores/${sol.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'VISTO' })
      });
      setSolicitudes(prev => prev.map(s => s.id === sol.id ? { ...s, status: 'VISTO' } : s));
    }
  };

  const archivarSolicitud = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/patrocinadores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: 'ARCHIVADO' })
    });
    setSolicitudes(prev => prev.filter(s => s.id !== id)); // Remove da vista atual
  };

  const guardarSubvencion = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingSubId ? `${API_URL}/api/subvenciones/${editingSubId}` : `${API_URL}/api/subvenciones`;
    try {
      await fetch(url, {
        method: editingSubId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formDataSub)
      });
      setModalSubvencionOpen(false);
      setEditingSubId(null);
      const res = await fetch(`${API_URL}/api/subvenciones`, { headers: { 'Authorization': `Bearer ${token}` } });
      setSubvenciones(await res.json());
    } catch (error) { alert('Error al guardar'); }
  };

  const confirmarDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem('token');
    const endpoint = deleteTarget.type === 'solicitud' ? 'patrocinadores' : 'subvenciones';
    
    try {
      await fetch(`${API_URL}/api/${endpoint}/${deleteTarget.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (deleteTarget.type === 'solicitud') {
        setSolicitudes(prev => prev.filter(s => s.id !== deleteTarget.id));
      } else {
        const res = await fetch(`${API_URL}/api/subvenciones`, { headers: { 'Authorization': `Bearer ${token}` } });
        setSubvenciones(await res.json());
      }
      setDeleteTarget(null);
    } catch (error) { console.error('Error al eliminar:', error); }
  };

  const getStatusColor = (status) => {
    if (status === 'PENDIENTE') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (status === 'VISTO') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (status === 'ARCHIVADO') return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    if (status === 'APROBADO') return 'bg-green-500/10 text-green-500 border-green-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  const yearlySummaries = calculateYearlySummaries(subvenciones);
  // Filtra solicitações arquivadas da vista principal
  const solicitudesVisibles = solicitudes.filter(s => s.status !== 'ARCHIVADO');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Patrocinios y Transparencia</h1>
          <p className="text-zinc-500 text-sm">Gestione solicitudes de empresas y ayudas públicas.</p>
        </div>
      </div>

      <div className="flex border-b border-zinc-800">
        <button onClick={() => setActiveTab('solicitudes')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'solicitudes' ? 'border-red-600 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
          Solicitudes ({solicitudesVisibles.filter(s => s.status === 'PENDIENTE').length} pendientes)
        </button>
        <button onClick={() => setActiveTab('transparencia')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'transparencia' ? 'border-red-600 text-red-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
          Transparencia (Subvenciones)
        </button>
      </div>

      {/* ================= ABA 1: SOLICITUDES ================= */}
      {activeTab === 'solicitudes' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Empresa</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Contacto</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Modalidad</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Estado</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {solicitudesVisibles.map((sol) => (
                <tr key={sol.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4"><p className="text-white font-medium">{sol.companyName}</p></td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-300 text-sm">{sol.contactName}</p>
                    <p className="text-zinc-500 text-xs">{sol.email}</p>
                  </td>
                  <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">{sol.sponsorshipType}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(sol.status)}`}>
                      {sol.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => verSolicitud(sol)} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-zinc-700 transition-colors">Ver</button>
                      
                      {sol.status !== 'ARCHIVADO' && (
                        <button onClick={() => archivarSolicitud(sol.id)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-sm transition-colors" title="Archivar">
                          <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </button>
                      )}
                      
                      <button onClick={() => setDeleteTarget({ type: 'solicitud', id: sol.id })} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Eliminar permanentemente">
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

      {/* ================= ABA 2: TRANSPARENCIA ================= */}
      {activeTab === 'transparencia' && (
        <>
          {yearlySummaries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {yearlySummaries.map((summary) => (
                <div key={summary.year} className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm">
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Resumen {summary.year}</p>
                  <p className="font-display text-3xl text-green-500 mb-1">{summary.total}€</p>
                  <p className="text-zinc-400 text-sm">{summary.count} {summary.count === 1 ? 'subvención registrada' : 'subvenciones registradas'}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => { setEditingSubId(null); setFormDataSub({ ano: '', valor: '', entidad: '', fechaConcesion: '', tipo: 'Administración', ambito: 'Local', departamento: '', convocatoria: '', basesLink: '' }); setModalSubvencionOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
              <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Nueva Subvención
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Año</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Entidad</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Valor</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Tipo / Ámbito</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {subvenciones.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4"><p className="text-white font-bold text-lg">{sub.ano}</p></td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{sub.entidad}</p>
                      <p className="text-zinc-500 text-xs">{sub.departamento}</p>
                    </td>
                    <td className="px-6 py-4"><p className="text-green-500 font-bold text-lg">{sub.valor}€</p></td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 text-sm">{sub.tipo}</p>
                      <p className="text-zinc-500 text-xs">{sub.ambito}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingSubId(sub.id); setFormDataSub(sub); setModalSubvencionOpen(true); }} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"><Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></button>
                        <button onClick={() => setDeleteTarget({ type: 'subvencion', id: sub.id })} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors"><Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL: VER SOLICITUD */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSolicitud(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-white mb-4">Mensaje de {selectedSolicitud.companyName}</h3>
            <div className="space-y-3 text-sm text-zinc-300 mb-6">
              <p><span className="text-zinc-500">Contacto:</span> {selectedSolicitud.contactName} ({selectedSolicitud.email})</p>
              <p><span className="text-zinc-500">Teléfono:</span> {selectedSolicitud.phone || 'No proporcionado'}</p>
              <p><span className="text-zinc-500">Modalidad:</span> {selectedSolicitud.sponsorshipType}</p>
              <div className="bg-zinc-950 p-4 rounded-sm border border-zinc-800 mt-4">
                <p className="text-zinc-400 italic">"{selectedSolicitud.message || 'Sin mensaje adicional'}"</p>
              </div>
            </div>
            <button onClick={() => setSelectedSolicitud(null)} className="w-full py-3 bg-zinc-800 text-white font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-zinc-700">Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL: CREAR/EDITAR SUBVENCIÓN */}
      {modalSubvencionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-3xl w-full my-8 shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">{editingSubId ? 'Editar Subvención' : 'Nueva Subvención'}</h2>
              <button onClick={() => setModalSubvencionOpen(false)} className="text-zinc-500 hover:text-white"><Icon path="M6 18L18 6M6 6l12 12" /></button>
            </div>
            <form onSubmit={guardarSubvencion} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="number" placeholder="Año *" value={formDataSub.ano} onChange={e => setFormDataSub({...formDataSub, ano: e.target.value})} required className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                <input type="text" placeholder="Valor (Ej: 6.500,00) *" value={formDataSub.valor} onChange={e => setFormDataSub({...formDataSub, valor: e.target.value})} required className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                <input type="text" placeholder="Fecha Concesión *" value={formDataSub.fechaConcesion} onChange={e => setFormDataSub({...formDataSub, fechaConcesion: e.target.value})} required className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
              </div>
              <input type="text" placeholder="Entidad Concedente *" value={formDataSub.entidad} onChange={e => setFormDataSub({...formDataSub, entidad: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={formDataSub.tipo} onChange={e => setFormDataSub({...formDataSub, tipo: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none">
                  <option>Administración</option><option>Fundación</option><option>Privada</option>
                </select>
                <select value={formDataSub.ambito} onChange={e => setFormDataSub({...formDataSub, ambito: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none">
                  <option>Local</option><option>Regional</option><option>Nacional</option><option>Europeo</option>
                </select>
                <input type="text" placeholder="Departamento" value={formDataSub.departamento} onChange={e => setFormDataSub({...formDataSub, departamento: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
              </div>
              <textarea placeholder="Descripción de la Convocatoria..." value={formDataSub.convocatoria} onChange={e => setFormDataSub({...formDataSub, convocatoria: e.target.value})} rows={3} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none resize-none" />
              <input type="url" placeholder="Enlace Bases Reguladoras (https://...)" value={formDataSub.basesLink} onChange={e => setFormDataSub({...formDataSub, basesLink: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">Guardar</button>
                <button type="button" onClick={() => setModalSubvencionOpen(false)} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN (UNIFICADO) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-zinc-400 text-sm mb-6">
              ¿Está seguro de que desea eliminar permanentemente este {deleteTarget.type === 'solicitud' ? 'mensaje de solicitud' : 'registro de subvención'}? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase text-sm rounded-sm hover:bg-zinc-700">Cancelar</button>
              <button onClick={confirmarDelete} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-sm rounded-sm hover:bg-red-700">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
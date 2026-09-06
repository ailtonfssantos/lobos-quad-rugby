import { useEffect, useState } from 'react';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Patrocinadores() {
  const [patrocinios, setPatrocinios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Estados para o Modal de Criar/Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    sponsorshipType: 'Subvención', message: '', status: 'APROBADO',
    ano: '', valor: '', dataConcessao: '', tipoEntidad: 'Administración',
    ambito: 'Local', departamento: '', convocatoria: '', basesLink: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPatrocinios = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/patrocinadores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPatrocinios(await response.json());
    } catch (error) {
      console.error('Error al buscar patrocinios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatrocinios(); }, []);

  const openModal = (pat = null) => {
    if (pat) {
      setEditingId(pat.id);
      setFormData({
        companyName: pat.companyName || '', contactName: pat.contactName || '',
        email: pat.email || '', phone: pat.phone || '',
        sponsorshipType: pat.sponsorshipType || 'Subvención',
        message: pat.message || '', status: pat.status || 'APROBADO',
        ano: pat.ano || '', valor: pat.valor || '', dataConcessao: pat.dataConcessao || '',
        tipoEntidad: pat.tipoEntidad || 'Administración', ambito: pat.ambito || 'Local',
        departamento: pat.departamento || '', convocatoria: pat.convocatoria || '',
        basesLink: pat.basesLink || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        companyName: '', contactName: '', email: '', phone: '',
        sponsorshipType: 'Subvención', message: '', status: 'APROBADO',
        ano: '', valor: '', dataConcessao: '', tipoEntidad: 'Administración',
        ambito: 'Local', departamento: '', convocatoria: '', basesLink: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingId ? `${API_URL}/api/patrocinadores/${editingId}` : `${API_URL}/api/patrocinadores`;
    try {
      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      setModalOpen(false);
      fetchPatrocinios();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudo guardar.');
    }
  };

  const actualizarEstado = async (id, estado) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/patrocinadores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: estado })
      });
      fetchPatrocinios();
    } catch (error) { console.error('Error al actualizar:', error); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/patrocinadores/${itemToDelete}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPatrocinios();
      setItemToDelete(null);
    } catch (error) { console.error('Error al eliminar:', error); }
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'RECHAZADO': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  if (loading) return <div className="text-zinc-500">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Patrocinios y Subvenciones</h1>
          <p className="text-zinc-500 text-sm">Gestione patrocinadores comerciales y ayudas públicas.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm">
            <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Nuevo Registro
          </button>
        </div>
      </div>
      
      {patrocinios.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500">Aún no hay registros.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Entidad / Empresa</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Tipo</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Valor / Modalidad</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Estado</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {patrocinios.map((pat) => (
                <tr key={pat.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{pat.companyName}</p>
                    {pat.ano && <p className="text-zinc-500 text-xs">Año: {pat.ano}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                      {pat.tipoEntidad || pat.sponsorshipType || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {pat.valor ? <p className="text-green-500 font-bold">{pat.valor}€</p> : <p className="text-zinc-400 text-sm">{pat.sponsorshipType}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getEstadoStyle(pat.status)}`}>
                      {pat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(pat)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors" title="Editar">
                        <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </button>
                      <button onClick={() => setItemToDelete(pat.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Eliminar">
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

      {/* MODAL DE CREAR/EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-3xl w-full my-8 shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
              <h2 className="font-display text-2xl text-white">{editingId ? 'Editar Registro' : 'Nuevo Registro'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white"><Icon path="M6 18L18 6M6 6l12 12" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Datos Generales */}
              <div>
                <h3 className="text-red-500 text-xs uppercase tracking-widest font-bold mb-4">Datos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre de la Entidad / Empresa *" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} required className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                  <select value={formData.sponsorshipType} onChange={(e) => setFormData({...formData, sponsorshipType: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none">
                    <option value="Subvención">Subvención / Ayuda Pública</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Colabora">Colabora</option>
                  </select>
                </div>
              </div>

              {/* Datos de Subvención (Opcionais) */}
              <div className="border-t border-zinc-800 pt-5">
                <h3 className="text-blue-500 text-xs uppercase tracking-widest font-bold mb-4">Datos de Subvención (Opcional, rellenar si aplica)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input type="number" placeholder="Año (Ej: 2025)" value={formData.ano} onChange={(e) => setFormData({...formData, ano: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none" />
                  <input type="text" placeholder="Valor (Ej: 6.500,00)" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none" />
                  <input type="text" placeholder="Fecha Concesión (Ej: 25/03/2025)" value={formData.dataConcessao} onChange={(e) => setFormData({...formData, dataConcessao: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select value={formData.tipoEntidad} onChange={(e) => setFormData({...formData, tipoEntidad: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none">
                    <option value="">Tipo de Entidad...</option>
                    <option value="Administración">Administración</option>
                    <option value="Fundación">Fundación</option>
                    <option value="Privada">Privada</option>
                  </select>
                  <select value={formData.ambito} onChange={(e) => setFormData({...formData, ambito: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none">
                    <option value="">Ámbito...</option>
                    <option value="Local">Local</option>
                    <option value="Regional">Regional</option>
                    <option value="Nacional">Nacional</option>
                  </select>
                  <input type="text" placeholder="Departamento (Ej: Valencia)" value={formData.departamento} onChange={(e) => setFormData({...formData, departamento: e.target.value})} className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none" />
                </div>
                <textarea placeholder="Descripción de la Convocatoria..." value={formData.convocatoria} onChange={(e) => setFormData({...formData, convocatoria: e.target.value})} rows={3} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none resize-none mb-4" />
                <input type="url" placeholder="Enlace a Bases Reguladoras (https://...)" value={formData.basesLink} onChange={(e) => setFormData({...formData, basesLink: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-blue-600 outline-none" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">{editingId ? 'Guardar Cambios' : 'Crear Registro'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINAR */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-zinc-400 text-sm mb-6">¿Está seguro?</p>
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
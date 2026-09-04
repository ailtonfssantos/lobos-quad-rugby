import { useEffect, useState } from 'react';
import { getImageUrl } from '../../config';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('activos');
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Ataque',
    classification: '',
    nationality: 'España',
    image: '',
    bio: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchJugadores = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jogadores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setJugadores(data);
    } catch (error) {
      console.error('Error al buscar jugadores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  const openModal = (jugador = null) => {
    if (jugador) {
      setEditingId(jugador.id);
      setFormData({
        name: jugador.name || '',
        role: jugador.role || 'Ataque',
        classification: jugador.classification || '',
        nationality: jugador.nationality || 'España',
        image: jugador.image || '',
        bio: jugador.bio || ''
      });
      setSelectedFile(null);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        role: 'Ataque',
        classification: '',
        nationality: 'España',
        image: '',
        bio: ''
      });
      setSelectedFile(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingId 
      ? `${import.meta.env.VITE_API_URL}/api/jogadores/${editingId}`
      : `${import.meta.env.VITE_API_URL}/api/jogadores`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al guardar los datos');

      closeModal();
      fetchJugadores();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los datos. Intente nuevamente.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Por favor, seleccione solo imágenes (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe tener un máximo de 5MB');
      return;
    }

    setSelectedFile(file);

    const token = localStorage.getItem('token');
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en la subida');

      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error('Error en la subida:', error);
      alert('Error al subir la imagen: ' + error.message);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibilidad = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    const nuevoStatus = !currentStatus;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jogadores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: nuevoStatus })
      });
      
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      fetchJugadores();
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      alert('Error al actualizar. Verifique la consola del navegador.');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jogadores/${itemToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Fallo en la eliminación');
      
      fetchJugadores();
      setItemToDelete(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar permanentemente.');
    }
  };

  // FUNCIÓN BLINDADA CONTRA VALORES UNDEFINED
  const getRoleColor = (role) => {
    if (!role) return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    const r = role.toLowerCase();
    if (r.includes('presidente') || r.includes('vicepresidente')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (r.includes('entrenador') || r.includes('capitán') || r.includes('capitan')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (r.includes('voluntari') || r.includes('asistente') || r.includes('fisio') || r.includes('preparador')) return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    if (r.includes('ataque')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (r.includes('defensa')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  const displayedJugadores = activeTab === 'activos' 
    ? jugadores.filter(j => j.isActive) 
    : jugadores.filter(j => !j.isActive);

  if (loading) return <div className="text-zinc-500">Cargando miembros del equipo...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Gestión del Equipo</h1>
          <p className="text-zinc-500 text-sm">Gestione la plantilla, cuerpo técnico y directiva del club.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm"
        >
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" />
          Nuevo Miembro
        </button>
      </div>

      {/* Stats Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total en Base de Datos</p>
          <p className="font-display text-3xl text-white">{jugadores.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Equipo Activo</p>
          <p className="font-display text-3xl text-green-500">{jugadores.filter(j => j.isActive).length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Histórico</p>
          <p className="font-display text-3xl text-zinc-500">{jugadores.filter(j => !j.isActive).length}</p>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('activos')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'activos' 
              ? 'border-red-600 text-red-500' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Equipo Activo
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'historico' 
              ? 'border-red-600 text-red-500' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Histórico (Ex-Miembros)
        </button>
      </div>
      
      {displayedJugadores.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <Icon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 mb-4">
            {activeTab === 'activos' ? 'Aún no hay miembros activos registrados.' : 'Aún no hay miembros en el histórico.'}
          </p>
          {activeTab === 'activos' && (
            <button 
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm"
            >
              Registrar Primer Miembro
            </button>
          )}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Miembro</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Función</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Clasif.</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Nacionalidad</th>
                  {activeTab === 'historico' && (
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Acción para Retornar</th>
                  )}
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {displayedJugadores.map((jog) => (
                  <tr key={jog.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-sm flex items-center justify-center text-zinc-500 overflow-hidden">
                          {jog.image ? (
                            <img src={getImageUrl(jug.image)} alt={jug.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold">
                              {jog.name ? jog.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium">{jog.name || 'Sin nombre'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(jog.role)}`}>
                        {jog.role || 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300 font-medium">{jog.classification || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 text-sm">{jog.nationality || '—'}</span>
                    </td>
                    
                    {activeTab === 'historico' && (
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleVisibilidad(jog.id, jog.isActive)} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-900 text-green-500 text-xs font-bold uppercase tracking-wider hover:bg-green-900/50 rounded-sm transition-colors"
                        >
                          <Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-4 h-4" />
                          Mostrar en el Sitio
                        </button>
                      </td>
                    )}

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(jog)} 
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors" 
                          title="Editar datos"
                        >
                          <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </button>
                        
                        {activeTab === 'activos' && (
                          <button 
                            onClick={() => toggleVisibilidad(jog.id, jog.isActive)} 
                            className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-sm transition-colors" 
                            title="Ocultar del sitio (enviar al histórico)"
                          >
                            <Icon path="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => setItemToDelete(jog.id)} 
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
        </div>
      )}

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">
                {editingId ? 'Editar Miembro' : 'Nuevo Miembro'}
              </h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                <Icon path="M6 18L18 6M6 6l12 12" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Rol / Posición *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm"
                  >
                    <optgroup label="Directiva">
                      <option value="Presidente">Presidente</option>
                      <option value="Vicepresidente">Vicepresidente</option>
                      <option value="Presidente y Capitán">Presidente y Capitán</option>
                      <option value="Vicepresidente y Capitán">Vicepresidente y Capitán</option>
                    </optgroup>
                    <optgroup label="Cuerpo Técnico">
                      <option value="Entrenador Principal">Entrenador Principal</option>
                      <option value="2º Entrenador">2º Entrenador</option>
                      <option value="Capitán">Capitán</option>
                      <option value="Capitán y 2º Entrenador">Capitán y 2º Entrenador</option>
                      <option value="Entrenador Principal y Voluntario">Entrenador Principal y Voluntario</option>
                    </optgroup>
                    <optgroup label="Apoyo y Staff">
                      <option value="Asistente / Voluntario">Asistente / Voluntario</option>
                      <option value="Asistente / Voluntaria">Asistente / Voluntaria</option>
                      <option value="Fisioterapeuta">Fisioterapeuta</option>
                      <option value="Preparador Físico">Preparador Físico</option>
                      <option value="Delegado">Delegado</option>
                    </optgroup>
                    <optgroup label="Jugadores">
                      <option value="Ataque">Jugador/a de Ataque</option>
                      <option value="Defensa">Jugador/a de Defensa</option>
                    </optgroup>
                    <optgroup label="Otro">
                      <option value="Otro">Otro (Especificar en nombre o bio)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Clasificación</label>
                  <input
                    type="text"
                    value={formData.classification}
                    onChange={(e) => setFormData({...formData, classification: e.target.value})}
                    placeholder="Ej: 2.5"
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nacionalidad *</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Foto del Miembro</label>
                
                <div className="mb-3">
                  {formData.image ? (
                    <div className="relative w-32 h-32 bg-zinc-950 border border-zinc-700 rounded-sm overflow-hidden">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFormData({...formData, image: ''}); setSelectedFile(null); }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-sm transition-colors"
                        title="Eliminar imagen"
                      >
                        <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-zinc-950 border border-dashed border-zinc-700 rounded-sm flex items-center justify-center">
                      <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="w-10 h-10 text-zinc-700" />
                    </div>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 hover:text-white cursor-pointer transition-colors rounded-sm">
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-700 border-t-red-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Icon path="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" className="w-5 h-5" />
                      <span className="text-sm font-medium uppercase tracking-wider">
                        {selectedFile ? selectedFile.name : 'Elegir Imagen'}
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" disabled={uploading} />
                </label>
                <p className="text-zinc-600 text-xs mt-2">Formatos: JPG, PNG o WEBP. Máximo: 5MB</p>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  placeholder="Breve descripción del miembro..."
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">
                  {editingId ? 'Guardar Cambios' : 'Crear Miembro'}
                </button>
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-900/30 border border-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-display text-xl text-white">Confirmar Eliminación</h3>
                <p className="text-zinc-400 text-sm mt-1">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-8">
              ¿Está seguro de que desea eliminar este miembro permanentemente de la base de datos?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-sm hover:bg-zinc-700 transition-colors rounded-sm">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors rounded-sm">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
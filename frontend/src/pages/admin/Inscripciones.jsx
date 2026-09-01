import { useEffect, useState } from 'react';

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchInscripciones = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInscripciones(data);
    } catch (error) {
      console.error('Error al buscar inscripciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const actualizarEstado = async (id, estado) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: estado })
      });
      fetchInscripciones();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes/${itemToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInscripciones();
      setItemToDelete(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'RECHAZADO': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  if (loading) return <div className="text-zinc-500">Cargando inscripciones...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Inscripciones Recibidas</h1>
          <p className="text-zinc-500 text-sm">Gestione las solicitudes de nuevos miembros.</p>
        </div>
        <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-400 text-sm">
          Total: <span className="text-white font-bold">{inscripciones.length}</span>
        </div>
      </div>
      
      {inscripciones.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <Icon path="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Aún no se han recibido inscripciones.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Candidato</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Contacto</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Perfil</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Mensaje</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Estado</th>
                  <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {inscripciones.map((insc) => (
                  <tr key={insc.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{insc.fullName}</p>
                      <p className="text-zinc-500 text-xs mt-1">{insc.city}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 text-sm">{insc.email}</p>
                      <p className="text-zinc-500 text-xs">{insc.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-zinc-400">
                        <span>Silla de Ruedas: <span className="text-zinc-200">{insc.wheelchairUser ? 'Sí' : 'No'}</span></span>
                        <span>Exp. Rugby: <span className="text-zinc-200">{insc.rugbyExperience ? 'Sí' : 'No'}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {insc.message ? (
                        <p className="text-zinc-400 text-sm line-clamp-2" title={insc.message}>
                          "{insc.message}"
                        </p>
                      ) : (
                        <span className="text-zinc-600 text-sm italic">Sin mensaje</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getEstadoStyle(insc.status)}`}>
                        {insc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {insc.status === 'PENDIENTE' && (
                          <>
                            <button onClick={() => actualizarEstado(insc.id, 'APROBADO')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-sm transition-colors" title="Aprobar">
                              <Icon path="M4.5 12.75l6 6 9-13.5" />
                            </button>
                            <button onClick={() => actualizarEstado(insc.id, 'RECHAZADO')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Rechazar">
                              <Icon path="M6 18L18 6M6 6l12 12" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setItemToDelete(insc.id)} 
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

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
              ¿Está seguro de que desea eliminar esta inscripción permanentemente de la base de datos?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-sm hover:bg-zinc-700 transition-colors rounded-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors rounded-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

  const fetchPatrocinios = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patrocinadores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPatrocinios(data);
    } catch (error) {
      console.error('Error al buscar patrocinios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrocinios();
  }, []);

  const actualizarEstado = async (id, estado) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/patrocinadores/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: estado })
      });
      fetchPatrocinios();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/patrocinadores/${itemToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPatrocinios();
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

  if (loading) return <div className="text-zinc-500">Cargando patrocinios...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Solicitudes de Patrocinio</h1>
          <p className="text-zinc-500 text-sm">Gestione las propuestas de empresas y colaboradores.</p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-400 text-sm">
          Total: <span className="text-white font-bold">{patrocinios.length}</span>
        </div>
      </div>
      
      {patrocinios.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <Icon path="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Aún no se han recibido solicitudes de patrocinio.</p>
        </div>
      ) : (
        <>
          {/* MOBILE - Cards Verticais */}
          <div className="md:hidden space-y-4">
            {patrocinios.map((pat) => (
              <div key={pat.id} className="bg-zinc-900 border border-zinc-800 rounded-sm p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl text-white font-bold">{pat.companyName}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{pat.contactName}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getEstadoStyle(pat.status)}`}>
                    {pat.status}
                  </span>
                </div>

                {/* Informações */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Email</p>
                    <p className="text-zinc-300 text-sm">{pat.email}</p>
                  </div>
                  {pat.phone && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                      <p className="text-zinc-300 text-sm">{pat.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Modalidad</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                      {pat.sponsorshipType}
                    </span>
                  </div>
                  {pat.message && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Mensaje</p>
                      <p className="text-zinc-400 text-sm italic">"{pat.message}"</p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                {pat.status === 'PENDIENTE' && (
                  <div className="flex gap-2 pt-3 border-t border-zinc-800">
                    <button 
                      onClick={() => actualizarEstado(pat.id, 'APROBADO')} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600/10 text-green-500 border border-green-600/20 rounded-sm font-bold uppercase text-xs tracking-wider hover:bg-green-600/20 transition-colors"
                    >
                      <Icon path="M4.5 12.75l6 6 9-13.5" className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button 
                      onClick={() => actualizarEstado(pat.id, 'RECHAZADO')} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-sm font-bold uppercase text-xs tracking-wider hover:bg-red-600/20 transition-colors"
                    >
                      <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setItemToDelete(pat.id)} 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-zinc-400 rounded-sm font-bold uppercase text-xs tracking-wider hover:bg-red-600/10 hover:text-red-500 transition-colors"
                >
                  <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP - Tabela Horizontal */}
          <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Empresa</th>
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Contacto</th>
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Modalidad</th>
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Mensaje</th>
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Estado</th>
                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {patrocinios.map((pat) => (
                    <tr key={pat.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{pat.companyName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-zinc-300 text-sm">{pat.contactName}</p>
                        <p className="text-zinc-500 text-xs">{pat.email}</p>
                        {pat.phone && <p className="text-zinc-500 text-xs">{pat.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                          {pat.sponsorshipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {pat.message ? (
                          <p className="text-zinc-400 text-sm line-clamp-2" title={pat.message}>
                            "{pat.message}"
                          </p>
                        ) : (
                          <span className="text-zinc-600 text-sm italic">Sin mensaje</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getEstadoStyle(pat.status)}`}>
                          {pat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pat.status === 'PENDIENTE' && (
                            <>
                              <button onClick={() => actualizarEstado(pat.id, 'APROBADO')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-sm transition-colors" title="Aprobar">
                                <Icon path="M4.5 12.75l6 6 9-13.5" />
                              </button>
                              <button onClick={() => actualizarEstado(pat.id, 'RECHAZADO')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Rechazar">
                                <Icon path="M6 18L18 6M6 6l12 12" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setItemToDelete(pat.id)} 
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
        </>
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
              ¿Está seguro de que desea eliminar esta solicitud de patrocinio permanentemente de la base de datos?
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
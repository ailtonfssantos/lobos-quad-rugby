import { useEffect, useState } from "react";
import { getImageUrl } from "../../config";

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const createEmptyPartido = () => ({
  fecha: "", diaSemana: "Sábado", horario: "", rival: "", rivalLogo: "",
  equipoLocalNombre: "Lobos Quad Rugby", equipoLocalLogo: "",
  equipoVisitanteNombre: "", equipoVisitanteLogo: "",
  youtubeLink: "", status: "PROGRAMADO", lobosScore: "", rivalScore: "",
});

export default function Jornadas() {
  const [jornadas, setJornadas] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("activas");
  const [filtroTemporada, setFiltroTemporada] = useState("todas");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(null);

  const [formData, setFormData] = useState({
    numero: "", temporadaId: "", competicion: "Liga Nacional",
    ciudad: "", pabellon: "", fechas: "", bannerUrl: "",
    partidos: [createEmptyPartido(), createEmptyPartido(), createEmptyPartido()],
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchJornadas = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/jornadas`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      setJornadas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar jornadas:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Lee la respuesta una sola vez
  const fetchTemporadas = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/temporadas`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json(); 
      setTemporadas(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error("Error al cargar temporadas:", error);
    }
  };

  useEffect(() => {
    fetchJornadas();
    fetchTemporadas();
  }, []);

  const displayedJornadas = jornadas.filter((j) => {
    const isActiveMatch = activeTab === "activas" ? j.isActive : !j.isActive;
    const temporadaMatch = filtroTemporada === "todas" || String(j.temporadaId) === String(filtroTemporada);
    return isActiveMatch && temporadaMatch;
  });

  const normalizePartido = (partido = {}) => ({
    fecha: partido.fecha || partido.date || partido.fechaPartido || "",
    diaSemana: partido.diaSemana || "Sábado",
    horario: partido.horario || "",
    rival: partido.rival || "",
    rivalLogo: partido.rivalLogo || "",
    equipoLocalNombre: partido.equipoLocal?.nombre || partido.equipoLocalNombre || "Lobos Quad Rugby",
    equipoLocalLogo: partido.equipoLocal?.logo || partido.equipoLocalLogo || "",
    equipoVisitanteNombre: partido.equipoVisitante?.nombre || partido.equipoVisitanteNombre || partido.rival || "",
    equipoVisitanteLogo: partido.equipoVisitante?.logo || partido.equipoVisitanteLogo || partido.rivalLogo || "",
    youtubeLink: partido.youtubeLink || partido.youtube || "",
    status: partido.status || "PROGRAMADO",
    lobosScore: partido.lobosScore ?? "",
    rivalScore: partido.rivalScore ?? "",
  });

  const openModal = (jornada = null) => {
    if (jornada) {
      setEditingId(jornada.id);
      const partidos = Array.isArray(jornada.partidos) ? jornada.partidos.map(normalizePartido) : [];
      while (partidos.length < 3) partidos.push(createEmptyPartido());
      setFormData({
        numero: jornada.numero ?? "",
        temporadaId: jornada.temporadaId ? String(jornada.temporadaId) : "",
        competicion: jornada.competicion || "Liga Nacional",
        ciudad: jornada.ciudad || "",
        pabellon: jornada.pabellon || "",
        fechas: jornada.fechas || "",
        bannerUrl: jornada.bannerUrl || "",
        partidos,
      });
    } else {
      setEditingId(null);
      setFormData({
        numero: "", temporadaId: "", competicion: "Liga Nacional",
        ciudad: "", pabellon: "", fechas: "", bannerUrl: "",
        partidos: [createEmptyPartido(), createEmptyPartido(), createEmptyPartido()],
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingId(null); setUploadingLogo(null); };

  const uploadImage = async (file, type, index = null) => {
    if (!file) return;
    const uploadKey = index === null ? type : `${type}-${index}`;
    try {
      setUploadingLogo(uploadKey);
      const uploadData = new FormData();
      uploadData.append("image", file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: uploadData,
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      if (!data.url) throw new Error("La API no devolvió una URL");
      
      if (type === "banner") setFormData((prev) => ({ ...prev, bannerUrl: data.url }));
      if (type === "equipoLocalLogo" && index !== null) updatePartido(index, "equipoLocalLogo", data.url);
      if (type === "equipoVisitanteLogo" && index !== null) {
        updatePartido(index, "equipoVisitanteLogo", data.url);
        updatePartido(index, "rivalLogo", data.url);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("No se pudo subir la imagen.");
    } finally {
      setUploadingLogo(null);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try { await uploadImage(file, "banner"); } 
    finally { setUploadingBanner(false); e.target.value = ""; }
  };

  const updateJornada = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const updatePartido = (index, field, value) => {
    setFormData((prev) => {
      const partidos = [...prev.partidos];
      partidos[index] = { ...partidos[index], [field]: value };
      if (field === "equipoVisitanteNombre") partidos[index].rival = value;
      if (field === "equipoVisitanteLogo") partidos[index].rivalLogo = value;
      return { ...prev, partidos };
    });
  };

  const addPartido = () => setFormData((prev) => ({ ...prev, partidos: [...prev.partidos, createEmptyPartido()] }));
  
  const removePartido = (index) => {
    if (formData.partidos.length <= 1) { alert("Una jornada debe tener al menos un partido."); return; }
    setFormData((prev) => ({ ...prev, partidos: prev.partidos.filter((_, i) => i !== index) }));
  };

  const movePartidoUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const partidos = [...prev.partidos];
      [partidos[index - 1], partidos[index]] = [partidos[index], partidos[index - 1]];
      return { ...prev, partidos };
    });
  };

  const movePartidoDown = (index) => {
    if (index === formData.partidos.length - 1) return;
    setFormData((prev) => {
      const partidos = [...prev.partidos];
      [partidos[index], partidos[index + 1]] = [partidos[index + 1], partidos[index]];
      return { ...prev, partidos };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const partidosValidos = formData.partidos.filter((p) => p.equipoVisitanteNombre || p.rival || p.horario || p.fecha);
    
    const partidosFinales = partidosValidos.map((p) => ({
      ...p,
      equipoLocal: { nombre: p.equipoLocalNombre || "Lobos Quad Rugby", logo: p.equipoLocalLogo || "" },
      equipoVisitante: { nombre: p.equipoVisitanteNombre || p.rival || "", logo: p.equipoVisitanteLogo || p.rivalLogo || "" },
      rival: p.equipoVisitanteNombre || p.rival || "",
      rivalLogo: p.equipoVisitanteLogo || p.rivalLogo || "",
    }));

    const payload = { ...formData, partidos: partidosFinales };
    const url = editingId ? `${API_URL}/api/jornadas/${editingId}` : `${API_URL}/api/jornadas`;

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Error HTTP: ${res.status}`);
      }
      closeModal();
      await fetchJornadas();
    } catch (error) {
      console.error("Error al guardar jornada:", error);
      alert("No se pudo guardar la jornada.");
    }
  };

  const toggleActiva = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/jornadas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      fetchJornadas();
    } catch (error) { console.error(error); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/jornadas/${itemToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      await fetchJornadas();
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la jornada.");
    }
  };

  if (loading) return <div className="text-zinc-500">Cargando jornadas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Gestión de Calendario</p>
          <h1 className="font-display text-3xl text-white mb-1">Jornadas</h1>
          <p className="text-zinc-500 text-sm">Administre jornadas, partidos, equipos, logos, horarios y retransmisiones.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded-sm">
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Nueva Jornada
        </button>
      </div>

      {/* FILTRO DE TEMPORADAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-sm">
        <div className="flex items-center gap-3">
          <Icon path="M12 6v6l4 2" className="w-5 h-5 text-zinc-500" />
          <span className="text-zinc-400 text-sm font-medium">Filtrar por Temporada:</span>
        </div>
        <select
          value={filtroTemporada}
          onChange={(e) => setFiltroTemporada(e.target.value)}
          className="appearance-none bg-zinc-950 border border-zinc-700 text-white px-4 py-2 pr-8 rounded-sm text-xs font-bold uppercase tracking-wider focus:border-red-600 outline-none cursor-pointer hover:border-zinc-500 transition-colors w-full sm:w-64"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: `right 0.5rem center`,
            backgroundRepeat: `no-repeat`,
            backgroundSize: `1rem 1rem`
          }}
        >
          <option value="todas">Todas las temporadas</option>
          {temporadas.map((temp) => (
            <option key={temp.id} value={temp.id}>{temp.nome}</option>
          ))}
        </select>
      </div>

      <div className="flex border-b border-zinc-800">
        <button onClick={() => setActiveTab("activas")} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "activas" ? "border-red-600 text-red-500" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
          Jornadas Activas
        </button>
        <button onClick={() => setActiveTab("historico")} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "historico" ? "border-red-600 text-red-500" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
          Histórico
        </button>
      </div>

      {displayedJornadas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500 mb-4">No hay jornadas que coincidan con los filtros seleccionados.</p>
          {activeTab === "activas" && <button onClick={() => openModal()} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded-sm">Crear Primera Jornada</button>}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Jornada</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Temporada</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Ubicación</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Partidos</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">Estado</th>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedJornadas.map((j) => {
                const estadoTemporada = j.temporada?.estado || "ACTIVA";
                const temporadaNombre = j.temporada?.nome || "Sin temporada";
                
                return (
                  <tr key={j.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-lg">Jornada {j.numero}</p>
                      <p className="text-zinc-500 text-xs uppercase">{j.competicion}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                        {temporadaNombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 text-sm">{j.ciudad || "—"}</p>
                      <p className="text-zinc-500 text-xs">{j.pabellon || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {(j.partidos || []).map((p, idx) => {
                          const local = p.equipoLocal?.nombre || p.equipoLocalNombre || "Lobos Quad Rugby";
                          const visitante = p.equipoVisitante?.nombre || p.equipoVisitanteNombre || p.rival || "—";
                          return (
                            <div key={idx} className="text-xs">
                              <div className="text-zinc-500">
                                {p.fecha && <>{p.fecha} {" · "}</>}
                                {p.diaSemana}
                                {p.horario && <span className="text-red-500 ml-1">{p.horario}</span>}
                              </div>
                              <div className="text-white">{local} <span className="text-zinc-700 mx-1">vs</span> {visitante}</div>
                              {p.status === "FINALIZADO" && <span className="text-green-500">{p.lobosScore} - {p.rivalScore}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        estadoTemporada === 'ACTIVA' 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      }`}>
                        {estadoTemporada === 'ACTIVA' ? "Activa" : "Finalizada"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(j)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors" title="Editar">
                          <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </button>
                        <button onClick={() => toggleActiva(j.id, j.isActive)} className={`p-2 rounded-sm transition-colors ${j.isActive ? "text-yellow-500 hover:bg-yellow-500/10" : "text-green-500 hover:bg-green-500/10"}`} title={j.isActive ? "Archivar" : "Reactivar"}>
                          <Icon path={j.isActive ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" : "M4 4v5h.582A8.001 8.001 0 0020 9m0 0H15m5 11v-5h-.581A8.003 8.003 0 014 15m0 0h5"} />
                        </button>
                        <button onClick={() => setItemToDelete(j.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Eliminar">
                          <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR/EDITAR JORNADA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-5xl w-full my-8 shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-20">
              <div>
                <p className="text-red-500 text-[9px] uppercase tracking-[0.2em] font-bold mb-1">Gestión de Calendario</p>
                <h2 className="font-display text-2xl text-white">{editingId ? "Editar Jornada" : "Nueva Jornada"}</h2>
              </div>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white"><Icon path="M6 18L18 6M6 6l12 12" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[78vh] overflow-y-auto">
              <section>
                <div className="mb-5">
                  <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold">Información general</p>
                  <h3 className="font-display text-xl text-white mt-1">Datos de la Jornada</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Número de Jornada *</label>
                    <input type="number" value={formData.numero} onChange={(e) => updateJornada("numero", e.target.value)} required min="1" className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                  </div>
                  
                  {/* SELECTOR DE TEMPORADA (Ahora funcionará perfectamente) */}
                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Temporada *</label>
                    <select 
                      value={formData.temporadaId} 
                      onChange={(e) => updateJornada("temporadaId", e.target.value)} 
                      required 
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    >
                      <option value="">Seleccionar temporada</option>
                      {temporadas.map((temporada) => (
                        <option key={temporada.id} value={temporada.id}>{temporada.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Competición *</label>
                    <select value={formData.competicion} onChange={(e) => updateJornada("competicion", e.target.value)} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none">
                      <option>Liga Nacional</option><option>Competición Autonómica</option><option>Copa</option><option>Amistoso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Ciudad *</label>
                    <input type="text" value={formData.ciudad} onChange={(e) => updateJornada("ciudad", e.target.value)} required placeholder="Valencia" className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Pabellón *</label>
                    <input type="text" value={formData.pabellon} onChange={(e) => updateJornada("pabellon", e.target.value)} required placeholder="Pabellón Municipal..." className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Fechas de la Jornada *</label>
                    <input type="text" value={formData.fechas} onChange={(e) => updateJornada("fechas", e.target.value)} required placeholder="10 y 11 de octubre de 2026" className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none" />
                    <p className="mt-2 text-[10px] text-zinc-600">Ejemplo: 10 y 11 de octubre de 2026</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Banner de la Jornada</label>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {formData.bannerUrl && (<img src={getImageUrl(formData.bannerUrl)} alt="Banner" className="w-full md:w-64 h-24 object-cover border border-zinc-700 rounded-sm" />)}
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 cursor-pointer rounded-sm text-sm">
                        {uploadingBanner ? 'Subiendo...' : 'Elegir Imagen'}
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold">Calendario</p>
                    <h3 className="font-display text-xl text-white mt-1">Partidos de la Jornada</h3>
                  </div>
                  <button type="button" onClick={addPartido} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded-sm">
                    <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" /> Añadir Partido
                  </button>
                </div>
                <div className="space-y-5">
                  {formData.partidos.map((p, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-bold uppercase tracking-wider">Partido {idx + 1}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => movePartidoUp(idx)} disabled={idx === 0} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"><Icon path="M5 15l7-7 7 7" className="w-4 h-4" /></button>
                          <button type="button" onClick={() => movePartidoDown(idx)} disabled={idx === formData.partidos.length - 1} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"><Icon path="M19 9l-7 7-7-7" className="w-4 h-4" /></button>
                          <button type="button" onClick={() => removePartido(idx)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"><Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="p-5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Fecha del partido *</label>
                            <input type="date" value={p.fecha} onChange={(e) => updatePartido(idx, "fecha", e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600" />
                          </div>
                          <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Día de la semana</label>
                            <select value={p.diaSemana} onChange={(e) => updatePartido(idx, "diaSemana", e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600">
                              <option>Sábado</option><option>Domingo</option><option>Viernes</option><option>Lunes</option><option>Martes</option><option>Miércoles</option><option>Jueves</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Hora *</label>
                            <input type="time" value={p.horario} onChange={(e) => updatePartido(idx, "horario", e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 bg-red-500 rounded-full"></span><p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">Equipo Local</p></div>
                            <div className="space-y-4">
                              <input type="text" placeholder="Nombre del equipo local" value={p.equipoLocalNombre} onChange={(e) => updatePartido(idx, "equipoLocalNombre", e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600" />
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden rounded-sm">
                                  {p.equipoLocalLogo ? (<img src={getImageUrl(p.equipoLocalLogo)} alt="Logo equipo local" className="w-full h-full object-contain p-2" />) : (<span className="text-zinc-700 text-[9px] uppercase text-center">Sin logo</span>)}
                                </div>
                                <label className="flex-1 cursor-pointer">
                                  <div className="px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 rounded-sm text-xs text-center transition-colors">
                                    {uploadingLogo === `equipoLocalLogo-${idx}` ? "Subiendo..." : "Subir logo"}
                                  </div>
                                  <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo === `equipoLocalLogo-${idx}`} onChange={(e) => uploadImage(e.target.files?.[0], "equipoLocalLogo", idx)} />
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 bg-zinc-500 rounded-full"></span><p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">Equipo Visitante</p></div>
                            <div className="space-y-4">
                              <input type="text" placeholder="Nombre del equipo visitante" value={p.equipoVisitanteNombre} onChange={(e) => updatePartido(idx, "equipoVisitanteNombre", e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600" />
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden rounded-sm">
                                  {p.equipoVisitanteLogo ? (<img src={getImageUrl(p.equipoVisitanteLogo)} alt="Logo equipo visitante" className="w-full h-full object-contain p-2" />) : (<span className="text-zinc-700 text-[9px] uppercase text-center">Sin logo</span>)}
                                </div>
                                <label className="flex-1 cursor-pointer">
                                  <div className="px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 rounded-sm text-xs text-center transition-colors">
                                    {uploadingLogo === `equipoVisitanteLogo-${idx}` ? "Subiendo..." : "Subir logo"}
                                  </div>
                                  <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo === `equipoVisitanteLogo-${idx}`} onChange={(e) => uploadImage(e.target.files?.[0], "equipoVisitanteLogo", idx)} />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Estado</label>
                            <select value={p.status} onChange={(e) => updatePartido(idx, "status", e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600">
                              <option value="PROGRAMADO">Programado</option><option value="FINALIZADO">Finalizado</option><option value="CANCELADO">Cancelado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">YouTube</label>
                            <input type="url" placeholder="https://youtube.com/..." value={p.youtubeLink} onChange={(e) => updatePartido(idx, "youtubeLink", e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600" />
                          </div>
                        </div>
                        {p.status === "FINALIZADO" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Puntos Lobos</label>
                              <input type="number" min="0" value={p.lobosScore} onChange={(e) => updatePartido(idx, "lobosScore", e.target.value)} placeholder="54" className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-lg font-bold outline-none focus:border-red-600" />
                            </div>
                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Puntos Rival</label>
                              <input type="number" min="0" value={p.rivalScore} onChange={(e) => updatePartido(idx, "rivalScore", e.target.value)} placeholder="48" className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-lg font-bold outline-none focus:border-red-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <div className="flex flex-col md:flex-row gap-3 pt-5 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
                <button type="submit" className="flex-1 py-3.5 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-500 transition-colors rounded-sm">{editingId ? "Guardar Cambios" : "Crear Jornada"}</button>
                <button type="button" onClick={closeModal} className="flex-1 py-3.5 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR JORNADA */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 rounded-full mx-auto">
              <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display text-xl text-white text-center mb-2">Confirmar Eliminación</h3>
            <p className="text-zinc-400 text-sm text-center mb-6 leading-relaxed">¿Está seguro de que desea eliminar esta jornada? También se eliminarán todos los partidos asociados.</p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase text-sm rounded-sm hover:bg-zinc-700 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-sm rounded-sm hover:bg-red-500 transition-colors">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
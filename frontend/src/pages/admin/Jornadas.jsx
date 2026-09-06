import { useEffect, useState } from "react";
import { getImageUrl } from "../../config";

/* =========================================================
   ICON
========================================================= */

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);
/* =========================================================
   EMPTY MATCH
========================================================= */
const createEmptyPartido = () => ({
  fecha: "",
  diaSemana: "Sábado",
  horario: "",

  // Compatibilidad con estructura anterior
  rival: "",
  rivalLogo: "",

  // Nueva estructura
  equipoLocalNombre: "Lobos Quad Rugby",
  equipoLocalLogo: "",

  equipoVisitanteNombre: "",
  equipoVisitanteLogo: "",

  youtubeLink: "",
  status: "PROGRAMADO",

  lobosScore: "",
  rivalScore: "",
});

/* =========================================================
   COMPONENT
========================================================= */
export default function Jornadas() {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("activas");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(null);

  /* =======================================================
     FORM DATA
  ======================================================= */

  const [formData, setFormData] = useState({
    numero: "",
    competicion: "Liga Nacional 26/27",
    //temporada: 'Rugby 26-27',
    ciudad: "",
    pabellon: "",
    fechas: "",
    bannerUrl: "",
    partidos: [
      createEmptyPartido(),
      createEmptyPartido(),
      createEmptyPartido(),
    ],
  });

  /* =======================================================
     API
  ======================================================= */

  const API_URL = import.meta.env.VITE_API_URL;
  /* =======================================================
     FETCH JORNADAS
  ======================================================= */
  const fetchJornadas = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/jornadas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();
      setJornadas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar jornadas:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJornadas();
  }, []);

  /* =======================================================
     NORMALIZE MATCH
     
     Permite editar partidas antiguas y nuevas.
  ======================================================= */
  const normalizePartido = (partido = {}) => {
    return {
      fecha: partido.fecha || partido.date || partido.fechaPartido || "",
      diaSemana: partido.diaSemana || "Sábado",
      horario: partido.horario || "",
      rival: partido.rival || "",
      rivalLogo: partido.rivalLogo || "",
      equipoLocalNombre:
        partido.equipoLocal?.nombre ||
        partido.equipoLocalNombre ||
        "Lobos Quad Rugby",

      equipoLocalLogo:
        partido.equipoLocal?.logo || partido.equipoLocalLogo || "",
      equipoVisitanteNombre:
        partido.equipoVisitante?.nombre ||
        partido.equipoVisitanteNombre ||
        partido.rival ||
        "",
      equipoVisitanteLogo:
        partido.equipoVisitante?.logo ||
        partido.equipoVisitanteLogo ||
        partido.rivalLogo ||
        "",
      youtubeLink: partido.youtubeLink || partido.youtube || "",
      status: partido.status || "PROGRAMADO",
      lobosScore: partido.lobosScore ?? "",
      rivalScore: partido.rivalScore ?? "",
    };
  };

  /* =======================================================
     OPEN MODAL
  ======================================================= */

  const openModal = (jornada = null) => {
    if (jornada) {
      setEditingId(jornada.id);
      const partidos = Array.isArray(jornada.partidos)
        ? jornada.partidos.map(normalizePartido)
        : [];
      /*
        Compatibilidade:
        se a jornada antiga tinha 3 espaços,
        continuam aparecendo 3.
      */
      while (partidos.length < 3) {
        partidos.push(createEmptyPartido());
      }
      setFormData({
        numero: jornada.numero ?? "",
        competicion: jornada.competicion || "Liga Nacional 26/27",
        //temporada: jornada.temporada || "Rugby 26-27",
        ciudad: jornada.ciudad || "",
        pabellon: jornada.pabellon || "",
        fechas: jornada.fechas || "",
        bannerUrl: jornada.bannerUrl || "",
        partidos,
      });
    } else {
      setEditingId(null);
      setFormData({
        numero: "",
        competicion: "Liga Nacional 26/27",
        //temporada: "Rugby 26-27",
        ciudad: "",
        pabellon: "",
        fechas: "",
        bannerUrl: "",
        partidos: [
          createEmptyPartido(),
          createEmptyPartido(),
          createEmptyPartido(),
        ],
      });
    }
    setModalOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setUploadingLogo(null);
  };
  /* =======================================================
     UPLOAD IMAGE
  ======================================================= */
  const uploadImage = async (file, type, index = null) => {
    if (!file) return;
    const uploadKey = index === null ? type : `${type}-${index}`;
    try {
      setUploadingLogo(uploadKey);
      const uploadData = new FormData();
      uploadData.append("image", file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error("La API no devolvió una URL");
      }
      /* -----------------------------------------------
         BANNER
      ------------------------------------------------ */
      if (type === "banner") {
        setFormData((prev) => ({
          ...prev,
          bannerUrl: data.url,
        }));
      }

      /* -----------------------------------------------
         LOGO
      ------------------------------------------------ */

      if (type === "equipoLocalLogo" && index !== null) {
        updatePartido(index, "equipoLocalLogo", data.url);
      }
      if (type === "equipoVisitanteLogo" && index !== null) {
        updatePartido(index, "equipoVisitanteLogo", data.url);

        /*
          Mantém compatibilidade com
          a estrutura antiga.
        */

        updatePartido(index, "rivalLogo", data.url);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("No se pudo subir la imagen.");
    } finally {
      setUploadingLogo(null);
    }
  };

  /* =======================================================
     BANNER UPLOAD
  ======================================================= */

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      await uploadImage(file, "banner");
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  };

  /* =======================================================
     UPDATE JOURNEY FIELD
  ======================================================= */

  const updateJornada = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =======================================================
     UPDATE MATCH
  ======================================================= */
  const updatePartido = (index, field, value) => {
    setFormData((prev) => {
      const partidos = [...prev.partidos];
      partidos[index] = {
        ...partidos[index],
        [field]: value,
      };
      /*
        Se o usuário preencher
        o equipo visitante,
        mantém também rival.
      */
      if (field === "equipoVisitanteNombre") {
        partidos[index].rival = value;
      }

      if (field === "equipoVisitanteLogo") {
        partidos[index].rivalLogo = value;
      }
      return {
        ...prev,
        partidos,
      };
    });
  };

  /* =======================================================
     ADD MATCH
  ======================================================= */

  const addPartido = () => {
    setFormData((prev) => ({
      ...prev,
      partidos: [...prev.partidos, createEmptyPartido()],
    }));
  };

  /* =======================================================
     REMOVE MATCH
  ======================================================= */

  const removePartido = (index) => {
    if (formData.partidos.length <= 1) {
      alert("Una jornada debe tener al menos un partido.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      partidos: prev.partidos.filter((_, i) => i !== index),
    }));
  };

  /* =======================================================
     MOVE MATCH UP
  ======================================================= */
  const movePartidoUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const partidos = [...prev.partidos];
      [partidos[index - 1], partidos[index]] = [
        partidos[index],
        partidos[index - 1],
      ];
      return {
        ...prev,
        partidos,
      };
    });
  };

  /* =======================================================
     MOVE MATCH DOWN
  ======================================================= */

  const movePartidoDown = (index) => {
    if (index === formData.partidos.length - 1) {
      return;
    }

    setFormData((prev) => {
      const partidos = [...prev.partidos];

      [partidos[index], partidos[index + 1]] = [
        partidos[index + 1],
        partidos[index],
      ];

      return {
        ...prev,
        partidos,
      };
    });
  };

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    /*
      Limpamos partidas completamente vazias.
    */

    const partidosValidos = formData.partidos.filter(
      (partido) =>
        partido.equipoVisitanteNombre ||
        partido.rival ||
        partido.horario ||
        partido.fecha,
    );

    /*
      Garantimos compatibilidade com
      a estrutura antiga E nova.
    */

    const partidosFinales = partidosValidos.map((partido) => {
      const visitanteNombre =
        partido.equipoVisitanteNombre || partido.rival || "";

      const visitanteLogo =
        partido.equipoVisitanteLogo || partido.rivalLogo || "";

      return {
        ...partido,

        /*
              Estrutura nova
            */

        equipoLocal: {
          nombre: partido.equipoLocalNombre || "Lobos Quad Rugby",

          logo: partido.equipoLocalLogo || "",
        },

        equipoVisitante: {
          nombre: visitanteNombre,

          logo: visitanteLogo,
        },

        /*
              Estrutura antiga
            */

        rival: visitanteNombre,

        rivalLogo: visitanteLogo,
      };
    });

    const payload = {
      ...formData,

      partidos: partidosFinales,
    };

    const url = editingId
      ? `${API_URL}/api/jornadas/${editingId}`
      : `${API_URL}/api/jornadas`;

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

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

  /* =======================================================
     TOGGLE ACTIVE
  ======================================================= */

  const toggleActiva = async (id, currentStatus) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/jornadas/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      fetchJornadas();
    } catch (error) {
      console.error(error);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/jornadas/${itemToDelete}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      await fetchJornadas();

      setItemToDelete(null);
    } catch (error) {
      console.error(error);

      alert("No se pudo eliminar la jornada.");
    }
  };

  /* =======================================================
     DISPLAYED JORNADAS
  ======================================================= */

  const displayedJornadas =
    activeTab === "activas"
      ? jornadas.filter((j) => j.isActive)
      : jornadas.filter((j) => !j.isActive);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <div className="text-zinc-500">Cargando jornadas...</div>;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
            Temporada Rugby 26-27
          </p>

          <h1 className="font-display text-3xl text-white mb-1">
            Gestión de Jornadas
          </h1>

          <p className="text-zinc-500 text-sm">
            Administre jornadas, partidos, equipos, logos, horarios y
            retransmisiones.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="
            flex items-center
            justify-center
            gap-2
            px-5
            py-2.5
            bg-red-600
            text-white
            text-sm
            font-bold
            uppercase
            tracking-wider
            hover:bg-red-500
            transition-colors
            rounded-sm
          "
        >
          <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" />
          Nueva Jornada
        </button>
      </div>

      {/* ===================================================
          TABS
      =================================================== */}

      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("activas")}
          className={`
            px-6
            py-3
            text-sm
            font-bold
            uppercase
            tracking-wider
            transition-colors
            border-b-2
            ${
              activeTab === "activas"
                ? "border-red-600 text-red-500"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }
          `}
        >
          Jornadas Activas
        </button>

        <button
          onClick={() => setActiveTab("historico")}
          className={`
            px-6
            py-3
            text-sm
            font-bold
            uppercase
            tracking-wider
            transition-colors
            border-b-2
            ${
              activeTab === "historico"
                ? "border-red-600 text-red-500"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }
          `}
        >
          Histórico
        </button>
      </div>

      {/* ===================================================
          EMPTY
      =================================================== */}

      {displayedJornadas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <p className="text-zinc-500 mb-4">
            {activeTab === "activas"
              ? "Aún no hay jornadas activas."
              : "No hay jornadas en el histórico."}
          </p>

          {activeTab === "activas" && (
            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded-sm"
            >
              Crear Primera Jornada
            </button>
          )}
        </div>
      ) : (
        /* =================================================
           TABLE
        ================================================= */

        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Jornada
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Ubicación
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Fechas
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Partidos
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Estado
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800">
              {displayedJornadas.map((j) => (
                <tr
                  key={j.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  {/* JOURNEY */}

                  <td className="px-6 py-4">
                    <p className="text-white font-bold text-lg">
                      Jornada {j.numero}
                    </p>

                    <p className="text-zinc-500 text-xs uppercase">
                      {j.competicion}
                    </p>
                  </td>

                  {/* LOCATION */}

                  <td className="px-6 py-4">
                    <p className="text-zinc-300 text-sm">{j.ciudad || "—"}</p>

                    <p className="text-zinc-500 text-xs">{j.pabellon || "—"}</p>
                  </td>

                  {/* DATE */}

                  <td className="px-6 py-4">
                    <span className="text-zinc-300 text-sm">
                      {j.fechas || "—"}
                    </span>
                  </td>

                  {/* MATCHES */}

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {(j.partidos || []).map((p, idx) => {
                        const local =
                          p.equipoLocal?.nombre ||
                          p.equipoLocalNombre ||
                          "Lobos Quad Rugby";

                        const visitante =
                          p.equipoVisitante?.nombre ||
                          p.equipoVisitanteNombre ||
                          p.rival ||
                          "—";

                        return (
                          <div key={idx} className="text-xs">
                            <div className="text-zinc-500">
                              {p.fecha && (
                                <>
                                  {p.fecha}
                                  {" · "}
                                </>
                              )}

                              {p.diaSemana}

                              {p.horario && (
                                <span className="text-red-500 ml-1">
                                  {p.horario}
                                </span>
                              )}
                            </div>

                            <div className="text-white">
                              {local}

                              <span className="text-zinc-700 mx-1">vs</span>

                              {visitante}
                            </div>

                            {p.status === "FINALIZADO" && (
                              <span className="text-green-500">
                                {p.lobosScore} - {p.rivalScore}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        rounded-full
                        ${
                          j.isActive
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }
                      `}
                    >
                      {j.isActive ? "Activa" : "Archivada"}
                    </span>
                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(j)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
                        title="Editar"
                      >
                        <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </button>

                      <button
                        onClick={() => toggleActiva(j.id, j.isActive)}
                        className={`
                          p-2
                          rounded-sm
                          transition-colors
                          ${
                            j.isActive
                              ? "text-yellow-500 hover:bg-yellow-500/10"
                              : "text-green-500 hover:bg-green-500/10"
                          }
                        `}
                        title={j.isActive ? "Archivar" : "Reactivar"}
                      >
                        <Icon
                          path={
                            j.isActive
                              ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              : "M4 4v5h.582A8.001 8.001 0 0020 9m0 0H15m5 11v-5h-.581A8.003 8.003 0 014 15m0 0h5"
                          }
                        />
                      </button>

                      <button
                        onClick={() => setItemToDelete(j.id)}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors"
                        title="Eliminar"
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

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-5xl w-full my-8 shadow-2xl">
            {/* HEADER */}

            <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-20">
              <div>
                <p className="text-red-500 text-[9px] uppercase tracking-[0.2em] font-bold mb-1">
                  Temporada Rugby 26-27
                </p>

                <h2 className="font-display text-2xl text-white">
                  {editingId ? "Editar Jornada" : "Nueva Jornada"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-white"
              >
                <Icon path="M6 18L18 6M6 6l12 12" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-8 max-h-[78vh] overflow-y-auto"
            >
              {/* =========================================
                  JOURNEY INFORMATION
              ========================================= */}

              <section>
                <div className="mb-5">
                  <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                    Información general
                  </p>

                  <h3 className="font-display text-xl text-white mt-1">
                    Datos de la Jornada
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* NUMBER */}

                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                      Número de Jornada *
                    </label>

                    <input
                      type="number"
                      value={formData.numero}
                      onChange={(e) => updateJornada("numero", e.target.value)}
                      required
                      min="1"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    />
                  </div>

                  {/* COMPETITION */}

                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                      Competición *
                    </label>

                    <select
                      value={formData.competicion}
                      onChange={(e) =>
                        updateJornada("competicion", e.target.value)
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    >
                      <option>Liga Nacional 26/27</option>

                      <option>Autonómico</option>

                      <option>Copa</option>

                      <option>Amistoso</option>
                    </select>
                  </div>

                  {/* SEASON */}

                  {/*<div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                      Temporada
                    </label>

                    <input
                      type="text"
                      value={formData.temporada}
                      onChange={(e) =>
                        updateJornada("temporada", e.target.value)
                      }
                      placeholder="Rugby 26-27"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    />
                  </div>*/}

                  {/* CITY */}

                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                      Ciudad *
                    </label>

                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => updateJornada("ciudad", e.target.value)}
                      required
                      placeholder="Valencia"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    />
                  </div>

                  {/* VENUE */}

                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                      Pabellón *
                    </label>

                    <input
                      type="text"
                      value={formData.pabellon}
                      onChange={(e) =>
                        updateJornada("pabellon", e.target.value)
                      }
                      required
                      placeholder="Pabellón Municipal..."
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    />
                  </div>

                  {/* GENERAL DATES */}

                  <div>
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                      Fechas de la Jornada *
                    </label>

                    <input
                      type="text"
                      value={formData.fechas}
                      onChange={(e) => updateJornada("fechas", e.target.value)}
                      required
                      placeholder="10 y 11 de octubre de 2026"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                    />

                    <p className="mt-2 text-[10px] text-zinc-600">
                      Ejemplo: 10 y 11 de octubre de 2026
                    </p>
                  </div>

                  {/* BANNER */}

                  <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Banner da Jornada</label>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {formData.bannerUrl && (
                        <img src={getImageUrl(formData.bannerUrl)} alt="Banner" className="w-full md:w-64 h-24 object-cover border border-zinc-700 rounded-sm" />
                      )}
                      
                      {/* Botão de Upload (Mantido) */}
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 cursor-pointer rounded-sm text-sm">
                        {uploadingBanner ? 'Subindo...' : 'Elegir Imagen'}
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                      </label>

                      {/* ✅ NOVO CAMPO: Para colar o caminho local durante os testes */}
                      <input 
                        type="text" 
                        placeholder="Ou cole o caminho: /assets/competitions/banner.jpg" 
                        value={formData.bannerUrl} 
                        onChange={(e) => updateJornada('bannerUrl', e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================================
                  MATCHES
              ========================================= */}

              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                      Calendario
                    </p>

                    <h3 className="font-display text-xl text-white mt-1">
                      Partidos de la Jornada
                    </h3>

                    <p className="text-zinc-600 text-xs mt-1">
                      Añade todos los partidos que formen parte de esta jornada.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addPartido}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors rounded-sm"
                  >
                    <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" />
                    Añadir Partido
                  </button>
                </div>

                <div className="space-y-5">
                  {formData.partidos.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden"
                    >
                      {/* MATCH HEADER */}

                      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-bold uppercase tracking-wider">
                            Partido {idx + 1}
                          </p>

                          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-1">
                            Configuración del encuentro
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => movePartidoUp(idx)}
                            disabled={idx === 0}
                            className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"
                            title="Subir partido"
                          >
                            <Icon path="M5 15l7-7 7 7" className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => movePartidoDown(idx)}
                            disabled={idx === formData.partidos.length - 1}
                            className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"
                            title="Bajar partido"
                          >
                            <Icon path="M19 9l-7 7-7-7" className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removePartido(idx)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                            title="Eliminar partido"
                          >
                            <Icon
                              path="M6 18L18 6M6 6l12 12"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-6">
                        {/* =================================
                              DATE / TIME
                          ================================= */}

                        <div>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                            Fecha y horario
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* DATE */}

                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                Fecha del partido *
                              </label>

                              <input
                                type="date"
                                value={p.fecha}
                                onChange={(e) =>
                                  updatePartido(idx, "fecha", e.target.value)
                                }
                                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                              />
                            </div>

                            {/* DAY */}

                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                Día de la semana
                              </label>

                              <select
                                value={p.diaSemana}
                                onChange={(e) =>
                                  updatePartido(
                                    idx,
                                    "diaSemana",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                              >
                                <option>Sábado</option>

                                <option>Domingo</option>

                                <option>Viernes</option>

                                <option>Lunes</option>

                                <option>Martes</option>

                                <option>Miércoles</option>

                                <option>Jueves</option>
                              </select>
                            </div>

                            {/* TIME */}

                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                Hora *
                              </label>

                              <input
                                type="time"
                                value={p.horario}
                                onChange={(e) =>
                                  updatePartido(idx, "horario", e.target.value)
                                }
                                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* =================================
                              TEAMS
                          ================================= */}

                        <div>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                            Equipos
                          </p>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* =================================
                                  HOME TEAM
                              ================================= */}

                            <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>

                                <p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                                  Equipo Local
                                </p>
                              </div>

                              <div className="space-y-4">
                                <input
                                  type="text"
                                  placeholder="Nombre del equipo local"
                                  value={p.equipoLocalNombre}
                                  onChange={(e) =>
                                    updatePartido(
                                      idx,
                                      "equipoLocalNombre",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                                />

                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden rounded-sm">
                                    {p.equipoLocalLogo ? (
                                      <img
                                        src={getImageUrl(p.equipoLocalLogo)}
                                        alt="Logo equipo local"
                                        className="w-full h-full object-contain p-2"
                                      />
                                    ) : (
                                      <span className="text-zinc-700 text-[9px] uppercase text-center">
                                        Sin logo
                                      </span>
                                    )}
                                  </div>

                                  <label className="flex-1 cursor-pointer">
                                    <div className="px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 rounded-sm text-xs text-center transition-colors">
                                      {uploadingLogo ===
                                      `equipoLocalLogo-${idx}`
                                        ? "Subiendo..."
                                        : "Subir logo"}
                                    </div>

                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={
                                        uploadingLogo ===
                                        `equipoLocalLogo-${idx}`
                                      }
                                      onChange={(e) =>
                                        uploadImage(
                                          e.target.files?.[0],
                                          "equipoLocalLogo",
                                          idx,
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* =================================
                                  AWAY TEAM
                              ================================= */}

                            <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>

                                <p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                                  Equipo Visitante
                                </p>
                              </div>

                              <div className="space-y-4">
                                <input
                                  type="text"
                                  placeholder="Nombre del equipo visitante"
                                  value={p.equipoVisitanteNombre}
                                  onChange={(e) =>
                                    updatePartido(
                                      idx,
                                      "equipoVisitanteNombre",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                                />

                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden rounded-sm">
                                    {p.equipoVisitanteLogo ? (
                                      <img
                                        src={getImageUrl(p.equipoVisitanteLogo)}
                                        alt="Logo equipo visitante"
                                        className="w-full h-full object-contain p-2"
                                      />
                                    ) : (
                                      <span className="text-zinc-700 text-[9px] uppercase text-center">
                                        Sin logo
                                      </span>
                                    )}
                                  </div>

                                  <label className="flex-1 cursor-pointer">
                                    <div className="px-4 py-3 bg-zinc-950 border border-zinc-700 hover:border-red-600 text-zinc-300 rounded-sm text-xs text-center transition-colors">
                                      {uploadingLogo ===
                                      `equipoVisitanteLogo-${idx}`
                                        ? "Subiendo..."
                                        : "Subir logo"}
                                    </div>

                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={
                                        uploadingLogo ===
                                        `equipoVisitanteLogo-${idx}`
                                      }
                                      onChange={(e) =>
                                        uploadImage(
                                          e.target.files?.[0],
                                          "equipoVisitanteLogo",
                                          idx,
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* =================================
                              STATUS
                          ================================= */}

                        <div>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                            Estado y retransmisión
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                Estado
                              </label>

                              <select
                                value={p.status}
                                onChange={(e) =>
                                  updatePartido(idx, "status", e.target.value)
                                }
                                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                              >
                                <option value="PROGRAMADO">Programado</option>

                                <option value="FINALIZADO">Finalizado</option>

                                <option value="CANCELADO">Cancelado</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                YouTube
                              </label>

                              <input
                                type="url"
                                placeholder="https://youtube.com/..."
                                value={p.youtubeLink}
                                onChange={(e) =>
                                  updatePartido(
                                    idx,
                                    "youtubeLink",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* =================================
                              SCORE
                          ================================= */}

                        {p.status === "FINALIZADO" && (
                          <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                              Resultado
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                  Puntos Lobos
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={p.lobosScore}
                                  onChange={(e) =>
                                    updatePartido(
                                      idx,
                                      "lobosScore",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="54"
                                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-lg font-bold outline-none focus:border-red-600"
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2">
                                  Puntos Rival
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={p.rivalScore}
                                  onChange={(e) =>
                                    updatePartido(
                                      idx,
                                      "rivalScore",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="48"
                                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-3 rounded-sm text-lg font-bold outline-none focus:border-red-600"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* =================================
                              PREVIEW
                          ================================= */}

                        <div className="border-t border-zinc-800 pt-5">
                          <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-3">
                            Vista previa
                          </p>

                          <div className="bg-black border border-zinc-800 p-4">
                            <div className="text-center mb-4">
                              <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                                {p.diaSemana}
                              </span>

                              {p.fecha && (
                                <span className="text-zinc-600 text-[10px] ml-2">
                                  {p.fecha}
                                </span>
                              )}

                              {p.horario && (
                                <span className="text-red-500 font-bold text-sm ml-2">
                                  · {p.horario}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                              <div className="text-center">
                                <div className="w-14 h-14 mx-auto bg-white flex items-center justify-center">
                                  {p.equipoLocalLogo ? (
                                    <img
                                      src={getImageUrl(p.equipoLocalLogo)}
                                      alt=""
                                      className="w-full h-full object-contain p-1"
                                    />
                                  ) : (
                                    <span className="text-zinc-400 text-[8px]">
                                      LOGO
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-white text-xs font-bold">
                                  {p.equipoLocalNombre || "Lobos Quad Rugby"}
                                </p>
                              </div>

                              <div className="text-zinc-700 font-display">
                                {p.status === "FINALIZADO" &&
                                p.lobosScore !== "" &&
                                p.rivalScore !== ""
                                  ? `${p.lobosScore} - ${p.rivalScore}`
                                  : "VS"}
                              </div>

                              <div className="text-center">
                                <div className="w-14 h-14 mx-auto bg-white flex items-center justify-center">
                                  {p.equipoVisitanteLogo ? (
                                    <img
                                      src={getImageUrl(p.equipoVisitanteLogo)}
                                      alt=""
                                      className="w-full h-full object-contain p-1"
                                    />
                                  ) : (
                                    <span className="text-zinc-400 text-[8px]">
                                      LOGO
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 text-white text-xs font-bold">
                                  {p.equipoVisitanteNombre ||
                                    "Equipo visitante"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* =========================================
                  SAVE
              ========================================= */}

              <div className="flex flex-col md:flex-row gap-3 pt-5 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-500 transition-colors rounded-sm"
                >
                  {editingId ? "Guardar Cambios" : "Crear Jornada"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3.5 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {itemToDelete && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <Icon
                path="M12 9v3.75m0 3h.007M10.29 3.86l-7.82 13.5A1.5 1.5 0 003.77 19.6h16.46a1.5 1.5 0 001.3-2.24l-7.82-13.5a1.5 1.5 0 00-2.6 0z"
                className="w-6 h-6 text-red-500"
              />
            </div>

            <h3 className="font-display text-xl text-white mb-2">
              Confirmar Eliminación
            </h3>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              ¿Está seguro de que desea eliminar esta jornada? También se
              eliminarán todos los partidos asociados.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase text-sm rounded-sm hover:bg-zinc-700"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-sm rounded-sm hover:bg-red-500"
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

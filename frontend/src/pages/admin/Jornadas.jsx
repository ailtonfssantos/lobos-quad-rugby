import { useEffect, useState } from "react";
import { getImageUrl } from "../../config";

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const createEmptyPartido = () => ({
  fecha: "",
  diaSemana: "Sábado",
  horario: "",
  rival: "",
  rivalLogo: "",
  equipoLocalNombre: "Lobos Quad Rugby",
  equipoLocalLogo: "",
  equipoVisitanteNombre: "",
  equipoVisitanteLogo: "",
  youtubeLink: "",
  status: "PROGRAMADO",
  lobosScore: "",
  rivalScore: "",
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
    numero: "",
    temporadaId: "",
    competicion: "Liga Nacional",
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

  const API_URL = import.meta.env.VITE_API_URL;

  // =========================================================
  // LÓGICA ORIGINAL — NO MODIFICADA
  // =========================================================

  const getAdminJornadaTitle = (jornada) => {
    const num = String(jornada.numero || "").trim();
    const isAutonomica = jornada.competicion
      ?.toLowerCase()
      .includes("autonómica");
    const isCampeonato = jornada.competicion
      ?.toLowerCase()
      .includes("campeonato");
    const isNumeric = /^\d+$/.test(num);

    if (isAutonomica || isCampeonato || !isNumeric) {
      return num || "Competición";
    }

    return `Jornada ${num}`;
  };

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

  const fetchTemporadas = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/temporadas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

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
    const isActiveMatch =
      activeTab === "activas" ? j.isActive : !j.isActive;

    const temporadaMatch =
      filtroTemporada === "todas" ||
      String(j.temporadaId) === String(filtroTemporada);

    return isActiveMatch && temporadaMatch;
  });

  const normalizePartido = (partido = {}) => ({
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
      partido.equipoLocal?.logo ||
      partido.equipoLocalLogo ||
      "",
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
  });

  const openModal = (jornada = null) => {
    if (jornada) {
      setEditingId(jornada.id);

      const partidos = Array.isArray(jornada.partidos)
        ? jornada.partidos.map(normalizePartido)
        : [];

      while (partidos.length < 3) {
        partidos.push(createEmptyPartido());
      }

      const cleanBannerUrl = jornada.bannerUrl
        ? String(jornada.bannerUrl).trim()
        : "";

      console.log(
        `[DEBUG] Jornada ${jornada.numero} - Banner URL:`,
        cleanBannerUrl
      );

      setFormData({
        numero: jornada.numero
          ? String(jornada.numero).trim()
          : "1",
        temporadaId: jornada.temporadaId
          ? String(jornada.temporadaId)
          : "",
        competicion:
          jornada.competicion || "Liga Nacional",
        ciudad: jornada.ciudad || "",
        pabellon: jornada.pabellon || "",
        fechas: jornada.fechas || "",
        bannerUrl: cleanBannerUrl,
        partidos,
      });
    } else {
      setEditingId(null);

      setFormData({
        numero: "1",
        temporadaId: "",
        competicion: "Liga Nacional",
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

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setUploadingLogo(null);
  };

  const uploadImage = async (file, type, index = null) => {
    if (!file) return;

    const uploadKey =
      index === null ? type : `${type}-${index}`;

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

      if (type === "banner") {
        setFormData((prev) => ({
          ...prev,
          bannerUrl: data.url,
        }));
      }

      if (
        type === "equipoLocalLogo" &&
        index !== null
      ) {
        updatePartido(
          index,
          "equipoLocalLogo",
          data.url
        );
      }

      if (
        type === "equipoVisitanteLogo" &&
        index !== null
      ) {
        updatePartido(
          index,
          "equipoVisitanteLogo",
          data.url
        );

        updatePartido(
          index,
          "rivalLogo",
          data.url
        );
      }
    } catch (error) {
      console.error(
        "Error al subir imagen:",
        error
      );

      alert("No se pudo subir la imagen.");
    } finally {
      setUploadingLogo(null);
    }
  };

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

  const updateJornada = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

  const updatePartido = (index, field, value) => {
    setFormData((prev) => {
      const partidos = [...prev.partidos];

      partidos[index] = {
        ...partidos[index],
        [field]: value,
      };

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

  const addPartido = () =>
    setFormData((prev) => ({
      ...prev,
      partidos: [
        ...prev.partidos,
        createEmptyPartido(),
      ],
    }));

  const removePartido = (index) => {
    if (formData.partidos.length <= 1) {
      alert(
        "Una jornada debe tener al menos un partido."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      partidos: prev.partidos.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const movePartidoUp = (index) => {
    if (index === 0) return;

    setFormData((prev) => {
      const partidos = [...prev.partidos];

      [
        partidos[index - 1],
        partidos[index],
      ] = [
        partidos[index],
        partidos[index - 1],
      ];

      return {
        ...prev,
        partidos,
      };
    });
  };

  const movePartidoDown = (index) => {
    if (
      index ===
      formData.partidos.length - 1
    ) {
      return;
    }

    setFormData((prev) => {
      const partidos = [...prev.partidos];

      [
        partidos[index],
        partidos[index + 1],
      ] = [
        partidos[index + 1],
        partidos[index],
      ];

      return {
        ...prev,
        partidos,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const partidosValidos =
      formData.partidos.filter(
        (p) =>
          p.equipoVisitanteNombre ||
          p.rival ||
          p.horario ||
          p.fecha
      );

    const partidosFinales =
      partidosValidos.map((p) => ({
        ...p,
        equipoLocal: {
          nombre:
            p.equipoLocalNombre ||
            "Lobos Quad Rugby",
          logo: p.equipoLocalLogo || "",
        },
        equipoVisitante: {
          nombre:
            p.equipoVisitanteNombre ||
            p.rival ||
            "",
          logo:
            p.equipoVisitanteLogo ||
            p.rivalLogo ||
            "",
        },
        rival:
          p.equipoVisitanteNombre ||
          p.rival ||
          "",
        rivalLogo:
          p.equipoVisitanteLogo ||
          p.rivalLogo ||
          "",
      }));

    const numeroStr = formData.numero
      ? String(formData.numero).trim()
      : "1";

    const payload = {
      ...formData,
      numero: numeroStr,
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

        throw new Error(
          errorText ||
            `Error HTTP: ${res.status}`
        );
      }

      closeModal();
      await fetchJornadas();
    } catch (error) {
      console.error(
        "Error al guardar jornada:",
        error
      );

      alert(
        "No se pudo guardar la jornada: " +
          error.message
      );
    }
  };

  const toggleActiva = async (
    id,
    currentStatus
  ) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/api/jornadas/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Error HTTP: ${res.status}`
        );
      }

      fetchJornadas();
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/api/jornadas/${itemToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `Error HTTP: ${res.status}`
        );
      }

      await fetchJornadas();
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo eliminar la jornada."
      );
    }
  };

  const getYearSuffix = (temporadaNome) => {
    if (!temporadaNome) return "";

    const match =
      temporadaNome.match(
        /(\d{4})-(\d{4})/
      );

    if (match) {
      return `${match[1].slice(
        2
      )}/${match[2].slice(2)}`;
    }

    return "";
  };

  const selectedTemporada = temporadas.find(
    (t) => t.id === formData.temporadaId
  );

  const compSuffix = getYearSuffix(
    selectedTemporada?.nome
  )
    ? ` ${getYearSuffix(
        selectedTemporada?.nome
      )}`
    : "";

  // =========================================================
  // UI
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 border-2 border-zinc-800 border-t-red-600 rounded-full animate-spin" />

          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.25em] mt-5">
            Cargando jornadas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-red-600" />

            <p className="text-red-500 text-[10px] uppercase tracking-[0.25em] font-bold">
              Gestión de Calendario
            </p>
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">
            Jornadas
          </h1>

          <p className="text-zinc-500 text-sm mt-2 max-w-2xl leading-relaxed">
            Administre jornadas, partidos, equipos,
            logos, horarios y retransmisiones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="group inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-red-500 transition-all duration-200 rounded-sm shadow-lg shadow-red-950/20"
        >
          <Icon
            path="M12 4.5v15m7.5-7.5h-15"
            className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200"
          />
          Nueva Jornada
        </button>
      </div>

      {/* =====================================================
          FILTER
      ====================================================== */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center">
              <Icon
                path="M12 6v6l4 2"
                className="w-4 h-4 text-red-500"
              />
            </div>

            <div>
              <p className="text-zinc-300 text-[10px] uppercase tracking-[0.18em] font-bold">
                Filtrar por temporada
              </p>

              <p className="text-zinc-600 text-[10px] mt-0.5">
                Seleccione una temporada para filtrar las jornadas
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <select
            value={filtroTemporada}
            onChange={(e) =>
              setFiltroTemporada(
                e.target.value
              )
            }
            className="appearance-none bg-zinc-950 border border-zinc-800 text-white px-4 py-3 pr-10 rounded-sm text-[10px] font-bold uppercase tracking-[0.12em] focus:border-red-600 outline-none cursor-pointer hover:border-zinc-600 transition-colors w-full md:w-80"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition:
                "right 0.75rem center",
              backgroundRepeat:
                "no-repeat",
              backgroundSize: "1rem 1rem",
            }}
          >
            <option value="todas">
              Todas las temporadas
            </option>

            {temporadas.map((temp) => (
              <option
                key={temp.id}
                value={temp.id}
              >
                {temp.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
          TABS
      ====================================================== */}
      <div className="border-b border-zinc-800">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() =>
              setActiveTab("activas")
            }
            className={`relative px-5 md:px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
              activeTab === "activas"
                ? "text-white"
                : "text-zinc-600 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeTab === "activas"
                    ? "bg-red-500"
                    : "bg-zinc-700"
                }`}
              />

              Jornadas Activas
            </span>

            {activeTab === "activas" && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-red-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("historico")
            }
            className={`relative px-5 md:px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
              activeTab === "historico"
                ? "text-white"
                : "text-zinc-600 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeTab === "historico"
                    ? "bg-red-500"
                    : "bg-zinc-700"
                }`}
              />

              Histórico
            </span>

            {activeTab === "historico" && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-red-600" />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {displayedJornadas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="p-14 md:p-20 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-600/5 border border-zinc-800 rounded-sm" />

              <div className="absolute inset-2 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center">
                <Icon
                  path="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                  className="w-5 h-5 text-zinc-600"
                />
              </div>
            </div>

            <p className="text-white font-medium mb-2">
              No hay jornadas disponibles
            </p>

            <p className="text-zinc-600 text-sm mb-7 max-w-md mx-auto leading-relaxed">
              No hay jornadas que coincidan con los
              filtros seleccionados.
            </p>

            {activeTab === "activas" && (
              <button
                type="button"
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-red-500 transition-colors rounded-sm shadow-lg shadow-red-950/20"
              >
                <Icon
                  path="M12 4.5v15m7.5-7.5h-15"
                  className="w-4 h-4"
                />
                Crear Primera Jornada
              </button>
            )}
          </div>
        </div>
      ) : (
        /* =====================================================
           TABLE
        ====================================================== */
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />

              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.18em]">
                {activeTab === "activas"
                  ? "Jornadas Activas"
                  : "Histórico de Jornadas"}
              </span>
            </div>

            <span className="text-zinc-600 text-[9px] uppercase tracking-wider">
              {displayedJornadas.length}{" "}
              {displayedJornadas.length === 1
                ? "jornada"
                : "jornadas"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1150px]">
              <thead className="bg-zinc-950/70 border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                    Jornada
                  </th>

                  <th className="px-5 py-3.5 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                    Temporada
                  </th>

                  <th className="px-5 py-3.5 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                    Ubicación
                  </th>

                  <th className="px-5 py-3.5 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                    Partidos
                  </th>

                  <th className="px-5 py-3.5 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                    Estado
                  </th>

                  <th className="px-5 py-3.5 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {displayedJornadas.map((j) => {
                  const estadoTemporada =
                    j.temporada?.estado ||
                    "ACTIVA";

                  const temporadaNombre =
                    j.temporada?.nome ||
                    "Sin temporada";

                  return (
                    <tr
                      key={j.id}
                      className="group hover:bg-zinc-800/20 transition-colors"
                    >
                      {/* JORNADA */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="relative mt-0.5 w-1 h-10 bg-red-600 rounded-full shrink-0 overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-3 bg-red-400/60" />
                          </div>

                          <div>
                            <p className="text-white font-bold text-sm leading-tight">
                              {getAdminJornadaTitle(j)}
                            </p>

                            <p className="text-zinc-600 text-[9px] uppercase tracking-[0.14em] mt-1.5">
                              {j.competicion}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* TEMPORADA */}
                      <td className="px-5 py-5 align-top">
                        <span className="inline-flex items-center px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-[0.12em] rounded-sm">
                          {temporadaNombre}
                        </span>
                      </td>

                      {/* UBICACIÓN */}
                      <td className="px-5 py-5 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon
                              path="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
                              className="w-3.5 h-3.5 text-red-500/70"
                            />

                            <p className="text-zinc-300 text-xs">
                              {j.ciudad || "—"}
                            </p>
                          </div>

                          <p className="text-zinc-600 text-[10px] pl-5">
                            {j.pabellon || "—"}
                          </p>
                        </div>
                      </td>

                      {/* PARTIDOS */}
                      <td className="px-5 py-5 align-top">
                        <div className="space-y-3.5">
                          {(j.partidos || []).map(
                            (p, idx) => {
                              const local =
                                p.equipoLocal
                                  ?.nombre ||
                                p.equipoLocalNombre ||
                                "Lobos Quad Rugby";

                              const visitante =
                                p.equipoVisitante
                                  ?.nombre ||
                                p.equipoVisitanteNombre ||
                                p.rival ||
                                "—";

                              return (
                                <div
                                  key={idx}
                                  className="min-w-[300px] border-l border-zinc-800 pl-3 group/match"
                                >
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-zinc-700 text-[8px] font-bold uppercase tracking-wider">
                                      Partido{" "}
                                      {String(
                                        idx + 1
                                      ).padStart(
                                        2,
                                        "0"
                                      )}
                                    </span>

                                    {p.status ===
                                      "FINALIZADO" && (
                                      <span className="inline-flex items-center gap-1 text-green-500 text-[8px] font-bold uppercase tracking-wider">
                                        <span className="w-1 h-1 rounded-full bg-green-500" />
                                        Finalizado
                                      </span>
                                    )}

                                    {p.status ===
                                      "CANCELADO" && (
                                      <span className="inline-flex items-center gap-1 text-red-500 text-[8px] font-bold uppercase tracking-wider">
                                        <span className="w-1 h-1 rounded-full bg-red-500" />
                                        Cancelado
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-zinc-600 text-[9px] mb-1">
                                    {p.fecha && (
                                      <>
                                        {p.fecha}{" "}
                                        ·{" "}
                                      </>
                                    )}

                                    {p.diaSemana}

                                    {p.horario && (
                                      <span className="text-red-500 ml-1 font-bold">
                                        {p.horario}
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-zinc-300 text-[11px]">
                                    {local}

                                    <span className="text-zinc-700 mx-2">
                                      vs
                                    </span>

                                    {visitante}
                                  </div>

                                  {p.status ===
                                    "FINALIZADO" && (
                                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-green-500 font-bold text-[11px]">
                                      <span className="text-zinc-700">
                                        Resultado
                                      </span>

                                      {p.lobosScore}{" "}
                                      -{" "}
                                      {p.rivalScore}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="px-5 py-5 align-top">
                        <span
                          className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] rounded-full border ${
                            estadoTemporada ===
                            "ACTIVA"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-zinc-950 text-zinc-600 border-zinc-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              estadoTemporada ===
                              "ACTIVA"
                                ? "bg-green-500"
                                : "bg-zinc-700"
                            }`}
                          />

                          {estadoTemporada ===
                          "ACTIVA"
                            ? "Activa"
                            : "Finalizada"}
                        </span>
                      </td>

                      {/* ACCIONES */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() =>
                              openModal(j)
                            }
                            className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded-sm transition-all"
                            title="Editar"
                          >
                            <Icon
                              path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                              className="w-4 h-4"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleActiva(
                                j.id,
                                j.isActive
                              )
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-sm border border-transparent transition-all ${
                              j.isActive
                                ? "text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/10"
                                : "text-green-500 hover:bg-green-500/10 hover:border-green-500/10"
                            }`}
                            title={
                              j.isActive
                                ? "Archivar"
                                : "Reactivar"
                            }
                          >
                            <Icon
                              path={
                                j.isActive
                                  ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  : "M4 4v5h.582A8.001 8.001 0 0020 9m0 0H15m5 11v-5h-.581A8.003 8.003 0 014 15m0 0h5"
                              }
                              className="w-4 h-4"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setItemToDelete(
                                j.id
                              )
                            }
                            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-sm transition-all"
                            title="Eliminar"
                          >
                            <Icon
                              path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL — CREAR / EDITAR
      ====================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-5 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-5xl w-full my-4 md:my-8 shadow-2xl shadow-black/50 overflow-hidden">
            {/* HEADER MODAL */}
            <div className="px-5 md:px-7 py-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-md z-20">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-px bg-red-600" />

                  <p className="text-red-500 text-[9px] uppercase tracking-[0.25em] font-bold">
                    Gestión de Calendario
                  </p>
                </div>

                <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight">
                  {editingId
                    ? "Editar Jornada"
                    : "Nueva Jornada"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded-sm transition-all"
                title="Cerrar"
              >
                <Icon
                  path="M6 18L18 6M6 6l12 12"
                  className="w-5 h-5"
                />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 md:p-7 space-y-10 max-h-[78vh] overflow-y-auto"
            >
              {/* =================================================
                  INFORMACIÓN GENERAL
              ================================================== */}
              <section>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 bg-red-600/10 border border-red-600/20 rounded-sm flex items-center justify-center shrink-0">
                      <Icon
                        path="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                        className="w-4 h-4 text-red-500"
                      />
                    </div>

                    <div>
                      <p className="text-red-500 text-[9px] uppercase tracking-[0.22em] font-bold">
                        Información general
                      </p>

                      <h3 className="font-display text-xl text-white mt-1">
                        Datos de la Jornada
                      </h3>

                      <p className="text-zinc-600 text-xs mt-1">
                        Información principal de la jornada y competición.
                      </p>
                    </div>
                  </div>

                  <span className="hidden md:inline-flex px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-600 text-[8px] uppercase tracking-[0.16em] font-bold rounded-sm">
                    Información
                  </span>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-red-600/70 via-red-600/10 to-transparent" />

                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-2">
                          Número de Jornada / Identificador *
                        </label>

                        <input
                          type="text"
                          value={formData.numero}
                          onChange={(e) =>
                            updateJornada(
                              "numero",
                              e.target.value
                            )
                          }
                          required
                          placeholder="Ej: 1, 2, 3 o Campeonato de España"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm text-sm focus:border-red-600 hover:border-zinc-700 outline-none transition-colors placeholder:text-zinc-700"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-2">
                          Temporada *
                        </label>

                        <select
                          value={formData.temporadaId}
                          onChange={(e) =>
                            updateJornada(
                              "temporadaId",
                              e.target.value
                            )
                          }
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm text-sm focus:border-red-600 hover:border-zinc-700 outline-none transition-colors"
                        >
                          <option value="">
                            Seleccionar temporada
                          </option>

                          {temporadas.map(
                            (temporada) => (
                              <option
                                key={temporada.id}
                                value={temporada.id}
                              >
                                {temporada.nome}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-2">
                          Competición *
                        </label>

                        <select
                          value={formData.competicion}
                          onChange={(e) =>
                            updateJornada(
                              "competicion",
                              e.target.value
                            )
                          }
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm text-sm focus:border-red-600 hover:border-zinc-700 outline-none transition-colors"
                        >
                          <option
                            value={`Liga Nacional${compSuffix}`}
                          >
                            Liga Nacional
                            {compSuffix}
                          </option>

                          <option
                            value={`Competición Autonómica${compSuffix}`}
                          >
                            Competición Autonómica
                            {compSuffix}
                          </option>

                          <option
                            value={`Copa${compSuffix}`}
                          >
                            Copa{compSuffix}
                          </option>

                          <option
                            value={`Amistoso${compSuffix}`}
                          >
                            Amistoso{compSuffix}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-2">
                          Ciudad *
                        </label>

                        <input
                          type="text"
                          value={formData.ciudad}
                          onChange={(e) =>
                            updateJornada(
                              "ciudad",
                              e.target.value
                            )
                          }
                          required
                          placeholder="Valencia"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm text-sm focus:border-red-600 hover:border-zinc-700 outline-none transition-colors placeholder:text-zinc-700"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-2">
                          Pabellón *
                        </label>

                        <input
                          type="text"
                          value={formData.pabellon}
                          onChange={(e) =>
                            updateJornada(
                              "pabellon",
                              e.target.value
                            )
                          }
                          required
                          placeholder="Pabellón Municipal..."
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm text-sm focus:border-red-600 hover:border-zinc-700 outline-none transition-colors placeholder:text-zinc-700"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-2">
                          Fechas de la Jornada *
                        </label>

                        <input
                          type="text"
                          value={formData.fechas}
                          onChange={(e) =>
                            updateJornada(
                              "fechas",
                              e.target.value
                            )
                          }
                          required
                          placeholder="10 y 11 de octubre de 2026"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm text-sm focus:border-red-600 hover:border-zinc-700 outline-none transition-colors placeholder:text-zinc-700"
                        />

                        <p className="mt-2 text-[9px] text-zinc-700">
                          Ejemplo: 10 y 11 de octubre de 2026
                        </p>
                      </div>

                      {/* BANNER */}
                      <div className="md:col-span-2 pt-1">
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-[0.16em] font-bold mb-3">
                          Banner de la Jornada
                        </label>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
                          <div className="flex flex-col md:flex-row md:items-center gap-5">
                            {formData.bannerUrl ? (
                              <div className="relative w-full md:w-72 h-28 bg-black border border-zinc-800 rounded-sm overflow-hidden">
                                <img
                                  src={getImageUrl(
                                    formData.bannerUrl
                                  )}
                                  alt="Banner"
                                  className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute left-3 bottom-2">
                                  <span className="text-white/70 text-[8px] uppercase tracking-[0.18em]">
                                    Banner
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full md:w-72 h-28 bg-black border border-dashed border-zinc-800 rounded-sm flex items-center justify-center">
                                <div className="text-center">
                                  <Icon
                                    path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    className="w-6 h-6 text-zinc-700 mx-auto mb-2"
                                  />

                                  <span className="text-zinc-700 text-[8px] uppercase tracking-[0.16em]">
                                    Sin banner
                                  </span>
                                </div>
                              </div>
                            )}

                            <label className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-950 border border-zinc-800 hover:border-red-600 hover:text-white text-zinc-500 cursor-pointer rounded-sm text-[10px] font-bold uppercase tracking-[0.14em] transition-all">
                              <Icon
                                path="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                                className="w-4 h-4"
                              />

                              {uploadingBanner
                                ? "Subiendo..."
                                : "Elegir Imagen"}

                              <input
                                type="file"
                                accept="image/*"
                                onChange={
                                  handleBannerUpload
                                }
                                className="hidden"
                                disabled={
                                  uploadingBanner
                                }
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PARTIDOS
              ================================================== */}
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center shrink-0">
                      <Icon
                        path="M15 7a3 3 0 11-6 0 3 3 0 016 0zM4 21a8 8 0 0116 0"
                        className="w-4 h-4 text-red-500"
                      />
                    </div>

                    <div>
                      <p className="text-red-500 text-[9px] uppercase tracking-[0.22em] font-bold">
                        Calendario
                      </p>

                      <h3 className="font-display text-xl text-white mt-1">
                        Partidos de la Jornada
                      </h3>

                      <p className="text-zinc-600 text-xs mt-1">
                        Configure los enfrentamientos,
                        horarios, equipos y resultados.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addPartido}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.14em] hover:border-red-600 hover:text-white transition-all rounded-sm"
                  >
                    <Icon
                      path="M12 4.5v15m7.5-7.5h-15"
                      className="w-4 h-4"
                    />
                    Añadir Partido
                  </button>
                </div>

                <div className="space-y-5">
                  {formData.partidos.map(
                    (p, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden"
                      >
                        {/* PARTIDO HEADER */}
                        <div className="relative px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600" />

                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600/10 border border-red-600/20 rounded-sm flex items-center justify-center">
                              <span className="text-red-500 text-[9px] font-bold tracking-wider">
                                {String(
                                  idx + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>
                            </div>

                            <div>
                              <p className="text-white text-[10px] font-bold uppercase tracking-[0.14em]">
                                Partido {idx + 1}
                              </p>

                              <p className="text-zinc-700 text-[8px] uppercase tracking-[0.14em] mt-1">
                                Configuración del encuentro
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                movePartidoUp(
                                  idx
                                )
                              }
                              disabled={idx === 0}
                              className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-sm transition-colors"
                              title="Mover arriba"
                            >
                              <Icon
                                path="M5 15l7-7 7 7"
                                className="w-4 h-4"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                movePartidoDown(
                                  idx
                                )
                              }
                              disabled={
                                idx ===
                                formData
                                  .partidos
                                  .length -
                                  1
                              }
                              className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent rounded-sm transition-colors"
                              title="Mover abajo"
                            >
                              <Icon
                                path="M19 9l-7 7-7-7"
                                className="w-4 h-4"
                              />
                            </button>

                            <div className="w-px h-5 bg-zinc-800 mx-1" />

                            <button
                              type="button"
                              onClick={() =>
                                removePartido(
                                  idx
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-colors"
                              title="Eliminar partido"
                            >
                              <Icon
                                path="M6 18L18 6M6 6l12 12"
                                className="w-4 h-4"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="p-5 space-y-8">
                          {/* FECHA / HORA */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-1 h-1 bg-red-600 rounded-full" />

                              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.18em] font-bold">
                                Fecha y horario
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                  Fecha del partido *
                                </label>

                                <input
                                  type="date"
                                  value={
                                    p.fecha
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePartido(
                                      idx,
                                      "fecha",
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                  Día de la semana
                                </label>

                                <select
                                  value={
                                    p.diaSemana
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePartido(
                                      idx,
                                      "diaSemana",
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors"
                                >
                                  <option>
                                    Sábado
                                  </option>
                                  <option>
                                    Domingo
                                  </option>
                                  <option>
                                    Viernes
                                  </option>
                                  <option>
                                    Lunes
                                  </option>
                                  <option>
                                    Martes
                                  </option>
                                  <option>
                                    Miércoles
                                  </option>
                                  <option>
                                    Jueves
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                  Hora *
                                </label>

                                <input
                                  type="time"
                                  value={
                                    p.horario
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePartido(
                                      idx,
                                      "horario",
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors"
                                />
                              </div>
                            </div>
                          </div>

                          {/* EQUIPOS */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-1 h-1 bg-red-600 rounded-full" />

                              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.18em] font-bold">
                                Equipos
                              </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* LOCAL */}
                              <div className="border border-zinc-800 bg-zinc-900/60 rounded-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />

                                    <p className="text-zinc-300 text-[9px] font-bold uppercase tracking-[0.14em]">
                                      Equipo Local
                                    </p>
                                  </div>

                                  <span className="text-red-500/70 text-[8px] uppercase font-bold tracking-wider">
                                    Local
                                  </span>
                                </div>

                                <div className="p-4 space-y-4">
                                  <input
                                    type="text"
                                    placeholder="Nombre del equipo local"
                                    value={
                                      p.equipoLocalNombre
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updatePartido(
                                        idx,
                                        "equipoLocalNombre",
                                        e.target
                                          .value
                                      )
                                    }
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors placeholder:text-zinc-700"
                                  />

                                  <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
                                      {p.equipoLocalLogo ? (
                                        <img
                                          src={getImageUrl(
                                            p.equipoLocalLogo
                                          )}
                                          alt="Logo equipo local"
                                          className="w-full h-full object-contain p-2"
                                        />
                                      ) : (
                                        <span className="text-zinc-700 text-[8px] uppercase text-center tracking-wider">
                                          Sin logo
                                        </span>
                                      )}
                                    </div>

                                    <label className="flex-1 cursor-pointer">
                                      <div className="px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-red-600 hover:text-white text-zinc-500 rounded-sm text-[9px] font-bold uppercase tracking-[0.14em] text-center transition-all">
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
                                        onChange={(
                                          e
                                        ) =>
                                          uploadImage(
                                            e.target
                                              .files?.[0],
                                            "equipoLocalLogo",
                                            idx
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* VISITANTE */}
                              <div className="border border-zinc-800 bg-zinc-900/60 rounded-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />

                                    <p className="text-zinc-300 text-[9px] font-bold uppercase tracking-[0.14em]">
                                      Equipo Visitante
                                    </p>
                                  </div>

                                  <span className="text-zinc-600 text-[8px] uppercase font-bold tracking-wider">
                                    Visitante
                                  </span>
                                </div>

                                <div className="p-4 space-y-4">
                                  <input
                                    type="text"
                                    placeholder="Nombre del equipo visitante"
                                    value={
                                      p.equipoVisitanteNombre
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updatePartido(
                                        idx,
                                        "equipoVisitanteNombre",
                                        e.target
                                          .value
                                      )
                                    }
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors placeholder:text-zinc-700"
                                  />

                                  <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden rounded-sm shrink-0">
                                      {p.equipoVisitanteLogo ? (
                                        <img
                                          src={getImageUrl(
                                            p.equipoVisitanteLogo
                                          )}
                                          alt="Logo equipo visitante"
                                          className="w-full h-full object-contain p-2"
                                        />
                                      ) : (
                                        <span className="text-zinc-700 text-[8px] uppercase text-center tracking-wider">
                                          Sin logo
                                        </span>
                                      )}
                                    </div>

                                    <label className="flex-1 cursor-pointer">
                                      <div className="px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-red-600 hover:text-white text-zinc-500 rounded-sm text-[9px] font-bold uppercase tracking-[0.14em] text-center transition-all">
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
                                        onChange={(
                                          e
                                        ) =>
                                          uploadImage(
                                            e.target
                                              .files?.[0],
                                            "equipoVisitanteLogo",
                                            idx
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ESTADO / YOUTUBE */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-1 h-1 bg-red-600 rounded-full" />

                              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.18em] font-bold">
                                Estado y retransmisión
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                  Estado
                                </label>

                                <select
                                  value={
                                    p.status
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePartido(
                                      idx,
                                      "status",
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors"
                                >
                                  <option value="PROGRAMADO">
                                    Programado
                                  </option>

                                  <option value="FINALIZADO">
                                    Finalizado
                                  </option>

                                  <option value="CANCELADO">
                                    Cancelado
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                  YouTube
                                </label>

                                <input
                                  type="url"
                                  placeholder="https://youtube.com/..."
                                  value={
                                    p.youtubeLink
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePartido(
                                      idx,
                                      "youtubeLink",
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-sm outline-none focus:border-red-600 hover:border-zinc-700 transition-colors placeholder:text-zinc-700"
                                />
                              </div>
                            </div>
                          </div>

                          {/* RESULTADO */}
                          {p.status ===
                            "FINALIZADO" && (
                            <div className="border border-green-500/20 bg-green-500/[0.025] rounded-sm overflow-hidden">
                              <div className="px-4 py-3 border-b border-green-500/10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />

                                <p className="text-green-500 text-[9px] font-bold uppercase tracking-[0.16em]">
                                  Resultado Final
                                </p>
                              </div>

                              <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                      Puntos Equipo Local
                                    </label>

                                    <input
                                      type="number"
                                      min="0"
                                      value={
                                        p.lobosScore
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updatePartido(
                                          idx,
                                          "lobosScore",
                                          e.target
                                            .value
                                        )
                                      }
                                      placeholder="54"
                                      className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-xl font-bold outline-none focus:border-green-500 placeholder:text-zinc-800"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-zinc-600 text-[9px] uppercase tracking-[0.14em] mb-2">
                                      Puntos Equipo Visitante
                                    </label>

                                    <input
                                      type="number"
                                      min="0"
                                      value={
                                        p.rivalScore
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updatePartido(
                                          idx,
                                          "rivalScore",
                                          e.target
                                            .value
                                        )
                                      }
                                      placeholder="48"
                                      className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-3 rounded-sm text-xl font-bold outline-none focus:border-green-500 placeholder:text-zinc-800"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* PREVIEW */}
                          <div className="border-t border-zinc-800 pt-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-red-600 rounded-full" />

                                <p className="text-zinc-500 text-[9px] uppercase tracking-[0.18em] font-bold">
                                  Vista previa
                                </p>
                              </div>

                              <span className="text-zinc-700 text-[8px] uppercase tracking-[0.16em]">
                                Preview
                              </span>
                            </div>

                            <div className="relative bg-black border border-zinc-800 rounded-sm overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />

                              <div className="px-5 py-4 border-b border-zinc-900 text-center">
                                <span className="text-zinc-500 text-[9px] uppercase tracking-[0.14em]">
                                  {p.diaSemana}
                                </span>

                                {p.fecha && (
                                  <span className="text-zinc-600 text-[9px] ml-2">
                                    {p.fecha}
                                  </span>
                                )}

                                {p.horario && (
                                  <span className="text-red-500 font-bold text-sm ml-2">
                                    ·{" "}
                                    {p.horario}
                                  </span>
                                )}
                              </div>

                              <div className="p-6">
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
                                  {/* LOCAL */}
                                  <div className="text-center min-w-0">
                                    <div className="w-16 h-16 mx-auto bg-white flex items-center justify-center rounded-sm overflow-hidden border border-zinc-700">
                                      {p.equipoLocalLogo ? (
                                        <img
                                          src={getImageUrl(
                                            p.equipoLocalLogo
                                          )}
                                          alt=""
                                          className="w-full h-full object-contain p-1"
                                        />
                                      ) : (
                                        <span className="text-zinc-400 text-[8px] uppercase">
                                          Logo
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-3 text-white text-xs font-bold truncate max-w-[130px] mx-auto">
                                      {p.equipoLocalNombre ||
                                        "Lobos Quad Rugby"}
                                    </p>

                                    <p className="text-red-500/60 text-[8px] uppercase tracking-[0.14em] mt-1">
                                      Local
                                    </p>
                                  </div>

                                  {/* VS / SCORE */}
                                  <div className="text-center">
                                    <div className="text-zinc-500 font-display text-xl md:text-2xl whitespace-nowrap">
                                      {p.status ===
                                        "FINALIZADO" &&
                                      p.lobosScore !==
                                        "" &&
                                      p.rivalScore !==
                                        ""
                                        ? `${p.lobosScore} - ${p.rivalScore}`
                                        : "VS"}
                                    </div>

                                    {p.status ===
                                      "FINALIZADO" && (
                                      <span className="text-green-500 text-[8px] uppercase tracking-[0.14em]">
                                        Finalizado
                                      </span>
                                    )}
                                  </div>

                                  {/* VISITANTE */}
                                  <div className="text-center min-w-0">
                                    <div className="w-16 h-16 mx-auto bg-white flex items-center justify-center rounded-sm overflow-hidden border border-zinc-700">
                                      {p.equipoVisitanteLogo ? (
                                        <img
                                          src={getImageUrl(
                                            p.equipoVisitanteLogo
                                          )}
                                          alt=""
                                          className="w-full h-full object-contain p-1"
                                        />
                                      ) : (
                                        <span className="text-zinc-400 text-[8px] uppercase">
                                          Logo
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-3 text-white text-xs font-bold truncate max-w-[130px] mx-auto">
                                      {p.equipoVisitanteNombre ||
                                        "Equipo visitante"}
                                    </p>

                                    <p className="text-zinc-700 text-[8px] uppercase tracking-[0.14em] mt-1">
                                      Visitante
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* =================================================
                  FOOTER
              ================================================== */}
              <div className="flex flex-col md:flex-row gap-3 pt-5 border-t border-zinc-800 sticky bottom-0 bg-zinc-900/95 backdrop-blur-md">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-red-600 text-white font-bold uppercase tracking-[0.14em] text-[10px] hover:bg-red-500 transition-all rounded-sm shadow-lg shadow-red-950/20"
                >
                  {editingId
                    ? "Guardar Cambios"
                    : "Crear Jornada"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3.5 bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-[0.14em] text-[10px] hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all rounded-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}
      {itemToDelete && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() =>
            setItemToDelete(null)
          }
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="h-0.5 bg-red-600" />

            <div className="p-6 md:p-7">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 rounded-sm mx-auto">
                <Icon
                  path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  className="w-6 h-6 text-red-500"
                />
              </div>

              <div className="text-center">
                <p className="text-red-500 text-[9px] uppercase tracking-[0.22em] font-bold mb-2">
                  Acción irreversible
                </p>

                <h3 className="font-display text-xl text-white mb-2">
                  Confirmar Eliminación
                </h3>

                <p className="text-zinc-500 text-sm text-center mb-7 leading-relaxed">
                  ¿Está seguro de que desea eliminar
                  esta jornada? También se eliminarán
                  todos los partidos asociados.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setItemToDelete(null)
                  }
                  className="flex-1 py-3 bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-[0.14em] rounded-sm hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-[10px] tracking-[0.14em] rounded-sm hover:bg-red-500 transition-all"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
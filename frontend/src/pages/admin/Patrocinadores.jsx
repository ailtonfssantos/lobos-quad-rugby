import { useEffect, useState } from 'react';

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

// =========================================================
// FORMATO DE MONEDA
// =========================================================

const formatCurrency = (value) => {
  const numericValue = Number(value) || 0;

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

// =========================================================
// CONVERSIÓN DE VALORES EUROPEOS
// =========================================================

const parseEuropeanNumber = (value) => {
  const valStr = String(value ?? '').trim();

  if (!valStr) return 0;

  let normalized = valStr
    .replace(/\s/g, '')
    .replace(/€/g, '');

  if (normalized.includes(',')) {
    normalized = normalized
      .replace(/\./g, '')
      .replace(',', '.');
  }

  const numericValue = parseFloat(normalized);

  return Number.isNaN(numericValue) ? 0 : numericValue;
};

// =========================================================
// RESUMEN ANUAL DE SUBVENCIONES + PREMIOS
// =========================================================

const calculateTransparencySummaries = (subvenciones, premios) => {
  const years = new Set([
    ...subvenciones.map((item) => String(item.ano)),
    ...premios.map((item) => String(item.ano)),
  ]);

  return [...years]
    .filter((year) => year && year !== 'undefined' && year !== 'null')
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => {
      const subvencionesYear = subvenciones.filter(
        (item) => String(item.ano) === year
      );

      const premiosYear = premios.filter(
        (item) => String(item.ano) === year
      );

      const subvencionesTotal = subvencionesYear.reduce(
        (sum, item) => sum + parseEuropeanNumber(item.valor),
        0
      );

      const premiosTotal = premiosYear.reduce(
        (sum, item) => sum + parseEuropeanNumber(item.valor),
        0
      );

      return {
        year,
        subvencionesTotal,
        premiosTotal,
        total: subvencionesTotal + premiosTotal,
        subvencionesCount: subvencionesYear.length,
        premiosCount: premiosYear.length,
      };
    });
};

// =========================================================
// ESTADO INICIAL SUBVENCIÓN
// =========================================================

const initialSubvencionForm = {
  ano: '',
  valor: '',
  entidad: '',
  fechaConcesion: '',
  tipo: 'Administración',
  ambito: 'Local',
  departamento: '',
  convocatoria: '',
  basesLink: '',
};

// =========================================================
// ESTADO INICIAL PREMIO
// =========================================================

const initialPremioForm = {
  ano: '',
  valor: '',
  entidad: '',
  premio: '',
  descripcion: '',
  logo: '',
};

export default function Patrocinadores() {
  const [activeTab, setActiveTab] = useState('solicitudes');

  // =========================================================
  // SOLICITUDES
  // =========================================================

  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // =========================================================
  // SUBVENCIONES
  // =========================================================

  const [subvenciones, setSubvenciones] = useState([]);
  const [modalSubvencionOpen, setModalSubvencionOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);

  const [formDataSub, setFormDataSub] = useState(
    initialSubvencionForm
  );

  // =========================================================
  // PREMIOS Y RECONOCIMIENTOS
  // =========================================================

  const [premios, setPremios] = useState([]);
  const [modalPremioOpen, setModalPremioOpen] = useState(false);
  const [editingPremioId, setEditingPremioId] = useState(null);

  const [formDataPremio, setFormDataPremio] = useState(
    initialPremioForm
  );

  // =========================================================
  // ELIMINACIÓN UNIFICADA
  // =========================================================

  const [deleteTarget, setDeleteTarget] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  const cargarDatos = async () => {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [
        solicitudesResponse,
        subvencionesResponse,
        premiosResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/patrocinadores`, { headers }),
        fetch(`${API_URL}/api/subvenciones`, { headers }),
        fetch(`${API_URL}/api/premios`, { headers }),
      ]);

      if (solicitudesResponse.ok) {
        const solicitudesData = await solicitudesResponse.json();
        setSolicitudes(
          Array.isArray(solicitudesData) ? solicitudesData : []
        );
      }

      if (subvencionesResponse.ok) {
        const subvencionesData = await subvencionesResponse.json();
        setSubvenciones(
          Array.isArray(subvencionesData) ? subvencionesData : []
        );
      }

      if (premiosResponse.ok) {
        const premiosData = await premiosResponse.json();
        setPremios(
          Array.isArray(premiosData) ? premiosData : []
        );
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // =========================================================
  // SOLICITUDES
  // =========================================================

  const verSolicitud = async (sol) => {
    setSelectedSolicitud(sol);

    if (sol.status === 'PENDIENTE') {
      const token = localStorage.getItem('token');

      await fetch(`${API_URL}/api/patrocinadores/${sol.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'VISTO',
        }),
      });

      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === sol.id
            ? {
                ...s,
                status: 'VISTO',
              }
            : s
        )
      );
    }
  };

  const archivarSolicitud = async (id) => {
    const token = localStorage.getItem('token');

    try {
      await fetch(`${API_URL}/api/patrocinadores/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'ARCHIVADO',
        }),
      });

      setSolicitudes((prev) =>
        prev.filter((s) => s.id !== id)
      );
    } catch (error) {
      console.error('Error al archivar:', error);
    }
  };

  // =========================================================
  // SUBVENCIONES
  // =========================================================

  const abrirNuevaSubvencion = () => {
    setEditingSubId(null);
    setFormDataSub({
      ...initialSubvencionForm,
    });
    setModalSubvencionOpen(true);
  };

  const editarSubvencion = (sub) => {
    setEditingSubId(sub.id);

    setFormDataSub({
      ...initialSubvencionForm,
      ...sub,
    });

    setModalSubvencionOpen(true);
  };

  const guardarSubvencion = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const url = editingSubId
      ? `${API_URL}/api/subvenciones/${editingSubId}`
      : `${API_URL}/api/subvenciones`;

    try {
      const response = await fetch(url, {
        method: editingSubId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataSub),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la subvención');
      }

      setModalSubvencionOpen(false);
      setEditingSubId(null);
      setFormDataSub({
        ...initialSubvencionForm,
      });

      const res = await fetch(
        `${API_URL}/api/subvenciones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();

        setSubvenciones(
          Array.isArray(data) ? data : []
        );
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar la subvención.');
    }
  };

  // =========================================================
  // PREMIOS
  // =========================================================

  const abrirNuevoPremio = () => {
    setEditingPremioId(null);

    setFormDataPremio({
      ...initialPremioForm,
    });

    setModalPremioOpen(true);
  };

  const editarPremio = (premio) => {
    setEditingPremioId(premio.id);

    setFormDataPremio({
      ...initialPremioForm,
      ...premio,
    });

    setModalPremioOpen(true);
  };

  const guardarPremio = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const url = editingPremioId
      ? `${API_URL}/api/premios/${editingPremioId}`
      : `${API_URL}/api/premios`;

    try {
      const response = await fetch(url, {
        method: editingPremioId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataPremio),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el premio');
      }

      setModalPremioOpen(false);
      setEditingPremioId(null);

      setFormDataPremio({
        ...initialPremioForm,
      });

      const res = await fetch(
        `${API_URL}/api/premios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();

        setPremios(
          Array.isArray(data) ? data : []
        );
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar el premio.');
    }
  };

  // =========================================================
  // ELIMINACIÓN
  // =========================================================

  const confirmarDelete = async () => {
    if (!deleteTarget) return;

    const token = localStorage.getItem('token');

    let endpoint = '';

    if (deleteTarget.type === 'solicitud') {
      endpoint = 'patrocinadores';
    }

    if (deleteTarget.type === 'subvencion') {
      endpoint = 'subvenciones';
    }

    if (deleteTarget.type === 'premio') {
      endpoint = 'premios';
    }

    try {
      const response = await fetch(
        `${API_URL}/api/${endpoint}/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      if (deleteTarget.type === 'solicitud') {
        setSolicitudes((prev) =>
          prev.filter(
            (s) => s.id !== deleteTarget.id
          )
        );
      }

      if (deleteTarget.type === 'subvencion') {
        setSubvenciones((prev) =>
          prev.filter(
            (s) => s.id !== deleteTarget.id
          )
        );
      }

      if (deleteTarget.type === 'premio') {
        setPremios((prev) =>
          prev.filter(
            (p) => p.id !== deleteTarget.id
          )
        );
      }

      setDeleteTarget(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('No ha sido posible eliminar el registro.');
    }
  };

  // =========================================================
  // COLORES DE ESTADO
  // =========================================================

  const getStatusColor = (status) => {
    if (status === 'PENDIENTE') {
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }

    if (status === 'VISTO') {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }

    if (status === 'ARCHIVADO') {
      return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }

    if (status === 'APROBADO') {
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    }

    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  // =========================================================
  // RESÚMENES
  // =========================================================

  const yearlySummaries = calculateTransparencySummaries(
    subvenciones,
    premios
  );

  const solicitudesVisibles = solicitudes.filter(
    (s) => s.status !== 'ARCHIVADO'
  );

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">
            Patrocinios y Transparencia
          </h1>

          <p className="text-zinc-500 text-sm">
            Gestione solicitudes de empresas, subvenciones,
            premios y reconocimientos.
          </p>
        </div>
      </div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="flex border-b border-zinc-800 overflow-x-auto">

        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'solicitudes'
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Solicitudes (
          {
            solicitudesVisibles.filter(
              (s) => s.status === 'PENDIENTE'
            ).length
          }{' '}
          pendientes)
        </button>

        <button
          onClick={() => setActiveTab('transparencia')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'transparencia'
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Transparencia
        </button>

      </div>

      {/* =====================================================
          TAB 1 — SOLICITUDES
      ===================================================== */}

      {activeTab === 'solicitudes' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">

          <table className="w-full text-left min-w-[800px]">

            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Empresa
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Contacto
                </th>

                <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                  Modalidad
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

              {solicitudesVisibles.map((sol) => (

                <tr
                  key={sol.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >

                  <td className="px-6 py-4">
                    <p className="text-white font-medium">
                      {sol.companyName}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-zinc-300 text-sm">
                      {sol.contactName}
                    </p>

                    <p className="text-zinc-500 text-xs">
                      {sol.email}
                    </p>
                  </td>

                  <td className="px-6 py-4">

                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                      {sol.sponsorshipType}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                        sol.status
                      )}`}
                    >
                      {sol.status}
                    </span>

                  </td>

                  <td className="px-6 py-4 text-right">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() => verSolicitud(sol)}
                        className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-zinc-700 transition-colors"
                      >
                        Ver
                      </button>

                      {sol.status !== 'ARCHIVADO' && (
                        <button
                          onClick={() =>
                            archivarSolicitud(sol.id)
                          }
                          className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-sm transition-colors"
                          title="Archivar"
                        >
                          <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'solicitud',
                            id: sol.id,
                          })
                        }
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

      {/* =====================================================
          TAB 2 — TRANSPARENCIA
      ===================================================== */}

      {activeTab === 'transparencia' && (
        <>

          {/* =================================================
              RESUMEN ANUAL
          ================================================= */}

          {yearlySummaries.length > 0 && (
            <div className="space-y-4 mb-8">

              <h2 className="font-display text-xl text-white">
                Resumen anual
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {yearlySummaries.map((summary) => (

                  <div
                    key={summary.year}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm"
                  >

                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                      Resumen {summary.year}
                    </p>

                    <div className="space-y-3">

                      <div>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider">
                          Subvenciones
                        </p>

                        <p className="text-green-500 font-bold text-xl">
                          {formatCurrency(
                            summary.subvencionesTotal
                          )}€
                        </p>

                        <p className="text-zinc-600 text-xs">
                          {summary.subvencionesCount}{' '}
                          {summary.subvencionesCount === 1
                            ? 'registro'
                            : 'registros'}
                        </p>
                      </div>

                      <div className="border-t border-zinc-800 pt-3">

                        <p className="text-zinc-500 text-xs uppercase tracking-wider">
                          Premios y reconocimientos
                        </p>

                        <p className="text-yellow-500 font-bold text-xl">
                          {formatCurrency(
                            summary.premiosTotal
                          )}€
                        </p>

                        <p className="text-zinc-600 text-xs">
                          {summary.premiosCount}{' '}
                          {summary.premiosCount === 1
                            ? 'registro'
                            : 'registros'}
                        </p>

                      </div>

                      <div className="border-t border-zinc-800 pt-3">

                        <p className="text-zinc-500 text-xs uppercase tracking-wider">
                          Total ayudas y premios
                        </p>

                        <p className="font-display text-2xl text-white">
                          {formatCurrency(summary.total)}€
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

          {/* =================================================
              SUBVENCIONES
          ================================================= */}

          <div className="space-y-4 mb-10">

            <div className="flex items-center justify-between gap-4 flex-wrap">

              <div>
                <h2 className="font-display text-2xl text-white">
                  SUBVENCIONES RECIBIDAS
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  Gestión de las ayudas económicas recibidas
                  por el club.
                </p>
              </div>

              <button
                onClick={abrirNuevaSubvencion}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm"
              >
                <Icon
                  path="M12 4.5v15m7.5-7.5h-15"
                  className="w-4 h-4"
                />

                Nueva Subvención
              </button>

            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">

              <table className="w-full text-left min-w-[900px]">

                <thead className="bg-zinc-950 border-b border-zinc-800">

                  <tr>

                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                      Año
                    </th>

                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                      Entidad
                    </th>

                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                      Valor
                    </th>

                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                      Tipo / Ámbito
                    </th>

                    <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-zinc-800">

                  {subvenciones.map((sub) => (

                    <tr
                      key={sub.id}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >

                      <td className="px-6 py-4">
                        <p className="text-white font-bold text-lg">
                          {sub.ano}
                        </p>
                      </td>

                      <td className="px-6 py-4">

                        <p className="text-white font-medium">
                          {sub.entidad}
                        </p>

                        <p className="text-zinc-500 text-xs">
                          {sub.departamento}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <p className="text-green-500 font-bold text-lg">
                          {sub.valor}€
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <p className="text-zinc-300 text-sm">
                          {sub.tipo}
                        </p>

                        <p className="text-zinc-500 text-xs">
                          {sub.ambito}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() =>
                              editarSubvencion(sub)
                            }
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
                            title="Editar"
                          >
                            <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'subvencion',
                                id: sub.id,
                              })
                            }
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

          </div>

          {/* =================================================
              PREMIOS
          ================================================= */}

          <div className="space-y-4">

            <div className="flex items-center justify-between gap-4 flex-wrap">

              <div>

                <h2 className="font-display text-2xl text-white">
                  PREMIOS Y RECONOCIMIENTOS
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  Gestión de premios y reconocimientos concedidos al club.
                </p>

              </div>

              <button
                onClick={abrirNuevoPremio}
                className="flex items-center gap-2 px-5 py-2.5 bg-yellow-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-yellow-700 transition-colors rounded-sm"
              >
                <Icon
                  path="M12 4.5v15m7.5-7.5h-15"
                  className="w-4 h-4"
                />

                Nuevo Premio
              </button>

            </div>

            {premios.length === 0 ? (

              <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-10 text-center">

                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">

                  <Icon
                    path="M12 6v12m-6-6h12"
                    className="w-6 h-6 text-zinc-500"
                  />

                </div>

                <h3 className="text-white font-medium mb-1">
                  No hay premios registrados
                </h3>

                <p className="text-zinc-500 text-sm">
                  Añada el primer premio o reconocimiento
                  utilizando el botón anterior.
                </p>

              </div>

            ) : (

              <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto">

                <table className="w-full text-left min-w-[1000px]">

                  <thead className="bg-zinc-950 border-b border-zinc-800">

                    <tr>

                      <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                        Año
                      </th>

                      <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                        Entidad
                      </th>

                      <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                        Premio / Reconocimiento
                      </th>

                      <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">
                        Importe
                      </th>

                      <th className="px-6 py-4 text-zinc-500 text-xs uppercase tracking-wider font-medium text-right">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-zinc-800">

                    {premios.map((premio) => (

                      <tr
                        key={premio.id}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >

                        <td className="px-6 py-4">

                          <p className="text-white font-bold text-lg">
                            {premio.ano}
                          </p>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            {premio.logo ? (
                              <img
                                src={premio.logo}
                                alt={premio.entidad || 'Entidad'}
                                className="w-10 h-10 object-contain bg-white rounded-sm p-1"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-sm flex items-center justify-center">
                                <Icon
                                  path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                  className="w-5 h-5 text-zinc-500"
                                />
                              </div>
                            )}

                            <div>
                              <p className="text-white font-medium">
                                {premio.entidad}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-white font-medium">
                            {premio.premio}
                          </p>

                          {premio.descripcion && (
                            <p className="text-zinc-500 text-xs mt-1 max-w-md">
                              {premio.descripcion}
                            </p>
                          )}

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-yellow-500 font-bold text-lg">
                            {formatCurrency(
                              parseEuropeanNumber(
                                premio.valor
                              )
                            )}€
                          </p>

                        </td>

                        <td className="px-6 py-4 text-right">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() =>
                                editarPremio(premio)
                              }
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
                              title="Editar"
                            >
                              <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'premio',
                                  id: premio.id,
                                })
                              }
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

          </div>

        </>
      )}

      {/* =====================================================
          MODAL — VER SOLICITUD
      ===================================================== */}

      {selectedSolicitud && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSolicitud(null)}
        >

          <div
            className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-lg w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="font-display text-xl text-white mb-4">
              Mensaje de {selectedSolicitud.companyName}
            </h3>

            <div className="space-y-3 text-sm text-zinc-300 mb-6">

              <p>
                <span className="text-zinc-500">
                  Contacto:
                </span>{' '}
                {selectedSolicitud.contactName}{' '}
                ({selectedSolicitud.email})
              </p>

              <p>
                <span className="text-zinc-500">
                  Teléfono:
                </span>{' '}
                {selectedSolicitud.phone ||
                  'No proporcionado'}
              </p>

              <p>
                <span className="text-zinc-500">
                  Modalidad:
                </span>{' '}
                {selectedSolicitud.sponsorshipType}
              </p>

              <div className="bg-zinc-950 p-4 rounded-sm border border-zinc-800 mt-4">

                <p className="text-zinc-400 italic">
                  "
                  {selectedSolicitud.message ||
                    'Sin mensaje adicional'}
                  "
                </p>

              </div>

            </div>

            <button
              onClick={() => setSelectedSolicitud(null)}
              className="w-full py-3 bg-zinc-800 text-white font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-zinc-700"
            >
              Cerrar
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL — CREAR/EDITAR SUBVENCIÓN
      ===================================================== */}

      {modalSubvencionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-3xl w-full my-8 shadow-2xl">

            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">

              <h2 className="font-display text-2xl text-white">
                {editingSubId
                  ? 'Editar Subvención'
                  : 'Nueva Subvención'}
              </h2>

              <button
                onClick={() =>
                  setModalSubvencionOpen(false)
                }
                className="text-zinc-500 hover:text-white"
              >
                <Icon path="M6 18L18 6M6 6l12 12" />
              </button>

            </div>

            <form
              onSubmit={guardarSubvencion}
              className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
            >

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <input
                  type="number"
                  placeholder="Año *"
                  value={formDataSub.ano}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      ano: e.target.value,
                    })
                  }
                  required
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                />

                <input
                  type="text"
                  placeholder="Valor (Ej: 6.500,00) *"
                  value={formDataSub.valor}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      valor: e.target.value,
                    })
                  }
                  required
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                />

                <input
                  type="text"
                  placeholder="Fecha Concesión *"
                  value={formDataSub.fechaConcesion}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      fechaConcesion: e.target.value,
                    })
                  }
                  required
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                />

              </div>

              <input
                type="text"
                placeholder="Entidad Concedente *"
                value={formDataSub.entidad}
                onChange={(e) =>
                  setFormDataSub({
                    ...formDataSub,
                    entidad: e.target.value,
                  })
                }
                required
                className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <select
                  value={formDataSub.tipo}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      tipo: e.target.value,
                    })
                  }
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                >
                  <option>Administración</option>
                  <option>Fundación</option>
                  <option>Privada</option>
                </select>

                <select
                  value={formDataSub.ambito}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      ambito: e.target.value,
                    })
                  }
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                >
                  <option>Local</option>
                  <option>Regional</option>
                  <option>Nacional</option>
                  <option>Europeo</option>
                </select>

                <input
                  type="text"
                  placeholder="Departamento"
                  value={formDataSub.departamento}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      departamento: e.target.value,
                    })
                  }
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
                />

              </div>

              <textarea
                placeholder="Descripción de la Convocatoria..."
                value={formDataSub.convocatoria}
                onChange={(e) =>
                  setFormDataSub({
                    ...formDataSub,
                    convocatoria: e.target.value,
                  })
                }
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none resize-none"
              />

              <input
                type="url"
                placeholder="Enlace Bases Reguladoras (https://...)"
                value={formDataSub.basesLink}
                onChange={(e) =>
                  setFormDataSub({
                    ...formDataSub,
                    basesLink: e.target.value,
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-red-600 outline-none"
              />

              <div className="flex gap-3 pt-4 border-t border-zinc-800">

                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm"
                >
                  Guardar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModalSubvencionOpen(false)
                  }
                  className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm"
                >
                  Cancelar
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL — CREAR/EDITAR PREMIO
      ===================================================== */}

      {modalPremioOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-3xl w-full my-8 shadow-2xl">

            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">

              <div>

                <p className="text-yellow-500 text-xs uppercase tracking-widest mb-1">
                  Transparencia
                </p>

                <h2 className="font-display text-2xl text-white">
                  {editingPremioId
                    ? 'Editar Premio'
                    : 'Nuevo Premio'}
                </h2>

              </div>

              <button
                onClick={() =>
                  setModalPremioOpen(false)
                }
                className="text-zinc-500 hover:text-white"
              >
                <Icon path="M6 18L18 6M6 6l12 12" />
              </button>

            </div>

            <form
              onSubmit={guardarPremio}
              className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
            >

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>

                  <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-2">
                    Año *
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    placeholder="2026"
                    value={formDataPremio.ano}
                    onChange={(e) =>
                      setFormDataPremio({
                        ...formDataPremio,
                        ano: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-yellow-600 outline-none"
                  />

                </div>

                <div>

                  <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-2">
                    Importe asignado *
                  </label>

                  <input
                    type="text"
                    placeholder="Ej: 2.500,00"
                    value={formDataPremio.valor}
                    onChange={(e) =>
                      setFormDataPremio({
                        ...formDataPremio,
                        valor: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-yellow-600 outline-none"
                  />

                </div>

                <div>

                  <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-2">
                    Logo
                  </label>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={formDataPremio.logo}
                    onChange={(e) =>
                      setFormDataPremio({
                        ...formDataPremio,
                        logo: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-yellow-600 outline-none"
                  />

                </div>

              </div>

              <div>

                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-2">
                  Entidad concedente *
                </label>

                <input
                  type="text"
                  placeholder="Nombre de la entidad"
                  value={formDataPremio.entidad}
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      entidad: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-yellow-600 outline-none"
                />

              </div>

              <div>

                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-2">
                  Premio / reconocimiento *
                </label>

                <input
                  type="text"
                  placeholder="Ej: Premio al Deporte Inclusivo"
                  value={formDataPremio.premio}
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      premio: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-yellow-600 outline-none"
                />

              </div>

              <div>

                <label className="block text-zinc-500 text-xs uppercase tracking-wider mb-2">
                  Descripción
                </label>

                <textarea
                  placeholder="Descripción del premio o reconocimiento..."
                  value={formDataPremio.descripcion}
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      descripcion: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 rounded-sm focus:border-yellow-600 outline-none resize-none"
                />

              </div>

              {formDataPremio.logo && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-4">

                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">
                    Vista previa del logo
                  </p>

                  <img
                    src={formDataPremio.logo}
                    alt="Vista previa"
                    className="w-20 h-20 object-contain bg-white rounded-sm p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-zinc-800">

                <button
                  type="submit"
                  className="flex-1 py-3 bg-yellow-600 text-white font-bold uppercase tracking-widest hover:bg-yellow-700 transition-colors rounded-sm"
                >
                  Guardar Premio
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModalPremioOpen(false)
                  }
                  className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-sm"
                >
                  Cancelar
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL — CONFIRMAR ELIMINACIÓN
      ===================================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >

          <div
            className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="font-display text-xl text-white mb-2">
              Confirmar Eliminación
            </h3>

            <p className="text-zinc-400 text-sm mb-6">

              ¿Está seguro de que desea eliminar permanentemente
              este{' '}

              {deleteTarget.type === 'solicitud'
                ? 'mensaje de solicitud'
                : deleteTarget.type === 'subvencion'
                ? 'registro de subvención'
                : 'premio o reconocimiento'}

              ? Esta acción no se puede deshacer.

            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase text-sm rounded-sm hover:bg-zinc-700"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-sm rounded-sm hover:bg-red-700"
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
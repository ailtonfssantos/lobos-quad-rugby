import { useEffect, useState } from 'react';

/* =========================================================
   ICON
========================================================= */

const Icon = ({ path, className = 'w-6 h-6' }) => (
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
   CURRENCY
========================================================= */

const formatCurrency = (value) => {
  const numericValue = Number(value) || 0;

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

/* =========================================================
   EUROPEAN NUMBER PARSER
========================================================= */

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

/* =========================================================
   TRANSPARENCY SUMMARIES
========================================================= */

const calculateTransparencySummaries = (subvenciones, premios) => {
  const years = new Set([
    ...subvenciones.map((item) => String(item.ano)),
    ...premios.map((item) => String(item.ano)),
  ]);

  return [...years]
    .filter(
      (year) =>
        year &&
        year !== 'undefined' &&
        year !== 'null'
    )
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

/* =========================================================
   INITIAL FORMS
========================================================= */

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

const initialPremioForm = {
  ano: '',
  valor: '',
  entidad: '',
  premio: '',
  descripcion: '',
  logo: '',
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Patrocinadores() {
  const API_URL = import.meta.env.VITE_API_URL;

  /* =======================================================
     AUTH
  ======================================================= */

  const getToken = () => localStorage.getItem('token');

  const getAuthHeaders = () => {
    const token = getToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : {
          'Content-Type': 'application/json',
        };
  };

  /* =======================================================
     GENERAL
  ======================================================= */

  const [activeTab, setActiveTab] = useState('solicitudes');

  /* =======================================================
     SOLICITUDES
  ======================================================= */

  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  /* =======================================================
     SUBVENCIONES
  ======================================================= */

  const [subvenciones, setSubvenciones] = useState([]);
  const [modalSubvencionOpen, setModalSubvencionOpen] =
    useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [formDataSub, setFormDataSub] = useState(
    initialSubvencionForm
  );

  /* =======================================================
     PREMIOS
  ======================================================= */

  const [premios, setPremios] = useState([]);
  const [modalPremioOpen, setModalPremioOpen] =
    useState(false);
  const [editingPremioId, setEditingPremioId] =
    useState(null);
  const [formDataPremio, setFormDataPremio] =
    useState(initialPremioForm);

  /* =======================================================
     LOGO UPLOAD
  ======================================================= */

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] =
    useState('');

  /* =======================================================
     DELETE
  ======================================================= */

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const cargarDatos = async () => {
    try {
      const token = getToken();

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const [
        solicitudesResponse,
        subvencionesResponse,
        premiosResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/patrocinadores`, {
          headers,
        }),

        fetch(`${API_URL}/api/subvenciones`, {
          headers,
        }),

        fetch(`${API_URL}/api/premios`, {
          headers,
        }),
      ]);

      if (solicitudesResponse.ok) {
        const data = await solicitudesResponse.json();
        setSolicitudes(Array.isArray(data) ? data : []);
      }

      if (subvencionesResponse.ok) {
        const data = await subvencionesResponse.json();
        setSubvenciones(Array.isArray(data) ? data : []);
      }

      if (premiosResponse.ok) {
        const data = await premiosResponse.json();
        setPremios(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /* =======================================================
     SUBVENCIONES - NEW
  ======================================================= */

  const abrirNuevaSubvencion = () => {
    setEditingSubId(null);
    setFormDataSub(initialSubvencionForm);
    setModalSubvencionOpen(true);
  };

  /* =======================================================
     SUBVENCIONES - EDIT
  ======================================================= */

  const editarSubvencion = (subvencion) => {
    setEditingSubId(subvencion.id);

    setFormDataSub({
      ano: subvencion.ano || '',
      valor: subvencion.valor || '',
      entidad: subvencion.entidad || '',
      fechaConcesion:
        subvencion.fechaConcesion || '',
      tipo: subvencion.tipo || 'Administración',
      ambito: subvencion.ambito || 'Local',
      departamento: subvencion.departamento || '',
      convocatoria: subvencion.convocatoria || '',
      basesLink: subvencion.basesLink || '',
    });

    setModalSubvencionOpen(true);
  };

  /* =======================================================
     SUBVENCIONES - SAVE
  ======================================================= */

  const guardarSubvencion = async (event) => {
    event.preventDefault();

    try {
      const token = getToken();

      const url = editingSubId
        ? `${API_URL}/api/subvenciones/${editingSubId}`
        : `${API_URL}/api/subvenciones`;

      const method = editingSubId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify(formDataSub),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'No se pudo guardar la subvención.'
        );
      }

      setModalSubvencionOpen(false);
      setEditingSubId(null);
      setFormDataSub(initialSubvencionForm);

      await cargarDatos();
    } catch (error) {
      console.error(
        'Error al guardar subvención:',
        error
      );

      alert(
        error.message ||
          'No se pudo guardar la subvención.'
      );
    }
  };

  /* =======================================================
     PREMIOS - NEW
  ======================================================= */

  const abrirNuevoPremio = () => {
    setEditingPremioId(null);
    setFormDataPremio(initialPremioForm);
    setLogoUploadError('');
    setModalPremioOpen(true);
  };

  /* =======================================================
     PREMIOS - EDIT
  ======================================================= */

  const editarPremio = (premio) => {
    setEditingPremioId(premio.id);

    setFormDataPremio({
      ano: premio.ano || '',
      valor: premio.valor || '',
      entidad: premio.entidad || '',
      premio: premio.premio || '',
      descripcion: premio.descripcion || '',
      logo: premio.logo || '',
    });

    setLogoUploadError('');
    setModalPremioOpen(true);
  };

  /* =======================================================
     LOGO - UPLOAD TO CLOUDINARY
  ======================================================= */

  const subirLogoPremio = async (file) => {
    if (!file) return;

    setLogoUploadError('');

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setLogoUploadError(
        'Formato no válido. Utilice JPG, JPEG, PNG o WEBP.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError(
        'El archivo es demasiado grande. El tamaño máximo es de 5 MB.'
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setLogoUploadError(
        'No se encontró la sesión de administrador.'
      );
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();

      /*
       * IMPORTANTE:
       * upload.js utiliza upload.single('image')
       */
      formData.append('image', file);

      const response = await fetch(
        `${API_URL}/api/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'No se pudo subir el logo.'
        );
      }

      if (!data.url) {
        throw new Error(
          'El servidor no devolvió la URL de la imagen.'
        );
      }

      setFormDataPremio((prev) => ({
        ...prev,
        logo: data.url,
      }));
    } catch (error) {
      console.error(
        'Error al subir logo:',
        error
      );

      setLogoUploadError(
        error.message ||
          'No se pudo subir el logo.'
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  /* =======================================================
     LOGO - REMOVE
  ======================================================= */

  const quitarLogoPremio = () => {
    setFormDataPremio((prev) => ({
      ...prev,
      logo: '',
    }));

    setLogoUploadError('');
  };

  /* =======================================================
     PREMIOS - SAVE
  ======================================================= */

  const guardarPremio = async (event) => {
    event.preventDefault();

    try {
      const token = getToken();

      const url = editingPremioId
        ? `${API_URL}/api/premios/${editingPremioId}`
        : `${API_URL}/api/premios`;

      const method = editingPremioId
        ? 'PUT'
        : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify(formDataPremio),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'No se pudo guardar el premio.'
        );
      }

      setModalPremioOpen(false);
      setEditingPremioId(null);
      setFormDataPremio(initialPremioForm);
      setLogoUploadError('');

      await cargarDatos();
    } catch (error) {
      console.error(
        'Error al guardar premio:',
        error
      );

      alert(
        error.message ||
          'No se pudo guardar el premio o reconocimiento.'
      );
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmarEliminacion = async () => {
    if (!deleteTarget) return;

    try {
      const token = getToken();

      const endpointMap = {
        solicitud: 'patrocinadores',
        subvencion: 'subvenciones',
        premio: 'premios',
      };

      const endpoint =
        endpointMap[deleteTarget.type];

      if (!endpoint) {
        throw new Error(
          'Tipo de elemento no válido.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/${endpoint}/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'No se pudo eliminar el elemento.'
        );
      }

      if (deleteTarget.type === 'solicitud') {
        setSolicitudes((prev) =>
          prev.filter(
            (item) =>
              item.id !== deleteTarget.id
          )
        );
      }

      if (deleteTarget.type === 'subvencion') {
        setSubvenciones((prev) =>
          prev.filter(
            (item) =>
              item.id !== deleteTarget.id
          )
        );
      }

      if (deleteTarget.type === 'premio') {
        setPremios((prev) =>
          prev.filter(
            (item) =>
              item.id !== deleteTarget.id
          )
        );
      }

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        'Error al eliminar:',
        error
      );

      alert(
        error.message ||
          'No se pudo eliminar el elemento.'
      );
    }
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summaries =
    calculateTransparencySummaries(
      subvenciones,
      premios
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="border-b border-white/10 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                Administración
              </p>

              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Patrocinadores y transparencia
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Gestión de solicitudes, subvenciones,
                premios y reconocimientos concedidos al
                club.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          TABS
      =================================================== */}

      <div className="border-b border-white/10 bg-[#080808]">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              setActiveTab('solicitudes')
            }
            className={`border-b-2 py-4 text-sm font-medium transition ${
              activeTab === 'solicitudes'
                ? 'border-white text-white'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            Solicitudes
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('transparencia')
            }
            className={`border-b-2 py-4 text-sm font-medium transition ${
              activeTab === 'transparencia'
                ? 'border-white text-white'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            Transparencia
          </button>
        </div>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* =================================================
            SOLICITUDES
        ================================================= */}

        {activeTab === 'solicitudes' && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Solicitudes de patrocinio
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Solicitudes recibidas a través del
                formulario de patrocinadores.
              </p>
            </div>

            {solicitudes.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Icon
                    className="h-5 w-5 text-white/40"
                    path="M12 6v12m6-6H6"
                  />
                </div>

                <p className="text-sm text-white/40">
                  No hay solicitudes recibidas.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead className="border-b border-white/10 bg-white/[0.02]">
                      <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                          Empresa
                        </th>

                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                          Contacto
                        </th>

                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                          Fecha
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/40">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {solicitudes.map(
                        (solicitud) => (
                          <tr
                            key={solicitud.id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-4">
                              <div className="font-medium">
                                {solicitud.empresa ||
                                  solicitud.nombre ||
                                  '—'}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-white/60">
                              {solicitud.email ||
                                solicitud.correo ||
                                '—'}
                            </td>

                            <td className="px-5 py-4 text-sm text-white/50">
                              {solicitud.createdAt
                                ? new Date(
                                    solicitud.createdAt
                                  ).toLocaleDateString(
                                    'es-ES'
                                  )
                                : '—'}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedSolicitud(
                                      solicitud
                                    )
                                  }
                                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                                >
                                  Ver
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'solicitud',
                                      id: solicitud.id,
                                    })
                                  }
                                  className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            TRANSPARENCIA
        ================================================= */}

        {activeTab === 'transparencia' && (
          <section>
            {/* =============================================
                HEADER
            ============================================= */}

            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Transparencia
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Subvenciones, premios y
                  reconocimientos recibidos por el club.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={abrirNuevaSubvencion}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <Icon
                    className="h-4 w-4"
                    path="M12 5v14m-7-7h14"
                  />
                  Añadir subvención
                </button>

                <button
                  type="button"
                  onClick={abrirNuevoPremio}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  <Icon
                    className="h-4 w-4"
                    path="M12 5v14m-7-7h14"
                  />
                  Añadir premio
                </button>
              </div>
            </div>

            {/* =============================================
                SUMMARY
            ============================================= */}

            {summaries.length > 0 && (
              <div className="mb-12 space-y-4">
                {summaries.map((summary) => (
                  <div
                    key={summary.year}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-semibold">
                          {summary.year}
                        </span>

                        <span className="ml-3 text-xs text-white/30">
                          {summary.subvencionesCount +
                            summary.premiosCount}{' '}
                          registros
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-white/30">
                          Total ayudas y premios
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                          {formatCurrency(
                            summary.total
                          )}{' '}
                          €
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-wider text-white/30">
                          Subvenciones
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {formatCurrency(
                            summary.subvencionesTotal
                          )}{' '}
                          €
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="text-xs uppercase tracking-wider text-white/30">
                          Premios y reconocimientos
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {formatCurrency(
                            summary.premiosTotal
                          )}{' '}
                          €
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* =============================================
                SUBVENCIONES
            ============================================= */}

            <div className="mb-12">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
                    Transparencia económica
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    SUBVENCIONES RECIBIDAS
                  </h3>
                </div>
              </div>

              {subvenciones.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
                  <p className="text-sm text-white/40">
                    No hay subvenciones registradas.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="border-b border-white/10 bg-white/[0.02]">
                        <tr>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Año
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Entidad
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Tipo
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Ámbito
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Importe
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/40">
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {subvenciones.map(
                          (subvencion) => (
                            <tr
                              key={subvencion.id}
                              className="transition hover:bg-white/[0.02]"
                            >
                              <td className="px-5 py-4 text-sm">
                                {subvencion.ano}
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-medium">
                                  {
                                    subvencion.entidad
                                  }
                                </p>

                                {subvencion.convocatoria && (
                                  <p className="mt-1 max-w-xs truncate text-xs text-white/30">
                                    {
                                      subvencion.convocatoria
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm text-white/60">
                                {subvencion.tipo ||
                                  '—'}
                              </td>

                              <td className="px-5 py-4 text-sm text-white/60">
                                {subvencion.ambito ||
                                  '—'}
                              </td>

                              <td className="px-5 py-4 text-sm font-medium">
                                {formatCurrency(
                                  parseEuropeanNumber(
                                    subvencion.valor
                                  )
                                )}{' '}
                                €
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editarSubvencion(
                                        subvencion
                                      )
                                    }
                                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: 'subvencion',
                                        id: subvencion.id,
                                      })
                                    }
                                    className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* =============================================
                PREMIOS
            ============================================= */}

            <div>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
                  Reconocimientos
                </p>

                <h3 className="mt-2 text-lg font-semibold">
                  PREMIOS Y RECONOCIMIENTOS
                </h3>
              </div>

              {premios.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                    <Icon
                      className="h-5 w-5 text-white/40"
                      path="M12 6v12m6-6H6"
                    />
                  </div>

                  <p className="text-sm text-white/40">
                    No hay premios o reconocimientos
                    registrados.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="border-b border-white/10 bg-white/[0.02]">
                        <tr>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Año
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Entidad
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Premio / Reconocimiento
                          </th>

                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                            Importe
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/40">
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {premios.map((premio) => (
                          <tr
                            key={premio.id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-4 text-sm">
                              {premio.ano}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {premio.logo ? (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white p-1.5">
                                    <img
                                      src={premio.logo}
                                      alt={
                                        premio.entidad
                                      }
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                                    <Icon
                                      className="h-4 w-4 text-white/30"
                                      path="M12 4v16m8-8H4"
                                    />
                                  </div>
                                )}

                                <span className="font-medium">
                                  {premio.entidad}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium">
                                {premio.premio}
                              </p>

                              {premio.descripcion && (
                                <p className="mt-1 max-w-md text-xs leading-5 text-white/35">
                                  {
                                    premio.descripcion
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              {formatCurrency(
                                parseEuropeanNumber(
                                  premio.valor
                                )
                              )}{' '}
                              €
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    editarPremio(
                                      premio
                                    )
                                  }
                                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'premio',
                                      id: premio.id,
                                    })
                                  }
                                  className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                                >
                                  Eliminar
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
            </div>
          </section>
        )}
      </main>

      {/* =====================================================
          MODAL SUBVENCIÓN
      ===================================================== */}

      {modalSubvencionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b0b0b] px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingSubId
                    ? 'Editar subvención'
                    : 'Nueva subvención'}
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  Información económica de transparencia.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalSubvencionOpen(false)
                }
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <Icon
                  className="h-5 w-5"
                  path="M6 6l12 12M18 6L6 18"
                />
              </button>
            </div>

            <form
              onSubmit={guardarSubvencion}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Año *
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    required
                    value={formDataSub.ano}
                    onChange={(e) =>
                      setFormDataSub({
                        ...formDataSub,
                        ano: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="2026"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Importe asignado *
                  </label>

                  <input
                    type="text"
                    required
                    value={formDataSub.valor}
                    onChange={(e) =>
                      setFormDataSub({
                        ...formDataSub,
                        valor: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Ej: 2.500,00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Entidad concedente *
                </label>

                <input
                  type="text"
                  required
                  value={formDataSub.entidad}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      entidad: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Nombre de la entidad"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Tipo
                  </label>

                  <select
                    value={formDataSub.tipo}
                    onChange={(e) =>
                      setFormDataSub({
                        ...formDataSub,
                        tipo: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-white/30"
                  >
                    <option>
                      Administración
                    </option>
                    <option>Entidad privada</option>
                    <option>Fundación</option>
                    <option>Federación</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Ámbito
                  </label>

                  <select
                    value={formDataSub.ambito}
                    onChange={(e) =>
                      setFormDataSub({
                        ...formDataSub,
                        ambito: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-white/30"
                  >
                    <option>Local</option>
                    <option>Provincial</option>
                    <option>Autonómico</option>
                    <option>Nacional</option>
                    <option>Europeo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Departamento
                </label>

                <input
                  type="text"
                  value={formDataSub.departamento}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      departamento: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Departamento / concejalía / organismo"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Convocatoria
                </label>

                <input
                  type="text"
                  value={formDataSub.convocatoria}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      convocatoria: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Nombre de la convocatoria"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Fecha de concesión
                </label>

                <input
                  type="date"
                  value={formDataSub.fechaConcesion}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      fechaConcesion: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Enlace a las bases
                </label>

                <input
                  type="url"
                  value={formDataSub.basesLink}
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      basesLink: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setModalSubvencionOpen(false)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  {editingSubId
                    ? 'Guardar cambios'
                    : 'Guardar subvención'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL PREMIO
      ===================================================== */}

      {modalPremioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b0b0b] px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingPremioId
                    ? 'Editar premio o reconocimiento'
                    : 'Nuevo premio o reconocimiento'}
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  Añade el reconocimiento recibido por
                  el club.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalPremioOpen(false)
                }
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <Icon
                  className="h-5 w-5"
                  path="M6 6l12 12M18 6L6 18"
                />
              </button>
            </div>

            <form
              onSubmit={guardarPremio}
              className="space-y-5 p-6"
            >
              {/* ===========================================
                  YEAR + VALUE
              =========================================== */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Año *
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    required
                    value={formDataPremio.ano}
                    onChange={(e) =>
                      setFormDataPremio({
                        ...formDataPremio,
                        ano: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="2026"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Importe asignado *
                  </label>

                  <input
                    type="text"
                    required
                    value={formDataPremio.valor}
                    onChange={(e) =>
                      setFormDataPremio({
                        ...formDataPremio,
                        valor: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Ej: 2.500,00"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-white/25">
                    Introduzca el importe en euros.
                  </p>
                </div>
              </div>

              {/* ===========================================
                  LOGO UPLOAD
              =========================================== */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Logo de la entidad
                </label>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* PREVIEW */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white">
                      {formDataPremio.logo ? (
                        <img
                          src={formDataPremio.logo}
                          alt="Vista previa del logo"
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center">
                          <Icon
                            className="mx-auto h-6 w-6 text-black/30"
                            path="M4 16l4.5-4.5a2.121 2.121 0 013 0L16 16m-2-2l1.5-1.5a2.121 2.121 0 013 0L20 14M14 8h.01M5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z"
                          />

                          <span className="mt-1 block text-[9px] text-black/30">
                            Sin logo
                          </span>
                        </div>
                      )}
                    </div>

                    {/* FILE INPUT */}

                    <div className="min-w-0 flex-1">
                      <input
                        id="premio-logo"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          const file =
                            e.target.files?.[0];

                          if (file) {
                            subirLogoPremio(file);
                          }

                          /*
                           * Permite seleccionar nuevamente
                           * el mismo archivo si fuera necesario.
                           */
                          e.target.value = '';
                        }}
                        className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-white/10 file:bg-white/[0.05] file:px-4 file:py-3 file:text-xs file:font-medium file:text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <p className="mt-2 text-[11px] leading-5 text-white/25">
                        JPG, JPEG, PNG o WEBP · máximo
                        5 MB. El logo se subirá
                        automáticamente a Cloudinary.
                      </p>

                      {uploadingLogo && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Subiendo logo...
                        </div>
                      )}

                      {logoUploadError && (
                        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                          {logoUploadError}
                        </p>
                      )}

                      {formDataPremio.logo &&
                        !uploadingLogo && (
                          <button
                            type="button"
                            onClick={
                              quitarLogoPremio
                            }
                            className="mt-3 text-xs text-white/40 underline underline-offset-4 transition hover:text-white"
                          >
                            Quitar logo
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===========================================
                  ENTITY
              =========================================== */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Entidad concedente *
                </label>

                <input
                  type="text"
                  required
                  value={formDataPremio.entidad}
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      entidad: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Ej: Ayuntamiento de Valencia"
                />
              </div>

              {/* ===========================================
                  AWARD
              =========================================== */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Premio / reconocimiento *
                </label>

                <input
                  type="text"
                  required
                  value={formDataPremio.premio}
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      premio: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Ej: Premio al deporte inclusivo"
                />
              </div>

              {/* ===========================================
                  DESCRIPTION
              =========================================== */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Descripción
                </label>

                <textarea
                  rows={4}
                  value={formDataPremio.descripcion}
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      descripcion:
                        e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                  placeholder="Descripción breve del premio o reconocimiento..."
                />
              </div>

              {/* ===========================================
                  ACTIONS
              =========================================== */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setModalPremioOpen(false)
                  }
                  disabled={uploadingLogo}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {editingPremioId
                    ? 'Guardar cambios'
                    : 'Guardar premio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          SOLICITUD DETAIL MODAL
      ===================================================== */}

      {selectedSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="text-lg font-semibold">
                  Detalle de la solicitud
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  Información enviada por el
                  patrocinador.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSolicitud(null)
                }
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <Icon
                  className="h-5 w-5"
                  path="M6 6l12 12M18 6L6 18"
                />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {Object.entries(
                selectedSolicitud
              ).map(([key, value]) => {
                if (
                  key === 'id' ||
                  key === 'updatedAt'
                ) {
                  return null;
                }

                return (
                  <div key={key}>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                      {key}
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm text-white/70">
                      {value === null ||
                      value === undefined ||
                      value === ''
                        ? '—'
                        : String(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5">
              <Icon
                className="h-5 w-5 text-red-400"
                path="M12 9v4m0 4h.01M10.29 3.86l-8.82 15a1 1 0 00.86 1.5h19.34a1 1 0 00.86-1.5l-8.82-15a1 1 0 00-1.72 0z"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              ¿Eliminar este elemento?
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarEliminacion}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-400"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
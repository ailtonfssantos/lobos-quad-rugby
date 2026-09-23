import { useEffect, useMemo, useState } from 'react';

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
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={path}
    />
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

  return Number.isNaN(numericValue)
    ? 0
    : numericValue;
};

/* =========================================================
   TRANSPARENCY SUMMARIES
========================================================= */

const calculateTransparencySummaries = (
  subvenciones,
  premios
) => {
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
      const subvencionesYear =
        subvenciones.filter(
          (item) => String(item.ano) === year
        );

      const premiosYear = premios.filter(
        (item) => String(item.ano) === year
      );

      const subvencionesTotal =
        subvencionesYear.reduce(
          (sum, item) =>
            sum +
            parseEuropeanNumber(item.valor),
          0
        );

      const premiosTotal = premiosYear.reduce(
        (sum, item) =>
          sum +
          parseEuropeanNumber(item.valor),
        0
      );

      return {
        year,
        subvencionesTotal,
        premiosTotal,
        total:
          subvencionesTotal + premiosTotal,
        subvencionesCount:
          subvencionesYear.length,
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

  const getToken = () =>
    localStorage.getItem('token');

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

  const [activeTab, setActiveTab] =
    useState('solicitudes');

  /* =======================================================
     SOLICITUDES
  ======================================================= */

  const [solicitudes, setSolicitudes] =
    useState([]);

  const [selectedSolicitud, setSelectedSolicitud] =
    useState(null);

  /* =======================================================
     SUBVENCIONES
  ======================================================= */

  const [subvenciones, setSubvenciones] =
    useState([]);

  const [
    modalSubvencionOpen,
    setModalSubvencionOpen,
  ] = useState(false);

  const [editingSubId, setEditingSubId] =
    useState(null);

  const [formDataSub, setFormDataSub] =
    useState(initialSubvencionForm);

  /* =======================================================
     PREMIOS
  ======================================================= */

  const [premios, setPremios] = useState([]);

  const [
    modalPremioOpen,
    setModalPremioOpen,
  ] = useState(false);

  const [editingPremioId, setEditingPremioId] =
    useState(null);

  const [formDataPremio, setFormDataPremio] =
    useState(initialPremioForm);

  /* =======================================================
     LOGO UPLOAD
  ======================================================= */

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [logoUploadError, setLogoUploadError] =
    useState('');

  /* =======================================================
     DELETE
  ======================================================= */

  const [deleteTarget, setDeleteTarget] =
    useState(null);

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
        fetch(
          `${API_URL}/api/patrocinadores`,
          {
            headers,
          }
        ),

        fetch(
          `${API_URL}/api/subvenciones`,
          {
            headers,
          }
        ),

        fetch(`${API_URL}/api/premios`, {
          headers,
        }),
      ]);

      if (solicitudesResponse.ok) {
        const data =
          await solicitudesResponse.json();

        setSolicitudes(
          Array.isArray(data) ? data : []
        );
      }

      if (subvencionesResponse.ok) {
        const data =
          await subvencionesResponse.json();

        setSubvenciones(
          Array.isArray(data) ? data : []
        );
      }

      if (premiosResponse.ok) {
        const data =
          await premiosResponse.json();

        setPremios(
          Array.isArray(data) ? data : []
        );
      }
    } catch (error) {
      console.error(
        'Error al cargar datos:',
        error
      );
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
    setFormDataSub({
      ...initialSubvencionForm,
    });
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
      tipo:
        subvencion.tipo ||
        'Administración',
      ambito:
        subvencion.ambito || 'Local',
      departamento:
        subvencion.departamento || '',
      convocatoria:
        subvencion.convocatoria || '',
      basesLink:
        subvencion.basesLink || '',
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

      const method = editingSubId
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
        body: JSON.stringify(formDataSub),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'No se pudo guardar la subvención.'
        );
      }

      setModalSubvencionOpen(false);
      setEditingSubId(null);
      setFormDataSub({
        ...initialSubvencionForm,
      });

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
    setFormDataPremio({
      ...initialPremioForm,
    });

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
      descripcion:
        premio.descripcion || '',
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
        body: JSON.stringify(
          formDataPremio
        ),
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
      setFormDataPremio({
        ...initialPremioForm,
      });
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

      if (
        deleteTarget.type === 'solicitud'
      ) {
        setSolicitudes((prev) =>
          prev.filter(
            (item) =>
              item.id !==
              deleteTarget.id
          )
        );
      }

      if (
        deleteTarget.type === 'subvencion'
      ) {
        setSubvenciones((prev) =>
          prev.filter(
            (item) =>
              item.id !==
              deleteTarget.id
          )
        );
      }

      if (
        deleteTarget.type === 'premio'
      ) {
        setPremios((prev) =>
          prev.filter(
            (item) =>
              item.id !==
              deleteTarget.id
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

  const summaries = useMemo(
    () =>
      calculateTransparencySummaries(
        subvenciones,
        premios
      ),
    [subvenciones, premios]
  );

  const totalSubvenciones = useMemo(
    () =>
      subvenciones.reduce(
        (sum, item) =>
          sum +
          parseEuropeanNumber(item.valor),
        0
      ),
    [subvenciones]
  );

  const totalPremios = useMemo(
    () =>
      premios.reduce(
        (sum, item) =>
          sum +
          parseEuropeanNumber(item.valor),
        0
      ),
    [premios]
  );

  /* =======================================================
     INPUT STYLE
  ======================================================= */

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-white/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-white/10';

  const selectClass =
    'w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition hover:border-white/15 focus:border-white/30 focus:ring-1 focus:ring-white/10';

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="relative overflow-hidden border-b border-white/10 bg-[#080808]">
        {/* Ambient background */}

        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-blue-500/[0.04] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                  Administración
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Patrocinadores y
                <span className="text-white/45">
                  {' '}
                  transparencia
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Gestiona las solicitudes de
                patrocinio, subvenciones, premios y
                reconocimientos del club desde un
                único espacio.
              </p>
            </div>

            {/* HEADER STATS */}

            <div className="grid grid-cols-3 gap-3">
              <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Icon
                      className="h-3.5 w-3.5 text-white/60"
                      path="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    />
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Solicitudes
                  </span>
                </div>

                <p className="mt-2 text-xl font-semibold text-white">
                  {solicitudes.length}
                </p>
              </div>

              <div className="min-w-[110px] rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
                    <Icon
                      className="h-3.5 w-3.5 text-emerald-300/70"
                      path="M12 2v20M17 5H9.5a3.5 3.5 0 000 7H15a3.5 3.5 0 010 7H6"
                    />
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Subvenciones
                  </span>
                </div>

                <p className="mt-2 text-xl font-semibold text-emerald-300">
                  {formatCurrency(
                    totalSubvenciones
                  )}{' '}
                  €
                </p>
              </div>

              <div className="min-w-[110px] rounded-2xl border border-blue-400/10 bg-blue-400/[0.025] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400/[0.08]">
                    <Icon
                      className="h-3.5 w-3.5 text-blue-300/70"
                      path="M12 3l1.9 3.85 4.25.62-3.08 3 0.73 4.23L12 12.7l-3.8 2 0.73-4.23-3.08-3 4.25-.62L12 3z"
                    />
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Premios
                  </span>
                </div>

                <p className="mt-2 text-xl font-semibold text-blue-300">
                  {formatCurrency(
                    totalPremios
                  )}{' '}
                  €
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          TABS
      =================================================== */}

      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              setActiveTab('solicitudes')
            }
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition ${
              activeTab === 'solicitudes'
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Icon
              className="h-4 w-4"
              path="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            />

            Solicitudes

            {solicitudes.length > 0 && (
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/60">
                {solicitudes.length}
              </span>
            )}

            {activeTab ===
              'solicitudes' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('transparencia')
            }
            className={`relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition ${
              activeTab === 'transparencia'
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Icon
              className="h-4 w-4"
              path="M3 3v18h18M7 16l4-5 3 3 5-7"
            />

            Transparencia

            {activeTab ===
              'transparencia' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-white" />
            )}
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
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/70">
                  Contacto
                </p>

                <h2 className="text-xl font-semibold text-white">
                  Solicitudes de patrocinio
                </h2>

                <p className="mt-1.5 text-sm text-white/40">
                  Solicitudes recibidas a través
                  del formulario de patrocinadores.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs text-white/50">
                  {solicitudes.length}{' '}
                  {solicitudes.length === 1
                    ? 'solicitud'
                    : 'solicitudes'}
                </span>
              </div>
            </div>

            {solicitudes.length === 0 ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] p-14 text-center">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.025] to-transparent" />

                <div className="relative">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] shadow-inner">
                    <Icon
                      className="h-6 w-6 text-white/30"
                      path="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    />
                  </div>

                  <h3 className="text-sm font-medium text-white/70">
                    No hay solicitudes
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                    Las nuevas solicitudes de
                    patrocinio aparecerán aquí cuando
                    sean recibidas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/20">
                <div className="border-b border-white/10 bg-white/[0.02] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                      Solicitudes recibidas
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead className="border-b border-white/10 bg-black/20">
                      <tr>
                        <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                          Empresa
                        </th>

                        <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                          Contacto
                        </th>

                        <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                          Fecha
                        </th>

                        <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                      {solicitudes.map(
                        (solicitud) => (
                          <tr
                            key={solicitud.id}
                            className="group transition hover:bg-white/[0.025]"
                          >
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                                  <Icon
                                    className="h-4 w-4 text-white/40"
                                    path="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium text-white/90">
                                    {solicitud.empresa ||
                                      solicitud.nombre ||
                                      '—'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-sm text-white/55">
                              {solicitud.email ||
                                solicitud.correo ||
                                '—'}
                            </td>

                            <td className="px-5 py-5 text-sm text-white/45">
                              {solicitud.createdAt
                                ? new Date(
                                    solicitud.createdAt
                                  ).toLocaleDateString(
                                    'es-ES'
                                  )
                                : '—'}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedSolicitud(
                                      solicitud
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                                >
                                  <Icon
                                    className="h-3.5 w-3.5"
                                    path="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z M12 15a3 3 0 100-6 3 3 0 000 6z"
                                  />
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
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/[0.03] px-3 py-2 text-xs font-medium text-red-400/80 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <Icon
                                    className="h-3.5 w-3.5"
                                    path="M3 6h18M8 6V4h8v2m-9 0l1 15h8l1-15M10 11v6M14 11v6"
                                  />
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

            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/70">
                    Gestión económica
                  </p>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Transparencia
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                  Subvenciones, premios y
                  reconocimientos recibidos por el
                  club.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={abrirNuevaSubvencion}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-medium text-white/80 shadow-sm transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  <Icon
                    className="h-4 w-4 text-emerald-300/80"
                    path="M12 5v14m-7-7h14"
                  />

                  Añadir subvención
                </button>

                <button
                  type="button"
                  onClick={abrirNuevoPremio}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-white/[0.04] transition hover:bg-white/90"
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
                SUMMARY CARDS
            ============================================= */}

            {summaries.length > 0 && (
              <div className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                      Resumen anual
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      Histórico económico del club
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {summaries.map(
                    (summary) => (
                      <div
                        key={summary.year}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 transition hover:border-white/15"
                      >
                        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/[0.035] blur-3xl" />

                        <div className="relative">
                          <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                                  <span className="text-sm font-semibold text-white/70">
                                    {String(
                                      summary.year
                                    ).slice(-2)}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {summary.year}
                                  </h3>

                                  <p className="mt-0.5 text-[11px] text-white/30">
                                    {summary.subvencionesCount +
                                      summary.premiosCount}{' '}
                                    {summary.subvencionesCount +
                                      summary.premiosCount ===
                                    1
                                      ? 'registro'
                                      : 'registros'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                                Total
                              </p>

                              <p className="mt-1 text-xl font-semibold tracking-tight text-white">
                                {formatCurrency(
                                  summary.total
                                )}{' '}
                                €
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
                                  <Icon
                                    className="h-3.5 w-3.5 text-emerald-300/80"
                                    path="M12 2v20M17 5H9.5a3.5 3.5 0 000 7H15a3.5 3.5 0 010 7H6"
                                  />
                                </div>

                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                                  Subvenciones
                                </p>
                              </div>

                              <p className="mt-3 text-lg font-semibold text-emerald-300/90">
                                {formatCurrency(
                                  summary.subvencionesTotal
                                )}{' '}
                                €
                              </p>
                            </div>

                            <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.025] p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400/[0.08]">
                                  <Icon
                                    className="h-3.5 w-3.5 text-blue-300/80"
                                    path="M12 3l1.9 3.85 4.25.62-3.08 3 0.73 4.23L12 12.7l-3.8 2 0.73-4.23-3.08-3 4.25-.62L12 3z"
                                  />
                                </div>

                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                                  Premios
                                </p>
                              </div>

                              <p className="mt-3 text-lg font-semibold text-blue-300/90">
                                {formatCurrency(
                                  summary.premiosTotal
                                )}{' '}
                                €
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* =============================================
                SUBVENCIONES
            ============================================= */}

            <div className="mb-12">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/60">
                      Transparencia económica
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight">
                    Subvenciones recibidas
                  </h3>
                </div>

                <span className="text-xs text-white/25">
                  {subvenciones.length}{' '}
                  {subvenciones.length === 1
                    ? 'registro'
                    : 'registros'}
                </span>
              </div>

              {subvenciones.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                    <Icon
                      className="h-5 w-5 text-white/30"
                      path="M12 6v12m6-6H6"
                    />
                  </div>

                  <p className="text-sm font-medium text-white/60">
                    No hay subvenciones
                    registradas.
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/25">
                    Añade la primera subvención
                    recibida por el club.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/20">
                  <div className="border-b border-white/10 bg-white/[0.02] px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-3.5 w-3.5 text-emerald-300/60"
                        path="M12 2v20M17 5H9.5a3.5 3.5 0 000 7H15a3.5 3.5 0 010 7H6"
                      />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                        Ayudas económicas
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="border-b border-white/10 bg-black/20">
                        <tr>
                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Año
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Entidad
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Tipo
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Ámbito
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Importe
                          </th>

                          <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/[0.06]">
                        {subvenciones.map(
                          (subvencion) => (
                            <tr
                              key={
                                subvencion.id
                              }
                              className="group transition hover:bg-white/[0.025]"
                            >
                              <td className="px-5 py-5">
                                <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/70">
                                  {
                                    subvencion.ano
                                  }
                                </span>
                              </td>

                              <td className="px-5 py-5">
                                <p className="font-medium text-white/85">
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

                              <td className="px-5 py-5">
                                <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-1 text-xs text-white/55">
                                  {subvencion.tipo ||
                                    '—'}
                                </span>
                              </td>

                              <td className="px-5 py-5 text-sm text-white/50">
                                {
                                  subvencion.ambito ||
                                    '—'
                                }
                              </td>

                              <td className="px-5 py-5">
                                <span className="font-semibold text-emerald-300/90">
                                  {formatCurrency(
                                    parseEuropeanNumber(
                                      subvencion.valor
                                    )
                                  )}{' '}
                                  €
                                </span>
                              </td>

                              <td className="px-5 py-5">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editarSubvencion(
                                        subvencion
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                                  >
                                    <Icon
                                      className="h-3.5 w-3.5"
                                      path="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                                    />

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
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/[0.03] px-3 py-2 text-xs font-medium text-red-400/80 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                                  >
                                    <Icon
                                      className="h-3.5 w-3.5"
                                      path="M3 6h18M8 6V4h8v2m-9 0l1 15h8l1-15M10 11v6M14 11v6"
                                    />

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
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/60">
                      Reconocimientos
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight">
                    Premios y reconocimientos
                  </h3>
                </div>

                <span className="text-xs text-white/25">
                  {premios.length}{' '}
                  {premios.length === 1
                    ? 'registro'
                    : 'registros'}
                </span>
              </div>

              {premios.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                    <Icon
                      className="h-5 w-5 text-white/30"
                      path="M12 3l1.9 3.85 4.25.62-3.08 3 0.73 4.23L12 12.7l-3.8 2 0.73-4.23-3.08-3 4.25-.62L12 3z"
                    />
                  </div>

                  <p className="text-sm font-medium text-white/60">
                    No hay premios o
                    reconocimientos registrados.
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/25">
                    Añade el primer reconocimiento
                    recibido por el club.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/20">
                  <div className="border-b border-white/10 bg-white/[0.02] px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-3.5 w-3.5 text-blue-300/60"
                        path="M12 3l1.9 3.85 4.25.62-3.08 3 0.73 4.23L12 12.7l-3.8 2 0.73-4.23-3.08-3 4.25-.62L12 3z"
                      />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                        Reconocimientos recibidos
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="border-b border-white/10 bg-black/20">
                        <tr>
                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Año
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Entidad
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Premio / Reconocimiento
                          </th>

                          <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Importe
                          </th>

                          <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/[0.06]">
                        {premios.map(
                          (premio) => (
                            <tr
                              key={premio.id}
                              className="group transition hover:bg-white/[0.025]"
                            >
                              <td className="px-5 py-5">
                                <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/70">
                                  {premio.ano}
                                </span>
                              </td>

                              <td className="px-5 py-5">
                                <div className="flex items-center gap-3">
                                  {premio.logo ? (
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white p-1.5 shadow-lg">
                                      <img
                                        src={
                                          premio.logo
                                        }
                                        alt={
                                          premio.entidad
                                        }
                                        className="max-h-full max-w-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                                      <Icon
                                        className="h-4 w-4 text-white/30"
                                        path="M12 4v16m8-8H4"
                                      />
                                    </div>
                                  )}

                                  <span className="font-medium text-white/85">
                                    {
                                      premio.entidad
                                    }
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-5">
                                <p className="font-medium text-white/85">
                                  {premio.premio}
                                </p>

                                {premio.descripcion && (
                                  <p className="mt-1 max-w-md text-xs leading-5 text-white/30">
                                    {
                                      premio.descripcion
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="px-5 py-5">
                                <span className="font-semibold text-blue-300/90">
                                  {formatCurrency(
                                    parseEuropeanNumber(
                                      premio.valor
                                    )
                                  )}{' '}
                                  €
                                </span>
                              </td>

                              <td className="px-5 py-5">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editarPremio(
                                        premio
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                                  >
                                    <Icon
                                      className="h-3.5 w-3.5"
                                      path="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                                    />

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
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/[0.03] px-3 py-2 text-xs font-medium text-red-400/80 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                                  >
                                    <Icon
                                      className="h-3.5 w-3.5"
                                      path="M3 6h18M8 6V4h8v2m-9 0l1 15h8l1-15M10 11v6M14 11v6"
                                    />

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
          </section>
        )}
      </main>

      {/* =====================================================
          MODAL SUBVENCIÓN
      ===================================================== */}

      {modalSubvencionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/60">
                    Transparencia
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  {editingSubId
                    ? 'Editar subvención'
                    : 'Nueva subvención'}
                </h3>

                <p className="mt-1 text-xs text-white/30">
                  Información económica de
                  transparencia.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalSubvencionOpen(false)
                }
                className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-white/40 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <Icon
                  className="h-5 w-5"
                  path="M6 6l12 12M18 6L6 18"
                />
              </button>
            </div>

            <form
              onSubmit={guardarSubvencion}
              className="space-y-6 p-6"
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
                    className={inputClass}
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
                    className={inputClass}
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
                  className={inputClass}
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
                    className={selectClass}
                  >
                    <option>
                      Administración
                    </option>
                    <option>
                      Entidad privada
                    </option>
                    <option>
                      Fundación
                    </option>
                    <option>
                      Federación
                    </option>
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
                    className={selectClass}
                  >
                    <option>Local</option>
                    <option>
                      Provincial
                    </option>
                    <option>
                      Autonómico
                    </option>
                    <option>
                      Nacional
                    </option>
                    <option>
                      Europeo
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Departamento
                </label>

                <input
                  type="text"
                  value={
                    formDataSub.departamento
                  }
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      departamento:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Departamento / concejalía / organismo"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Convocatoria
                </label>

                <input
                  type="text"
                  value={
                    formDataSub.convocatoria
                  }
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      convocatoria:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Nombre de la convocatoria"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Fecha de concesión
                </label>

                <input
                  type="date"
                  value={
                    formDataSub.fechaConcesion
                  }
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      fechaConcesion:
                        e.target.value,
                    })
                  }
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Enlace a las bases
                </label>

                <input
                  type="url"
                  value={
                    formDataSub.basesLink
                  }
                  onChange={(e) =>
                    setFormDataSub({
                      ...formDataSub,
                      basesLink:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    setModalSubvencionOpen(
                      false
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400/60">
                    Reconocimientos
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  {editingPremioId
                    ? 'Editar premio o reconocimiento'
                    : 'Nuevo premio o reconocimiento'}
                </h3>

                <p className="mt-1 text-xs text-white/30">
                  Añade el reconocimiento
                  recibido por el club.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalPremioOpen(false)
                }
                className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-white/40 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <Icon
                  className="h-5 w-5"
                  path="M6 6l12 12M18 6L6 18"
                />
              </button>
            </div>

            <form
              onSubmit={guardarPremio}
              className="space-y-6 p-6"
            >
              {/* YEAR + VALUE */}

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
                    className={inputClass}
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
                    value={
                      formDataPremio.valor
                    }
                    onChange={(e) =>
                      setFormDataPremio({
                        ...formDataPremio,
                        valor:
                          e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Ej: 2.500,00"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-white/25">
                    Introduzca el importe en
                    euros.
                  </p>
                </div>
              </div>

              {/* LOGO UPLOAD */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Logo de la entidad
                </label>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* PREVIEW */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg">
                      {formDataPremio.logo ? (
                        <img
                          src={
                            formDataPremio.logo
                          }
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
                        disabled={
                          uploadingLogo
                        }
                        onChange={(e) => {
                          const file =
                            e.target
                              .files?.[0];

                          if (file) {
                            subirLogoPremio(
                              file
                            );
                          }

                          e.target.value =
                            '';
                        }}
                        className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/60 file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-white/10 file:bg-white/[0.06] file:px-4 file:py-3 file:text-xs file:font-medium file:text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <p className="mt-2 text-[11px] leading-5 text-white/25">
                        JPG, JPEG, PNG o WEBP ·
                        máximo 5 MB. El logo se
                        subirá automáticamente a
                        Cloudinary.
                      </p>

                      {uploadingLogo && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/60">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                          Subiendo logo...
                        </div>
                      )}

                      {logoUploadError && (
                        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3 py-2 text-xs leading-5 text-red-400">
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

              {/* ENTITY */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Entidad concedente *
                </label>

                <input
                  type="text"
                  required
                  value={
                    formDataPremio.entidad
                  }
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      entidad:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Ej: Ayuntamiento de Valencia"
                />
              </div>

              {/* AWARD */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Premio / reconocimiento *
                </label>

                <input
                  type="text"
                  required
                  value={
                    formDataPremio.premio
                  }
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      premio:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Ej: Premio al deporte inclusivo"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Descripción
                </label>

                <textarea
                  rows={4}
                  value={
                    formDataPremio.descripcion
                  }
                  onChange={(e) =>
                    setFormDataPremio({
                      ...formDataPremio,
                      descripcion:
                        e.target.value,
                    })
                  }
                  className={`${inputClass} resize-none`}
                  placeholder="Descripción breve del premio o reconocimiento..."
                />
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    setModalPremioOpen(false)
                  }
                  disabled={uploadingLogo}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/60">
                    Solicitud
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  Detalle de la solicitud
                </h3>

                <p className="mt-1 text-xs text-white/30">
                  Información enviada por el
                  patrocinador.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSolicitud(null)
                }
                className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-white/40 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <Icon
                  className="h-5 w-5"
                  path="M6 6l12 12M18 6L6 18"
                />
              </button>
            </div>

            <div className="space-y-1 p-6">
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
                  <div
                    key={key}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      {key}
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/70">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/15 bg-[#0a0a0a] shadow-2xl shadow-black/60">
            <div className="border-b border-white/10 bg-red-500/[0.025] px-6 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.06]">
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
                El elemento se eliminará
                permanentemente.
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarEliminacion}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
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
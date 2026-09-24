import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const Icon = ({
  path,
  className = 'w-5 h-5',
}) => (
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

// =========================================================
// HELPERS
// =========================================================

const MONTHS_ES = {
  enero: 0,
  ene: 0,
  febrero: 1,
  feb: 1,
  marzo: 2,
  mar: 2,
  abril: 3,
  abr: 3,
  mayo: 4,
  may: 4,
  junio: 5,
  jun: 5,
  julio: 6,
  jul: 6,
  agosto: 7,
  ago: 7,
  septiembre: 8,
  setiembre: 8,
  sep: 8,
  sept: 8,
  octubre: 9,
  oct: 9,
  noviembre: 10,
  nov: 10,
  diciembre: 11,
  dic: 11,
};

const getMonthIndex = (month) => {
  const normalized = String(month || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '');

  if (!normalized) return null;

  if (/^\d{1,2}$/.test(normalized)) {
    const value = Number(normalized);

    if (value >= 1 && value <= 12) {
      return value - 1;
    }
  }

  return MONTHS_ES[normalized] ?? null;
};

// ✅ CORREÇÃO 1: Extrair ano do texto quando presente (ex: "04/03/2026" ou "4 marzo 2026")
const getEventDate = (evento) => {
  if (!evento) return null;

  if (evento.dateISO) {
    const isoDate = new Date(evento.dateISO);

    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate;
    }
  }

  const dateValue = String(evento.date || '').trim();

  const dayMatch = dateValue.match(/\d{1,2}/);

  const day = dayMatch
    ? Number(dayMatch[0])
    : null;

  const monthIndex = getMonthIndex(
    evento.month
  );

  if (
    !day ||
    monthIndex === null
  ) {
    return null;
  }

  // ✅ CORREÇÃO: Tentar extrair o ano do texto digitado
  const yearMatch = dateValue.match(/\b(\d{4})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

  const result = new Date(
    year,
    monthIndex,
    day
  );

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== monthIndex ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
};

const getCompletionDate = (evento) => {
  if (!evento?.completedAt) {
    return null;
  }

  const date = new Date(
    evento.completedAt
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const isEventCompleted = (evento) => {
  return (
    evento?.status === 'FINALIZADO' ||
    Boolean(evento?.completedAt)
  );
};

const getEventPhotos = (evento) => {
  const rawPhotos =
    evento?.fotos ??
    evento?.photos ??
    [];

  if (!Array.isArray(rawPhotos)) {
    return [];
  }

  return rawPhotos.filter((foto) => {
    if (typeof foto === 'string') {
      return Boolean(foto);
    }

    return Boolean(
      foto?.url ||
      foto?.secure_url ||
      foto?.secureUrl
    );
  });
};

const getPhotoUrl = (foto) => {
  if (!foto) return '';

  if (typeof foto === 'string') {
    return foto;
  }

  return (
    foto.url ||
    foto.secure_url ||
    foto.secureUrl ||
    ''
  );
};

const getEventSortDate = (evento) => {
  if (isEventCompleted(evento)) {
    const completedDate =
      getCompletionDate(evento);

    if (completedDate) {
      return completedDate;
    }
  }

  return getEventDate(evento);
};

const getUpcomingSortDate = (evento) => {
  const date =
    getEventDate(evento);

  if (!date) return null;

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const normalized =
    new Date(date);

  normalized.setHours(
    0,
    0,
    0,
    0
  );

  if (normalized < today) {
    normalized.setFullYear(
      normalized.getFullYear() + 1
    );
  }

  return normalized;
};

const formatEventDate = (evento) => {
  const date =
    getEventDate(evento);

  if (!date) {
    return [
      evento?.date,
      evento?.month,
    ]
      .filter(Boolean)
      .join(' ');
  }

  return new Intl.DateTimeFormat(
    'es-ES',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  ).format(date);
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(
    'es-ES'
  );
};

// =========================================================
// COMPONENTE
// =========================================================

export default function Eventos() {
  const [eventos, setEventos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    inscricoesModal,
    setInscricoesModal,
  ] = useState(null);

  const [inscricoes, setInscricoes] =
    useState([]);

  const [
    loadingInscricoes,
    setLoadingInscricoes,
  ] = useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState('activos');

  const [
    itemToDelete,
    setItemToDelete,
  ] = useState(null);

  const [
    finalizarEvento,
    setFinalizarEvento,
  ] = useState(null);

  const [
    galeriaEvento,
    setGaleriaEvento,
  ] = useState(null);

  const [
    uploadingPhotos,
    setUploadingPhotos,
  ] = useState(false);

  const [
    deletingPhoto,
    setDeletingPhoto,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      type: 'PUERTAS ABIERTAS',
      name: '',
      date: '',
      month: '',
      day: 'Sábado',
      time: '',
      location:
        'Pabellón Playa Malvarrosa',
      description: '',
      isPublic: true,
    });

  // =========================================================
  // CARGAR EVENTOS
  // =========================================================

  const fetchEventos =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        );

      try {
        setLoading(true);
        setError('');

        const response =
          await fetch(
            `${API_URL}/api/eventos`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            'Error al cargar eventos'
          );
        }

        const data =
          await response.json();

        setEventos(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          'Error al buscar eventos:',
          error
        );

        setError(
          'No se han podido cargar los eventos.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // =========================================================
  // MODAL CREAR / EDITAR
  // =========================================================

  const resetForm = () => {
    setFormData({
      type: 'PUERTAS ABIERTAS',
      name: '',
      date: '',
      month: '',
      day: 'Sábado',
      time: '',
      location:
        'Pabellón Playa Malvarrosa',
      description: '',
      isPublic: true,
    });
  };

  const openModal = (
    evento = null
  ) => {
    if (evento) {
      setEditingId(
        evento.id
      );

      setFormData({
        type:
          evento.type ||
          'PUERTAS ABIERTAS',

        name:
          evento.name || '',

        date:
          evento.date || '',

        month:
          evento.month || '',

        day:
          evento.day ||
          'Sábado',

        time:
          evento.time || '',

        location:
          evento.location ||
          'Pabellón Playa Malvarrosa',

        description:
          evento.description ||
          '',

        isPublic:
          evento.isPublic !==
          undefined
            ? evento.isPublic
            : true,
      });
    } else {
      setEditingId(null);
      resetForm();
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  // =========================================================
  // GUARDAR EVENTO
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem(
        'token'
      );

    const url = editingId
      ? `${API_URL}/api/eventos/${editingId}`
      : `${API_URL}/api/eventos`;

    try {
      setSaving(true);

      const cleanFormData = {
        ...formData,
        name: formData.name.trim(),
        date: formData.date.trim(),
        month: formData.month.trim(),
        time: formData.time.trim(),
        location:
          formData.location.trim(),
        description:
          formData.description.trim(),
      };

      const response =
        await fetch(url, {
          method: editingId
            ? 'PUT'
            : 'POST',

          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            cleanFormData
          ),
        });

      if (!response.ok) {
        throw new Error(
          'No se pudo guardar el evento'
        );
      }

      setModalOpen(false);
      setEditingId(null);
      resetForm();

      await fetchEventos();
    } catch (error) {
      console.error(
        'Error al guardar:',
        error
      );

      alert(
        'No se ha podido guardar el evento.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ARCHIVAR / REACTIVAR
  // =========================================================

  const toggleActivo = async (
    id,
    currentStatus
  ) => {
    const token =
      localStorage.getItem(
        'token'
      );

    try {
      setActionLoading(
        `active-${id}`
      );

      const response =
        await fetch(
          `${API_URL}/api/eventos/${id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              isActive:
                !currentStatus,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          'Error al actualizar'
        );
      }

      await fetchEventos();
    } catch (error) {
      console.error(
        'Error al actualizar:',
        error
      );

      alert(
        'No se ha podido actualizar el evento.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // FINALIZAR EVENTO
  // =========================================================

  const handleFinalizarEvento =
    async () => {
      if (!finalizarEvento)
        return;

      const token =
        localStorage.getItem(
          'token'
        );

      try {
        setActionLoading(
          `finalizar-${finalizarEvento.id}`
        );

        const response =
          await fetch(
            `${API_URL}/api/eventos/${finalizarEvento.id}/finalizar`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            'Error al finalizar'
          );
        }

        setFinalizarEvento(
          null
        );

        await fetchEventos();
      } catch (error) {
        console.error(
          'Error al finalizar evento:',
          error
        );

        alert(
          'No se ha podido finalizar el evento.'
        );
      } finally {
        setActionLoading(null);
      }
    };

  // =========================================================
  // REABRIR EVENTO
  // =========================================================

  const handleReabrirEvento =
    async (evento) => {
      if (!evento?.id) return;

      const token =
        localStorage.getItem(
          'token'
        );

      try {
        setActionLoading(
          `reabrir-${evento.id}`
        );

        const response =
          await fetch(
            `${API_URL}/api/eventos/${evento.id}/reabrir`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            'Error al reabrir'
          );
        }

        await fetchEventos();
      } catch (error) {
        console.error(
          'Error al reabrir evento:',
          error
        );

        alert(
          'No se ha podido reabrir el evento.'
        );
      } finally {
        setActionLoading(null);
      }
    };

  // =========================================================
  // ELIMINAR EVENTO
  // =========================================================

  const confirmDelete = async () => {
    if (!itemToDelete)
      return;

    const token =
      localStorage.getItem(
        'token'
      );

    try {
      setActionLoading(
        `delete-${itemToDelete}`
      );

      const response =
        await fetch(
          `${API_URL}/api/eventos/${itemToDelete}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          'Error al eliminar'
        );
      }

      await fetchEventos();

      setItemToDelete(null);
    } catch (error) {
      console.error(
        'Error al eliminar:',
        error
      );

      alert(
        'No se ha podido eliminar el evento.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // INSCRIPCIONES
  // =========================================================

  const verInscricoes =
    async (evento) => {
      const token =
        localStorage.getItem(
          'token'
        );

      try {
        setLoadingInscricoes(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/inscricoes-eventos/evento/${evento.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            'Error al buscar inscripciones'
          );
        }

        const data =
          await response.json();

        setInscricoes(
          Array.isArray(data)
            ? data
            : []
        );

        setInscricoesModal(
          evento
        );
      } catch (error) {
        console.error(
          'Error al buscar inscripciones:',
          error
        );

        alert(
          'No se han podido cargar las inscripciones.'
        );
      } finally {
        setLoadingInscricoes(
          false
        );
      }
    };

  // =========================================================
  // OBTENER EVENTO ACTUALIZADO
  // =========================================================

  const getEventoActualizado =
    async (id) => {
      try {
        const token =
          localStorage.getItem(
            'token'
          );

        const response =
          await fetch(
            `${API_URL}/api/eventos`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          return null;
        }

        const data =
          await response.json();

        if (!Array.isArray(data)) {
          return null;
        }

        return (
          data.find(
            (evento) =>
              evento.id === id
          ) || null
        );
      } catch {
        return null;
      }
    };

  // =========================================================
  // SUBIR FOTOS
  // =========================================================

  const handleUploadPhotos =
    async (e) => {
      const files =
        Array.from(
          e.target.files || []
        );

      if (
        !files.length ||
        !galeriaEvento
      ) {
        return;
      }

      const token =
        localStorage.getItem(
          'token'
        );

      try {
        setUploadingPhotos(
          true
        );

        for (const file of files) {
          const uploadFormData =
            new FormData();

          uploadFormData.append(
            'image',
            file
          );

          const uploadResponse =
            await fetch(
              `${API_URL}/api/upload/evento`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: uploadFormData,
              }
            );

          if (
            !uploadResponse.ok
          ) {
            throw new Error(
              `Error al subir ${file.name}`
            );
          }

          const uploaded =
            await uploadResponse.json();

          const saveResponse =
            await fetch(
              `${API_URL}/api/eventos/${galeriaEvento.id}/fotos`,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                  Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                  url: uploaded.url,
                  publicId:
                    uploaded.publicId ||
                    null,
                }),
              }
            );

          if (
            !saveResponse.ok
          ) {
            throw new Error(
              `Error al guardar ${file.name}`
            );
          }
        }

        await fetchEventos();

        const updatedEvento =
          await getEventoActualizado(
            galeriaEvento.id
          );

        if (updatedEvento) {
          setGaleriaEvento(
            updatedEvento
          );
        }
      } catch (error) {
        console.error(
          'Error al subir fotos:',
          error
        );

        alert(
          'No se han podido subir todas las imágenes.'
        );
      } finally {
        setUploadingPhotos(
          false
        );

        e.target.value = '';
      }
    };

  // =========================================================
  // ELIMINAR FOTO
  // =========================================================

  const handleDeletePhoto =
    async (foto) => {
      if (
        !galeriaEvento ||
        !foto?.id
      ) {
        return;
      }

      const token =
        localStorage.getItem(
          'token'
        );

      try {
        setDeletingPhoto(
          foto.id
        );

        const response =
          await fetch(
            `${API_URL}/api/eventos/${galeriaEvento.id}/fotos/${foto.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            'Error al eliminar la foto'
          );
        }

        const updatedEvento =
          await getEventoActualizado(
            galeriaEvento.id
          );

        if (updatedEvento) {
          setGaleriaEvento(
            updatedEvento
          );
        }

        await fetchEventos();
      } catch (error) {
        console.error(
          'Error al eliminar foto:',
          error
        );

        alert(
          'No se ha podido eliminar la foto.'
        );
      } finally {
        setDeletingPhoto(
          null
        );
      }
    };

  // =========================================================
  // ESTILOS
  // =========================================================

  const getTypeStyle = (
    type
  ) => {
    const normalizedType =
      String(type || '')
        .trim()
        .toUpperCase();

    if (
      normalizedType ===
      'PUERTAS ABIERTAS'
    ) {
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    }

    if (
      normalizedType ===
        'CLINICA' ||
      normalizedType ===
        'CLÍNICA'
    ) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }

    if (
      normalizedType ===
      'EVENTO SOCIAL'
    ) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }

    return 'bg-zinc-800/60 text-zinc-400 border-zinc-700';
  };

  // =========================================================
  // FILTROS + ORDENACIÓN
  // =========================================================

  const displayedEventos =
    useMemo(() => {
      const filtered =
        activeTab === 'activos'
          ? eventos.filter(
              (evento) =>
                evento.status !==
                  'FINALIZADO' &&
                evento.isActive
            )
          : eventos.filter(
              (evento) =>
                evento.status ===
                'FINALIZADO'
            );

      return [...filtered].sort(
        (a, b) => {
          const dateA =
            activeTab === 'activos'
              ? getUpcomingSortDate(a)
              : getEventSortDate(a);

          const dateB =
            activeTab === 'activos'
              ? getUpcomingSortDate(b)
              : getEventSortDate(b);

          if (!dateA && !dateB) {
            return 0;
          }

          if (!dateA) {
            return 1;
          }

          if (!dateB) {
            return -1;
          }

          if (
            activeTab ===
            'historico'
          ) {
            return (
              dateB.getTime() -
              dateA.getTime()
            );
          }

          return (
            dateA.getTime() -
            dateB.getTime()
          );
        }
      );
    }, [
      activeTab,
      eventos,
    ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center">

          <div className="w-8 h-8 border-2 border-zinc-800 border-t-red-600 rounded-full animate-spin mb-4" />

          <div className="text-zinc-600 text-[10px] font-semibold uppercase tracking-[0.2em]">
            Cargando eventos...
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-0">

      {/* =====================================================
          CABECERA
      ===================================================== */}

      <div className="border-b border-zinc-800 pb-8">

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">

          <div>

            {/* BADGE */}

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-5">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

              <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.22em]">
                Administración
              </span>

            </div>

            {/* TÍTULO */}

            <h1 className="text-3xl md:text-[36px] leading-tight font-semibold tracking-tight text-white">
              Gestión de Eventos
            </h1>

            <p className="text-zinc-500 text-sm mt-3 max-w-2xl">
              Gestiona eventos, inscripciones y la galería de actividades del club.
            </p>

          </div>

          {/* ACCIÓN PRINCIPAL */}

          <button
            type="button"
            onClick={() =>
              openModal()
            }
            className="inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-red-500 transition-colors rounded-sm shrink-0"
          >
            <Icon
              path="M12 4.5v15m7.5-7.5h-15"
              className="w-4 h-4"
            />

            Nuevo Evento
          </button>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-6 bg-red-500/[0.04] border border-red-500/20 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-8 h-8 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">

              <Icon
                path="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                className="w-4 h-4 text-red-500"
              />

            </div>

            <p className="text-red-400 text-sm">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={fetchEventos}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[9px] font-bold uppercase tracking-[0.16em] hover:bg-zinc-800 hover:text-white transition-colors rounded-md"
          >
            Reintentar
          </button>

        </div>
      )}

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="flex items-center gap-1 border-b border-zinc-800 mt-0">

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              'activos'
            )
          }
          className={`relative flex items-center gap-2 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
            activeTab ===
            'activos'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >

          <Icon
            path="M6.75 3.75h10.5A2.25 2.25 0 0119.5 6v12a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V6a2.25 2.25 0 012.25-2.25zM8.25 8.25h7.5M8.25 12h7.5M8.25 15.75h4.5"
            className="w-4 h-4"
          />

          Próximos Eventos

          <span className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-[9px]">
            {
              eventos.filter(
                (evento) =>
                  evento.status !==
                    'FINALIZADO' &&
                  evento.isActive
              ).length
            }
          </span>

          {activeTab ===
            'activos' && (
            <span className="absolute left-0 right-0 bottom-[-1px] h-px bg-red-600" />
          )}

        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              'historico'
            )
          }
          className={`relative flex items-center gap-2 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
            activeTab ===
            'historico'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >

          <Icon
            path="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
            className="w-4 h-4"
          />

          Historial

          <span className="min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-[9px]">
            {
              eventos.filter(
                (evento) =>
                  evento.status ===
                  'FINALIZADO'
              ).length
            }
          </span>

          {activeTab ===
            'historico' && (
            <span className="absolute left-0 right-0 bottom-[-1px] h-px bg-red-600" />
          )}

        </button>

      </div>

      {/* =====================================================
          LISTA
      ===================================================== */}

      <div className="pt-8">

        {displayedEventos.length ===
        0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">

            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />

                <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">
                  {activeTab ===
                  'activos'
                    ? 'Eventos programados'
                    : 'Historial de eventos'}
                </span>

              </div>

            </div>

            <div className="p-16 text-center">

              <div className="w-12 h-12 mx-auto mb-5 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center">

                <Icon
                  path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  className="w-5 h-5 text-zinc-600"
                />

              </div>

              <p className="text-zinc-400 text-sm mb-5">
                {activeTab ===
                'activos'
                  ? 'Aún no hay eventos programados.'
                  : 'No hay eventos finalizados.'}
              </p>

              {activeTab ===
                'activos' && (
                <button
                  type="button"
                  onClick={() =>
                    openModal()
                  }
                  className="px-5 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-red-500 transition-colors rounded-md"
                >
                  Crear Primer Evento
                </button>
              )}

            </div>

          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">

            {/* CABECERA DEL CARD */}

            <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">

              <div className="flex items-center gap-2.5">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em]">
                  {activeTab ===
                  'activos'
                    ? 'Eventos programados'
                    : 'Eventos finalizados'}
                </span>

              </div>

              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-950">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                <span className="text-zinc-400 text-[9px] font-semibold uppercase tracking-wider">
                  {displayedEventos.length}{' '}
                  {displayedEventos.length ===
                  1
                    ? 'evento'
                    : 'eventos'}
                </span>

              </div>

            </div>

            {/* TABLA */}

            <div className="overflow-x-auto">

              <table className="w-full text-left min-w-[1100px]">

                <thead className="bg-zinc-950/70 border-b border-zinc-800">

                  <tr>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                      Fecha
                    </th>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                      Evento
                    </th>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                      Acceso
                    </th>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                      Galería
                    </th>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold">
                      Inscritos
                    </th>

                    <th className="px-5 py-4 text-zinc-600 text-[9px] uppercase tracking-[0.18em] font-bold text-right">
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-zinc-800/80">

                  {displayedEventos.map(
                    (ev) => {
                      const photos =
                        getEventPhotos(ev);

                      const isFinalizado =
                        isEventCompleted(ev);

                      const finalizando =
                        actionLoading ===
                        `finalizar-${ev.id}`;

                      const reabriendo =
                        actionLoading ===
                        `reabrir-${ev.id}`;

                      const changingActive =
                        actionLoading ===
                        `active-${ev.id}`;

                      const deleting =
                        actionLoading ===
                        `delete-${ev.id}`;

                      const rowBusy =
                        finalizando ||
                        reabriendo ||
                        changingActive ||
                        deleting;

                      return (
                        <tr
                          key={ev.id}
                          className="group hover:bg-white/[0.015] transition-colors"
                        >

                          {/* ✅ CORREÇÃO 2: FECHA - Mostrar data real do evento para finalizados */}

                          <td className="px-5 py-5 align-top">

                            {isFinalizado ? (
                              <>
                                <p className="text-zinc-500 text-[9px] uppercase tracking-[0.12em] font-semibold mb-1">
                                  Realizado el
                                </p>
                                <p className="text-white text-sm font-medium leading-tight capitalize">
                                  {formatEventDate(ev)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-white text-xl font-semibold leading-none tracking-tight">
                                  {ev.date || '—'}
                                </p>

                                <p className="text-red-500 text-[9px] uppercase tracking-[0.12em] font-semibold mt-2">
                                  {ev.month || '—'}{' '}
                                  ·{' '}
                                  {ev.day || '—'}
                                </p>
                              </>
                            )}

                          </td>

                          {/* EVENTO */}

                          <td className="px-5 py-5 align-top">

                            <p className="text-white text-sm font-medium">
                              {ev.name ||
                                'Sin nombre'}
                            </p>

                            <p className="text-zinc-600 text-[11px] mt-1.5">
                              {ev.time ||
                                'Horario no indicado'}{' '}
                              <span className="text-zinc-800">
                                ·
                              </span>{' '}
                              {ev.location ||
                                'Ubicación no indicada'}
                            </p>

                            {ev.description && (
                              <p className="text-zinc-600 text-[11px] mt-2 max-w-xs line-clamp-2 leading-relaxed">
                                {
                                  ev.description
                                }
                              </p>
                            )}

                            <span
                              className={`inline-flex mt-3 items-center px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-[0.12em] border ${getTypeStyle(
                                ev.type
                              )}`}
                            >
                              {ev.type ||
                                'EVENTO'}
                            </span>

                          </td>

                          {/* ESTADO */}

                          <td className="px-5 py-5 align-top">

                            {isFinalizado ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] bg-zinc-800/80 text-zinc-500 border border-zinc-700">

                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />

                                Finalizado

                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] bg-emerald-500/[0.07] text-emerald-400 border border-emerald-500/15">

                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                                Programado

                              </span>
                            )}

                          </td>

                          {/* ACCESO */}

                          <td className="px-5 py-5 align-top">

                            <span
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] border ${
                                ev.isPublic
                                  ? 'bg-emerald-500/[0.07] text-emerald-400 border-emerald-500/15'
                                  : 'bg-zinc-800/80 text-zinc-600 border-zinc-700'
                              }`}
                            >
                              {ev.isPublic
                                ? 'Público'
                                : 'Interno'}
                            </span>

                          </td>

                          {/* GALERÍA */}

                          <td className="px-5 py-5 align-top">

                            {isFinalizado ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setGaleriaEvento(
                                    ev
                                  )
                                }
                                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-[11px] font-medium transition-colors"
                              >

                                <Icon
                                  path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12"
                                  className="w-3.5 h-3.5"
                                />

                                {photos.length}{' '}
                                {photos.length ===
                                1
                                  ? 'foto'
                                  : 'fotos'}

                              </button>
                            ) : (
                              <span className="text-zinc-800 text-sm">
                                —
                              </span>
                            )}

                          </td>

                          {/* INSCRITOS */}

                          <td className="px-5 py-5 align-top">

                            {ev.isPublic ? (
                              <button
                                type="button"
                                onClick={() =>
                                  verInscricoes(
                                    ev
                                  )
                                }
                                disabled={
                                  loadingInscricoes
                                }
                                className="text-zinc-500 hover:text-blue-400 disabled:opacity-50 text-[11px] font-medium transition-colors"
                              >
                                {loadingInscricoes
                                  ? 'Cargando...'
                                  : 'Ver lista'}
                              </button>
                            ) : (
                              <span className="text-zinc-800 text-sm">
                                —
                              </span>
                            )}

                          </td>

                          {/* ACCIONES */}

                          <td className="px-5 py-5 align-top">

                            <div className="flex items-center justify-end gap-0.5">

                              {/* EDITAR */}

                              <button
                                type="button"
                                onClick={() =>
                                  openModal(
                                    ev
                                  )
                                }
                                disabled={
                                  rowBusy
                                }
                                className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 rounded-md transition-colors"
                                title="Editar"
                              >
                                <Icon
                                  path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                  className="w-4 h-4"
                                />
                              </button>

                              {/* FINALIZAR / REABRIR */}

                              {!isFinalizado ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFinalizarEvento(
                                      ev
                                    )
                                  }
                                  disabled={
                                    rowBusy
                                  }
                                  className="p-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 rounded-md transition-colors"
                                  title="Marcar como finalizado"
                                >
                                  <Icon
                                    path="M5 13l4 4L19 7"
                                    className="w-4 h-4"
                                  />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReabrirEvento(
                                      ev
                                    )
                                  }
                                  disabled={
                                    rowBusy
                                  }
                                  className="p-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 disabled:opacity-30 rounded-md transition-colors"
                                  title="Reabrir evento"
                                >
                                  <Icon
                                    path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    className="w-4 h-4"
                                  />
                                </button>
                              )}

                              {/* GALERÍA */}

                              {isFinalizado && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGaleriaEvento(
                                      ev
                                    )
                                  }
                                  disabled={
                                    rowBusy
                                  }
                                  className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 rounded-md transition-colors"
                                  title="Gestionar galería"
                                >
                                  <Icon
                                    path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12"
                                    className="w-4 h-4"
                                  />
                                </button>
                              )}

                              {/* ARCHIVAR / REACTIVAR */}

                              <button
                                type="button"
                                onClick={() =>
                                  toggleActivo(
                                    ev.id,
                                    ev.isActive
                                  )
                                }
                                disabled={
                                  rowBusy
                                }
                                className={`p-2 rounded-md disabled:opacity-30 transition-colors ${
                                  ev.isActive
                                    ? 'text-amber-500 hover:bg-amber-500/10'
                                    : 'text-emerald-500 hover:bg-emerald-500/10'
                                }`}
                                title={
                                  ev.isActive
                                    ? 'Archivar'
                                    : 'Reactivar'
                                }
                              >
                                <Icon
                                  path={
                                    ev.isActive
                                      ? 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                                      : 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                  }
                                  className="w-4 h-4"
                                />
                              </button>

                              {/* ELIMINAR */}

                              <button
                                type="button"
                                onClick={() =>
                                  setItemToDelete(
                                    ev.id
                                  )
                                }
                                disabled={
                                  rowBusy
                                }
                                className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 rounded-md transition-colors"
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
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          MODAL CREAR / EDITAR
      ===================================================== */}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                  <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Actividades
                  </p>

                </div>

                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {editingId
                    ? 'Editar Evento'
                    : 'Nuevo Evento'}
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="w-8 h-8 rounded-md border border-zinc-800 text-zinc-600 hover:text-white hover:bg-zinc-800 flex items-center justify-center disabled:opacity-40 transition-colors"
                aria-label="Cerrar"
              >
                <Icon
                  path="M6 18L18 6M6 6l12 12"
                  className="w-4 h-4"
                />
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 space-y-5"
            >

              {/* TIPO */}

              <div>

                <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                  Tipo de Evento *
                </label>

                <select
                  value={
                    formData.type
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                >
                  <option value="PUERTAS ABIERTAS">
                    Puertas Abiertas
                  </option>

                  <option value="CLINICA">
                    Clínica de Rugby
                  </option>

                  <option value="EVENTO SOCIAL">
                    Evento Social
                  </option>
                </select>

              </div>

              {/* NOMBRE */}

              <div>

                <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                  Nombre del Evento *
                </label>

                <input
                  type="text"
                  value={
                    formData.name
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                  maxLength={120}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                />

              </div>

              {/* FECHA */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div>

                  <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                    Día *
                  </label>

                  <input
                    type="text"
                    value={
                      formData.date
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                      })
                    }
                    required
                    maxLength={20}
                    placeholder="14"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                  />

                </div>

                <div>

                  <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                    Mes *
                  </label>

                  <input
                    type="text"
                    value={
                      formData.month
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        month: e.target.value,
                      })
                    }
                    required
                    maxLength={20}
                    placeholder="Septiembre"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                  />

                </div>

                <div className="col-span-2">

                  <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                    Día de la Semana *
                  </label>

                  <select
                    value={
                      formData.day
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day: e.target.value,
                      })
                    }
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                  >
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
                    <option>
                      Viernes
                    </option>
                    <option>
                      Sábado
                    </option>
                    <option>
                      Domingo
                    </option>
                  </select>

                </div>

              </div>

              {/* HORARIO / UBICACIÓN */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                    Horario *
                  </label>

                  <input
                    type="text"
                    value={
                      formData.time
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time: e.target.value,
                      })
                    }
                    required
                    maxLength={50}
                    placeholder="17:00 — 19:30"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                  />

                </div>

                <div>

                  <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                    Ubicación *
                  </label>

                  <input
                    type="text"
                    value={
                      formData.location
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location:
                          e.target.value,
                      })
                    }
                    required
                    maxLength={180}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none text-sm"
                  />

                </div>

              </div>

              {/* DESCRIPCIÓN */}

              <div>

                <label className="block text-zinc-500 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                  Descripción
                </label>

                <textarea
                  value={
                    formData.description
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                  rows={3}
                  maxLength={500}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-md focus:border-red-600 focus:ring-1 focus:ring-red-600/20 outline-none resize-none text-sm"
                />

                <p className="text-zinc-700 text-[9px] text-right mt-1">
                  {
                    formData.description
                      .length
                  }
                  /500
                </p>

              </div>

              {/* PÚBLICO */}

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">

                <div className="flex items-center justify-between gap-5">

                  <div>

                    <p className="text-white font-medium text-sm">
                      ¿Abierto al público?
                    </p>

                    <p className="text-zinc-600 text-xs mt-1">
                      Los visitantes podrán inscribirse desde la web.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isPublic:
                          !formData.isPublic,
                      })
                    }
                    aria-pressed={
                      formData.isPublic
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isPublic
                        ? 'bg-emerald-600'
                        : 'bg-zinc-700'
                    }`}
                  >

                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        formData.isPublic
                          ? 'left-6.5'
                          : 'left-0.5'
                      }`}
                    />

                  </button>

                </div>

              </div>

              {/* BOTONES */}

              <div className="flex gap-3 pt-5 border-t border-zinc-800">

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-[10px] tracking-[0.16em] hover:bg-red-500 disabled:opacity-50 transition-colors rounded-md"
                >
                  {saving
                    ? 'Guardando...'
                    : editingId
                    ? 'Guardar Cambios'
                    : 'Crear Evento'}
                </button>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase text-[10px] tracking-[0.16em] hover:bg-zinc-700 disabled:opacity-50 transition-colors rounded-md"
                >
                  Cancelar
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          MODAL GALERÍA
      ===================================================== */}

      {galeriaEvento && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setGaleriaEvento(null);
            }
          }}
        >

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">

            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                  <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Archivo del club
                  </p>

                </div>

                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {galeriaEvento.name}
                </h2>

                <p className="text-zinc-600 text-xs mt-1">
                  {formatEventDate(
                    galeriaEvento
                  )}{' '}
                  ·{' '}
                  {galeriaEvento.location}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setGaleriaEvento(
                    null
                  )
                }
                className="w-8 h-8 rounded-md border border-zinc-800 text-zinc-600 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                aria-label="Cerrar galería"
              >
                <Icon
                  path="M6 18L18 6M6 6l12 12"
                  className="w-4 h-4"
                />
              </button>

            </div>

            <div className="p-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                <div>

                  <p className="text-white font-medium text-sm">
                    Galería del evento
                  </p>

                  <p className="text-zinc-600 text-xs mt-1">

                    {
                      getEventPhotos(
                        galeriaEvento
                      ).length
                    }{' '}

                    {getEventPhotos(
                      galeriaEvento
                    ).length === 1
                      ? 'imagen'
                      : 'imágenes'}

                  </p>

                </div>

                <label
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold uppercase tracking-[0.16em] transition-colors rounded-md ${
                    uploadingPhotos
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >

                  <Icon
                    path="M12 4v16m8-8H4"
                    className="w-4 h-4"
                  />

                  {uploadingPhotos
                    ? 'Subiendo...'
                    : 'Añadir Fotos'}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={
                      handleUploadPhotos
                    }
                    disabled={
                      uploadingPhotos
                    }
                    className="hidden"
                  />

                </label>

              </div>

              {getEventPhotos(
                galeriaEvento
              ).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

                  {getEventPhotos(
                    galeriaEvento
                  ).map(
                    (foto) => (
                      <div
                        key={
                          foto.id ||
                          getPhotoUrl(
                            foto
                          )
                        }
                        className="group relative aspect-square bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden"
                      >

                        <img
                          src={getPhotoUrl(
                            foto
                          )}
                          alt={
                            galeriaEvento.name ||
                            'Foto del evento'
                          }
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {foto.id && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-end justify-end p-3">

                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePhoto(
                                  foto
                                )
                              }
                              disabled={
                                deletingPhoto ===
                                foto.id
                              }
                              className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-md transition-opacity disabled:opacity-50"
                              title="Eliminar foto"
                            >
                              <Icon
                                path="M6 18L18 6M6 6l12 12"
                                className="w-4 h-4"
                              />
                            </button>

                          </div>
                        )}

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="border border-dashed border-zinc-800 rounded-lg bg-zinc-950/40 p-14 text-center">

                  <Icon
                    path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12"
                    className="w-8 h-8 mx-auto text-zinc-700 mb-4"
                  />

                  <p className="text-zinc-400 text-sm">
                    Este evento todavía no tiene fotografías.
                  </p>

                  <p className="text-zinc-600 text-xs mt-2">
                    Añade las imágenes del evento para crear su galería.
                  </p>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          MODAL INSCRITOS
      ===================================================== */}

      {inscricoesModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setInscricoesModal(null);
            }
          }}
        >

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                  <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Registro
                  </p>

                </div>

                <h2 className="text-xl font-semibold text-white tracking-tight">
                  Inscritos
                </h2>

                <p className="text-zinc-600 text-xs mt-1">
                  {inscricoesModal.name}{' '}
                  ·{' '}
                  {inscricoes.length}{' '}
                  inscrito(s)
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setInscricoesModal(
                    null
                  )
                }
                className="w-8 h-8 rounded-md border border-zinc-800 text-zinc-600 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                aria-label="Cerrar inscritos"
              >
                <Icon
                  path="M6 18L18 6M6 6l12 12"
                  className="w-4 h-4"
                />
              </button>

            </div>

            <div className="p-6 overflow-x-auto">

              {loadingInscricoes ? (
                <div className="py-12 flex flex-col items-center">

                  <div className="w-7 h-7 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin mb-4" />

                  <p className="text-zinc-600 text-sm">
                    Cargando inscripciones...
                  </p>

                </div>
              ) : inscricoes.length ===
                0 ? (
                <p className="text-zinc-600 text-center py-8">
                  Aún no hay inscritos para este evento.
                </p>
              ) : (
                <table className="w-full text-left min-w-[600px]">

                  <thead className="border-b border-zinc-800">

                    <tr>

                      <th className="pb-3 text-zinc-600 text-[9px] uppercase tracking-[0.16em] font-bold">
                        Nombre
                      </th>

                      <th className="pb-3 text-zinc-600 text-[9px] uppercase tracking-[0.16em] font-bold">
                        Email
                      </th>

                      <th className="pb-3 text-zinc-600 text-[9px] uppercase tracking-[0.16em] font-bold">
                        Teléfono
                      </th>

                      <th className="pb-3 text-zinc-600 text-[9px] uppercase tracking-[0.16em] font-bold">
                        Fecha
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-zinc-800">

                    {inscricoes.map(
                      (insc) => (
                        <tr
                          key={
                            insc.id
                          }
                          className="hover:bg-white/[0.015] transition-colors"
                        >

                          <td className="py-3 text-white text-sm font-medium">
                            {
                              insc.fullName
                            }
                          </td>

                          <td className="py-3 text-zinc-500 text-xs">
                            {
                              insc.email
                            }
                          </td>

                          <td className="py-3 text-zinc-500 text-xs">
                            {insc.phone ||
                              '—'}
                          </td>

                          <td className="py-3 text-zinc-600 text-[10px]">
                            {formatDate(
                              insc.createdAt
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>
              )}

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRMAR FINALIZACIÓN
      ===================================================== */}

      {finalizarEvento && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setFinalizarEvento(
                null
              );
            }
          }}
        >

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-7 shadow-2xl">

            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">

              <Icon
                path="M5 13l4 4L19 7"
                className="w-5 h-5 text-emerald-400"
              />

            </div>

            <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
              Finalizar evento
            </h3>

            <p className="text-zinc-400 text-sm leading-relaxed mb-6">

              ¿Confirmas que el evento{' '}

              <span className="text-white font-medium">
                «{finalizarEvento.name}»
              </span>{' '}

              ya ha finalizado?

            </p>

            <p className="text-zinc-600 text-xs mb-6">
              Después podrás añadir las fotografías del evento en su galería.
            </p>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setFinalizarEvento(
                    null
                  )
                }
                disabled={
                  actionLoading ===
                  `finalizar-${finalizarEvento.id}`
                }
                className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase text-[10px] tracking-[0.16em] hover:bg-zinc-700 disabled:opacity-50 transition-colors rounded-md"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  handleFinalizarEvento
                }
                disabled={
                  actionLoading ===
                  `finalizar-${finalizarEvento.id}`
                }
                className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-[0.16em] hover:bg-emerald-500 disabled:opacity-50 transition-colors rounded-md"
              >
                {actionLoading ===
                `finalizar-${finalizarEvento.id}`
                  ? 'Finalizando...'
                  : 'Finalizar'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRMAR ELIMINACIÓN
      ===================================================== */}

      {itemToDelete && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() =>
            setItemToDelete(null)
          }
        >

          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-7 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="w-11 h-11 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">

              <Icon
                path="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                className="w-5 h-5 text-red-500"
              />

            </div>

            <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
              Confirmar Eliminación
            </h3>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              ¿Está seguro? El evento y su galería se eliminarán permanentemente de la base de datos.
            </p>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setItemToDelete(
                    null
                  )
                }
                disabled={
                  actionLoading ===
                  `delete-${itemToDelete}`
                }
                className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase text-[10px] tracking-[0.16em] rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmDelete
                }
                disabled={
                  actionLoading ===
                  `delete-${itemToDelete}`
                }
                className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-[10px] tracking-[0.16em] rounded-md hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {actionLoading ===
                `delete-${itemToDelete}`
                  ? 'Eliminando...'
                  : 'Sí, Eliminar'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
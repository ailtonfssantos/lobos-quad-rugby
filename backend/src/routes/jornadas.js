import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

/* =========================================================
   HELPERS
========================================================= */

const normalizePartido = (p = {}) => {
  const equipoLocalNombre =
    p.equipoLocal?.nombre ||
    p.equipoLocalNombre ||
    'Lobos Quad Rugby';

  const equipoLocalLogo =
    p.equipoLocal?.logo ||
    p.equipoLocalLogo ||
    null;

  const equipoVisitanteNombre =
    p.equipoVisitante?.nombre ||
    p.equipoVisitanteNombre ||
    p.rival ||
    '';

  const equipoVisitanteLogo =
    p.equipoVisitante?.logo ||
    p.equipoVisitanteLogo ||
    p.rivalLogo ||
    null;

  return {
    fecha: p.fecha || null,
    diaSemana: p.diaSemana || 'Sábado',
    horario: p.horario || 'TBD',

    equipoLocalNombre,
    equipoLocalLogo,

    equipoVisitanteNombre,
    equipoVisitanteLogo,

    youtubeLink:
      p.youtubeLink ||
      p.youtube ||
      null,

    status:
      p.status ||
      'PROGRAMADO',

    lobosScore:
      p.lobosScore !== undefined &&
      p.lobosScore !== null &&
      p.lobosScore !== ''
        ? parseInt(p.lobosScore, 10)
        : null,

    rivalScore:
      p.rivalScore !== undefined &&
      p.rivalScore !== null &&
      p.rivalScore !== ''
        ? parseInt(p.rivalScore, 10)
        : null
  };
};

/* =========================================================
   HELPERS - PARTIDOS
========================================================= */

const buildPartidosData = (partidos) => {
  if (!Array.isArray(partidos)) {
    return [];
  }

  return partidos
    .map(normalizePartido)
    .filter(
      (p) =>
        p.equipoVisitanteNombre &&
        p.equipoVisitanteNombre.trim() !== ''
    )
    .map((p) => ({
      rival: p.equipoVisitanteNombre,
      rivalLogo: p.equipoVisitanteLogo,

      equipoLocalNombre: p.equipoLocalNombre,
      equipoLocalLogo: p.equipoLocalLogo,

      equipoVisitanteNombre: p.equipoVisitanteNombre,
      equipoVisitanteLogo: p.equipoVisitanteLogo,

      fecha: p.fecha,
      diaSemana: p.diaSemana,
      horario: p.horario,

      youtubeLink: p.youtubeLink,

      status: p.status,

      lobosScore: p.lobosScore,
      rivalScore: p.rivalScore
    }));
};

/* =========================================================
   PUBLICA
   Obtener todas las jornadas con temporada y partidos
========================================================= */

router.get('/', async (req, res) => {
  try {
    const jornadas = await prisma.jornada.findMany({
      include: {
        temporada: true,
        partidos: true
      },
      orderBy: [
        {
          temporada: {
            dataInicio: 'desc'
          }
        },
        {
          numero: 'asc'
        }
      ]
    });

    res.json(jornadas);
  } catch (error) {
    console.error('❌ Error al buscar jornadas:', error);

    res.status(500).json({
      error: 'Error al buscar jornadas'
    });
  }
});

/* =========================================================
   PROTEGIDA
   Crear Jornada
========================================================= */

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      numero,
      temporadaId,
      competicion,
      ciudad,
      pabellon,
      fechas,
      bannerUrl,
      partidos
    } = req.body;

    /* =====================================================
       VALIDACIONES
    ===================================================== */

    if (!numero) {
      return res.status(400).json({
        error: 'El número de jornada es obligatorio'
      });
    }

    if (!competicion) {
      return res.status(400).json({
        error: 'La competición es obligatoria'
      });
    }

    if (!ciudad) {
      return res.status(400).json({
        error: 'La ciudad es obligatoria'
      });
    }

    if (!pabellon) {
      return res.status(400).json({
        error: 'El pabellón es obligatorio'
      });
    }

    /* =====================================================
       TEMPORADA
    ===================================================== */

    let temporadaIdParsed = null;

    if (
      temporadaId !== undefined &&
      temporadaId !== null &&
      temporadaId !== ''
    ) {
      temporadaIdParsed = parseInt(temporadaId, 10);

      if (Number.isNaN(temporadaIdParsed)) {
        return res.status(400).json({
          error: 'La temporada seleccionada no es válida'
        });
      }

      const temporada = await prisma.temporada.findUnique({
        where: {
          id: temporadaIdParsed
        }
      });

      if (!temporada) {
        return res.status(400).json({
          error: 'La temporada seleccionada no existe'
        });
      }
    }

    /* =====================================================
       PARTIDOS
    ===================================================== */

    const partidosData = buildPartidosData(partidos);

    /* =====================================================
       CREAR JORNADA
    ===================================================== */

    const nuevaJornada = await prisma.jornada.create({
      data: {
        numero: parseInt(numero, 10),

        temporadaId: temporadaIdParsed,

        competicion,
        ciudad,
        pabellon,
        fechas,

        bannerUrl:
          bannerUrl ||
          null,

        isActive: true,

        partidos: {
          create: partidosData
        }
      },

      include: {
        temporada: true,
        partidos: true
      }
    });

    res.status(201).json(nuevaJornada);

  } catch (error) {
    console.error('❌ Error al crear jornada:', error);

    res.status(500).json({
      error: 'Error al crear jornada',
      details: error.message
    });
  }
});

/* =========================================================
   PROTEGIDA
   Actualizar Jornada
========================================================= */

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const jornadaId = parseInt(id, 10);

    if (Number.isNaN(jornadaId)) {
      return res.status(400).json({
        error: 'El ID de la jornada no es válido'
      });
    }

    const {
      numero,
      temporadaId,
      competicion,
      ciudad,
      pabellon,
      fechas,
      bannerUrl,
      isActive,
      partidos
    } = req.body;

    /* =====================================================
       COMPROBAR JORNADA
    ===================================================== */

    const jornadaExistente = await prisma.jornada.findUnique({
      where: {
        id: jornadaId
      }
    });

    if (!jornadaExistente) {
      return res.status(404).json({
        error: 'Jornada no encontrada'
      });
    }

    /* =====================================================
       PREPARAR DATOS
    ===================================================== */

    const updateData = {};

    if (numero !== undefined) {
      const numeroParsed = parseInt(numero, 10);

      if (Number.isNaN(numeroParsed)) {
        return res.status(400).json({
          error: 'El número de jornada no es válido'
        });
      }

      updateData.numero = numeroParsed;
    }

    if (temporadaId !== undefined) {
      let temporadaIdParsed = null;

      if (
        temporadaId !== null &&
        temporadaId !== ''
      ) {
        temporadaIdParsed = parseInt(
          temporadaId,
          10
        );

        if (Number.isNaN(temporadaIdParsed)) {
          return res.status(400).json({
            error: 'La temporada seleccionada no es válida'
          });
        }

        const temporada =
          await prisma.temporada.findUnique({
            where: {
              id: temporadaIdParsed
            }
          });

        if (!temporada) {
          return res.status(400).json({
            error: 'La temporada seleccionada no existe'
          });
        }
      }

      updateData.temporadaId =
        temporadaIdParsed;
    }

    if (competicion !== undefined) {
      updateData.competicion = competicion;
    }

    if (ciudad !== undefined) {
      updateData.ciudad = ciudad;
    }

    if (pabellon !== undefined) {
      updateData.pabellon = pabellon;
    }

    if (fechas !== undefined) {
      updateData.fechas = fechas;
    }

    if (bannerUrl !== undefined) {
      updateData.bannerUrl =
        bannerUrl || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    /* =====================================================
       PARTIDOS
       Se actualizan dentro de la misma transacción
    ===================================================== */

    if (partidos !== undefined) {
      if (!Array.isArray(partidos)) {
        return res.status(400).json({
          error: 'El campo partidos debe ser un array'
        });
      }

      const partidosData =
        buildPartidosData(partidos);

      updateData.partidos = {
        deleteMany: {},
        create: partidosData
      };
    }

    /* =====================================================
       ACTUALIZAR
    ===================================================== */

    const actualizada =
      await prisma.jornada.update({
        where: {
          id: jornadaId
        },

        data: updateData,

        include: {
          temporada: true,
          partidos: true
        }
      });

    res.json(actualizada);

  } catch (error) {
    console.error(
      '❌ Error al actualizar jornada:',
      error
    );

    res.status(500).json({
      error: 'Error al actualizar jornada',
      details: error.message
    });
  }
});

/* =========================================================
   PROTEGIDA
   Eliminar Jornada
========================================================= */

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const jornadaId = parseInt(id, 10);

    if (Number.isNaN(jornadaId)) {
      return res.status(400).json({
        error: 'El ID de la jornada no es válido'
      });
    }

    const jornada =
      await prisma.jornada.findUnique({
        where: {
          id: jornadaId
        }
      });

    if (!jornada) {
      return res.status(404).json({
        error: 'Jornada no encontrada'
      });
    }

    await prisma.jornada.delete({
      where: {
        id: jornadaId
      }
    });

    res.json({
      message: 'Jornada eliminada'
    });

  } catch (error) {
    console.error(
      '❌ Error al eliminar jornada:',
      error
    );

    res.status(500).json({
      error: 'Error al eliminar jornada',
      details: error.message
    });
  }
});

export default router;
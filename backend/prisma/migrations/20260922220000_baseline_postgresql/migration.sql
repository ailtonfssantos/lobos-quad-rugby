-- CreateTable
CREATE TABLE "Cuota" (
    "id" SERIAL NOT NULL,
    "temporadaId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "temporadaId" INTEGER NOT NULL,
    "jornadaId" INTEGER,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "conceito" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "proveedor" TEXT,
    "numeroFactura" TEXT,
    "documento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingresso" (
    "id" SERIAL NOT NULL,
    "temporadaId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "conceito" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "entidade" TEXT,
    "jornadaId" INTEGER,
    "referenciaTipo" TEXT,
    "referenciaId" INTEGER,
    "documento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscricao" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sportsExperience" TEXT,
    "rugbyExperience" BOOLEAN NOT NULL DEFAULT false,
    "wheelchairUser" BOOLEAN NOT NULL DEFAULT false,
    "functionalClassification" TEXT,
    "functionalInformation" TEXT,
    "message" TEXT,
    "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscricaoEvento" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InscricaoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogador" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "classification" TEXT,
    "nationality" TEXT NOT NULL,
    "image" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jornada" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "competicion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "pabellon" TEXT NOT NULL,
    "fechas" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temporadaId" INTEGER,

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoCuota" (
    "id" SERIAL NOT NULL,
    "jogadorId" INTEGER NOT NULL,
    "cuotaId" INTEGER NOT NULL,
    "temporadaId" INTEGER NOT NULL,
    "importePago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "metodoPago" TEXT,
    "dataPago" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoCuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipanteJornada" (
    "id" SERIAL NOT NULL,
    "jornadaId" INTEGER NOT NULL,
    "jogadorId" INTEGER NOT NULL,
    "temporadaId" INTEGER NOT NULL,
    "gastosIndividuais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipanteJornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" SERIAL NOT NULL,
    "jornadaId" INTEGER NOT NULL,
    "rival" TEXT,
    "diaSemana" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "youtubeLink" TEXT,
    "lobosScore" INTEGER,
    "rivalScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PROGRAMADO',
    "equipoLocalLogo" TEXT,
    "equipoLocalNombre" TEXT,
    "equipoVisitanteLogo" TEXT,
    "equipoVisitanteNombre" TEXT,
    "fecha" TEXT,
    "rivalLogo" TEXT,

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patrocinio" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "sponsorshipType" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patrocinio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatrocinioFinanciero" (
    "id" SERIAL NOT NULL,
    "patrocinioId" INTEGER,
    "temporadaId" INTEGER NOT NULL,
    "empresa" TEXT NOT NULL,
    "importeTotal" DOUBLE PRECISION NOT NULL,
    "importeRecebido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "dataCompromiso" TIMESTAMP(3),
    "dataRecepcion" TIMESTAMP(3),
    "documento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatrocinioFinanciero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subvencion" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "fechaConcesion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ambito" TEXT NOT NULL,
    "departamento" TEXT,
    "convocatoria" TEXT,
    "basesLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subvencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubvencionFinanceira" (
    "id" SERIAL NOT NULL,
    "subvencionId" INTEGER,
    "temporadaId" INTEGER NOT NULL,
    "organismo" TEXT NOT NULL,
    "tipoAyuda" TEXT NOT NULL,
    "importeSolicitado" DOUBLE PRECISION NOT NULL,
    "importeConcedido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "importeRecebido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'SOLICITADA',
    "dataSolicitud" TIMESTAMP(3),
    "dataConcesion" TIMESTAMP(3),
    "dataRecepcion" TIMESTAMP(3),
    "documento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubvencionFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temporada" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cuotaMensual" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Temporada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cuota_temporadaId_mes_anio_key" ON "Cuota"("temporadaId" ASC, "mes" ASC, "anio" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoCuota_jogadorId_cuotaId_key" ON "PagamentoCuota"("jogadorId" ASC, "cuotaId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteJornada_jornadaId_jogadorId_key" ON "ParticipanteJornada"("jornadaId" ASC, "jogadorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PatrocinioFinanciero_patrocinioId_key" ON "PatrocinioFinanciero"("patrocinioId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SubvencionFinanceira_subvencionId_key" ON "SubvencionFinanceira"("subvencionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email" ASC);

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoEvento" ADD CONSTRAINT "InscricaoEvento_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoCuota" ADD CONSTRAINT "PagamentoCuota_cuotaId_fkey" FOREIGN KEY ("cuotaId") REFERENCES "Cuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoCuota" ADD CONSTRAINT "PagamentoCuota_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoCuota" ADD CONSTRAINT "PagamentoCuota_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteJornada" ADD CONSTRAINT "ParticipanteJornada_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteJornada" ADD CONSTRAINT "ParticipanteJornada_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteJornada" ADD CONSTRAINT "ParticipanteJornada_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partido" ADD CONSTRAINT "Partido_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "Jornada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrocinioFinanciero" ADD CONSTRAINT "PatrocinioFinanciero_patrocinioId_fkey" FOREIGN KEY ("patrocinioId") REFERENCES "Patrocinio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrocinioFinanciero" ADD CONSTRAINT "PatrocinioFinanciero_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubvencionFinanceira" ADD CONSTRAINT "SubvencionFinanceira_subvencionId_fkey" FOREIGN KEY ("subvencionId") REFERENCES "Subvencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubvencionFinanceira" ADD CONSTRAINT "SubvencionFinanceira_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

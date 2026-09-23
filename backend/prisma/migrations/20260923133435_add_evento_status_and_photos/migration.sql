-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PROGRAMADO';

-- CreateTable
CREATE TABLE "EventoFoto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventoId" INTEGER NOT NULL,

    CONSTRAINT "EventoFoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventoFoto" ADD CONSTRAINT "EventoFoto_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

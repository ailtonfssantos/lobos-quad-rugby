-- CreateTable
CREATE TABLE "PremioReconocimiento" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "valor" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "premio" TEXT NOT NULL,
    "descripcion" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PremioReconocimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedOperator" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedOperator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedOperator_clientId_operatorId_key" ON "SavedOperator"("clientId", "operatorId");

-- AddForeignKey
ALTER TABLE "SavedOperator" ADD CONSTRAINT "SavedOperator_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOperator" ADD CONSTRAINT "SavedOperator_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "OperatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

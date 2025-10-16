-- CreateTable
CREATE TABLE "TrackedToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackedToken_userId_idx" ON "TrackedToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedToken_userId_tokenId_key" ON "TrackedToken"("userId", "tokenId");

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "key_fingerprint" TEXT NOT NULL,
    "name" TEXT,
    "property_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_fingerprint_key" ON "api_keys"("key_fingerprint");

-- CreateIndex
CREATE INDEX "api_keys_property_id_idx" ON "api_keys"("property_id");

-- CreateIndex
CREATE INDEX "api_keys_key_fingerprint_idx" ON "api_keys"("key_fingerprint");

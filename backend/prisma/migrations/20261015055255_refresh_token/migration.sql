-- AlterTable
DO $$
BEGIN
    ALTER TABLE "Lead" ALTER COLUMN "leadCode" SET DEFAULT concat('CRM-', lpad(nextval('lead_code_seq'::regclass)::text, 6, '0'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "parent_id" TEXT,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_reason" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_family" ON "refresh_tokens"("family");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_action_createdAt_idx" ON "AuditLog"("entityType", "action", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_isDeleted_assignedToUserId_status_createdAt_idx" ON "Lead"("isDeleted", "assignedToUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_isDeleted_status_createdAt_idx" ON "Lead"("isDeleted", "status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_recipientUserId_isRead_createdAt_idx" ON "Notification"("recipientUserId", "isRead", "createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_user_id_fkey'
    ) THEN
        ALTER TABLE "refresh_tokens" 
        ADD CONSTRAINT "refresh_tokens_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_parent_id_fkey'
    ) THEN
        ALTER TABLE "refresh_tokens" 
        ADD CONSTRAINT "refresh_tokens_parent_id_fkey" 
        FOREIGN KEY ("parent_id") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

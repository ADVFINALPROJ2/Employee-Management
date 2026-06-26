-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "details" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

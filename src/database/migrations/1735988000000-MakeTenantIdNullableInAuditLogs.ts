import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTenantIdNullableInAuditLogs1735988000000 implements MigrationInterface {
  name = 'MakeTenantIdNullableInAuditLogs1735988000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make tenant_id nullable to support system-level audit events (e.g., login attempts for non-existent users)
    await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "tenant_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This rollback might fail if there are audit logs with null tenant_id
    await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "tenant_id" SET NOT NULL`);
  }
}
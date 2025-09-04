import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1704067200000 implements MigrationInterface {
  name = 'InitialMigration1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create audit_action_types table
    await queryRunner.query(`
      CREATE TABLE "audit_action_types" (
        "action_type_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action_name" character varying(100) NOT NULL,
        "description" character varying(255) NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_action_types" PRIMARY KEY ("action_type_id"),
        CONSTRAINT "UQ_audit_action_types_action_name" UNIQUE ("action_name")
      )
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "audit_log_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NULL,
        "action_type_id" uuid NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" uuid NULL,
        "ip_address" inet NOT NULL,
        "user_agent" text NULL,
        "request_data" jsonb NULL,
        "response_data" jsonb NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("audit_log_id"),
        CONSTRAINT "FK_audit_logs_action_type" FOREIGN KEY ("action_type_id") REFERENCES "audit_action_types"("action_type_id") ON DELETE RESTRICT
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_tenant_id" ON "audit_logs" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action_type_id" ON "audit_logs" ("action_type_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_type" ON "audit_logs" ("entity_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);

    // Insert default audit action types
    await queryRunner.query(`
      INSERT INTO "audit_action_types" ("action_type_id", "action_name", "description") VALUES 
      (uuid_generate_v4(), 'TENANT_REGISTERED', 'Hospital tenant registration'),
      (uuid_generate_v4(), 'USER_CREATED', 'User account creation'),
      (uuid_generate_v4(), 'EMAIL_VERIFICATION_SENT', 'Email verification sent'),
      (uuid_generate_v4(), 'EMAIL_VERIFIED', 'Email address verified'),
      (uuid_generate_v4(), 'LOGIN_ATTEMPT', 'User login attempt'),
      (uuid_generate_v4(), 'LOGIN_SUCCESS', 'Successful user login'),
      (uuid_generate_v4(), 'LOGIN_FAILED', 'Failed user login'),
      (uuid_generate_v4(), 'PASSWORD_RESET_REQUESTED', 'Password reset requested'),
      (uuid_generate_v4(), 'PASSWORD_RESET_COMPLETED', 'Password reset completed'),
      (uuid_generate_v4(), 'USER_ROLE_ASSIGNED', 'User role assigned'),
      (uuid_generate_v4(), 'USER_STATUS_CHANGED', 'User status changed'),
      (uuid_generate_v4(), 'PROFILE_UPDATED', 'User profile updated')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_entity_type"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_action_type_id"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_tenant_id"`);
    
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "audit_action_types"`);
  }
}

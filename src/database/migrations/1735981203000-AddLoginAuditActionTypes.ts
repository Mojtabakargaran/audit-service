import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginAuditActionTypes1735981203000 implements MigrationInterface {
  name = 'AddLoginAuditActionTypes1735981203000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert login-related audit action types
    await queryRunner.query(`
      INSERT INTO "audit_action_types" ("action_name", "description", "created_at") VALUES
      ('login_success', 'Successful login attempt', NOW()),
      ('login_failed_invalid_credentials', 'Failed login with wrong email/password', NOW()),
      ('login_failed_account_locked', 'Login attempt on locked account', NOW()),
      ('login_failed_account_inactive', 'Login attempt on inactive account', NOW()),
      ('account_locked', 'Account locked due to failed attempts', NOW()),
      ('account_unlocked', 'Account automatically unlocked after timeout', NOW())
      ON CONFLICT ("action_name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove login-related audit action types
    await queryRunner.query(`
      DELETE FROM "audit_action_types" 
      WHERE "action_name" IN (
        'login_success',
        'login_failed_invalid_credentials', 
        'login_failed_account_locked',
        'login_failed_account_inactive',
        'account_locked',
        'account_unlocked'
      )
    `);
  }
}
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuditActionType } from './audit-action-type.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid', { name: 'audit_log_id' })
  auditLogId: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'action_type_id', type: 'uuid' })
  actionTypeId: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ name: 'ip_address', type: 'inet' })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'request_data', type: 'jsonb', nullable: true })
  requestData: any | null;

  @Column({ name: 'response_data', type: 'jsonb', nullable: true })
  responseData: any | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => AuditActionType)
  @JoinColumn({ name: 'action_type_id' })
  actionType: AuditActionType;
}

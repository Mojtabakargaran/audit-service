import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_action_types')
export class AuditActionType {
  @PrimaryGeneratedColumn('uuid', { name: 'action_type_id' })
  actionTypeId: string;

  @Column({ name: 'action_name', type: 'varchar', length: 100, unique: true })
  actionName: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

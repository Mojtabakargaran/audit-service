import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditActionType } from './audit-action-type.entity';
import { AuditService } from './audit.service';
import { AuditEventController } from './audit-event.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, AuditActionType]),
  ],
  controllers: [AuditEventController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

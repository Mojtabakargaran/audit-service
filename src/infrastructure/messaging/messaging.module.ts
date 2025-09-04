import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { AuditModule } from '../../domains/audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}

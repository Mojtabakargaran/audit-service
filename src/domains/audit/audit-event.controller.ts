import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';

@Controller()
export class AuditEventController {
  constructor(private readonly auditService: AuditService) {}

  @MessagePattern('email.verified')
  async handleEmailVerifiedEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'email_verified',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: eventData.data.ipAddress || '127.0.0.1',
      requestData: {
        email: eventData.data.email,
        verificationToken: eventData.data.verificationToken,
        verifiedAt: eventData.data.verifiedAt,
      },
    });
  }

  @MessagePattern('email.verification.failed')
  async handleEmailVerificationFailedEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'email_verification_failed',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: eventData.data.ipAddress || '127.0.0.1',
      requestData: {
        email: eventData.data.email,
        verificationToken: eventData.data.verificationToken,
        failureReason: eventData.data.failureReason,
      },
    });
  }

  @MessagePattern('verification.email.sent')
  async handleVerificationEmailSentEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'verification_email_sent',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: '127.0.0.1', // Email sending doesn't have user IP
      requestData: {
        email: eventData.data.email,
        verificationToken: eventData.data.verificationToken,
        expiresAt: eventData.data.expiresAt,
        language: eventData.data.language,
      },
    });
  }
}

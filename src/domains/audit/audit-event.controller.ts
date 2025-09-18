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

  @MessagePattern('password.reset.requested')
  async handlePasswordResetRequestedEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'password_reset_requested',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: eventData.data.ipAddress,
      userAgent: eventData.data.userAgent,
      requestData: {
        email: eventData.data.email,
        requestedAt: eventData.data.requestedAt,
      },
    });
  }

  @MessagePattern('password.reset.email.sent')
  async handlePasswordResetEmailSentEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'password_reset_email_sent',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: '127.0.0.1', // Email sending doesn't have user IP
      requestData: {
        email: eventData.data.email,
        resetToken: eventData.data.resetToken,
        expiresAt: eventData.data.expiresAt,
        requestedAt: eventData.data.requestedAt,
      },
    });
  }

  @MessagePattern('password.reset.completed')
  async handlePasswordResetCompletedEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'password_reset_completed',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: eventData.data.ipAddress,
      userAgent: eventData.data.userAgent,
      requestData: {
        email: eventData.data.email,
        resetToken: eventData.data.resetToken,
        resetAt: eventData.data.resetAt,
      },
    });
  }

  @MessagePattern('password.reset.failed')
  async handlePasswordResetFailedEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: eventData.data.userId,
      actionName: 'password_reset_failed',
      entityType: 'user',
      entityId: eventData.data.userId,
      ipAddress: eventData.data.ipAddress,
      userAgent: eventData.data.userAgent,
      requestData: {
        email: eventData.data.email,
        resetToken: eventData.data.resetToken,
        failureReason: eventData.data.failureReason,
        attemptedAt: eventData.data.attemptedAt,
      },
    });
  }

  @MessagePattern('password.reset.rate.limit.exceeded')
  async handlePasswordResetRateLimitExceededEvent(@Payload() eventData: any): Promise<void> {
    await this.auditService.createAuditLog({
      tenantId: eventData.data.tenantId,
      userId: undefined, // Rate limit events may not have specific user
      actionName: 'password_reset_rate_limit_exceeded',
      entityType: 'rate_limit',
      ipAddress: eventData.data.ipAddress,
      userAgent: eventData.data.userAgent,
      requestData: {
        email: eventData.data.email,
        requestCount: eventData.data.requestCount,
        windowStart: eventData.data.windowStart,
        blockedAt: eventData.data.blockedAt,
      },
    });
  }
}

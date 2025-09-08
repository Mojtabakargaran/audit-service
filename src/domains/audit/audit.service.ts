import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from './audit-log.entity';
import { AuditActionType } from './audit-action-type.entity';

interface AuditLogData {
  tenantId: string;
  userId?: string;
  actionName: string;
  entityType: string;
  entityId?: string;
  ipAddress: string;
  userAgent?: string;
  requestData?: any;
  responseData?: any;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(AuditActionType)
    private auditActionTypeRepository: Repository<AuditActionType>,
  ) {}

  async createAuditLog(auditData: AuditLogData): Promise<void> {
    try {
      // Find or create action type
      let actionType = await this.auditActionTypeRepository.findOne({
        where: { actionName: auditData.actionName },
      });

      if (!actionType) {
        actionType = this.auditActionTypeRepository.create({
          actionTypeId: uuidv4(),
          actionName: auditData.actionName,
          description: `Auto-generated action type for ${auditData.actionName}`,
        });
        await this.auditActionTypeRepository.save(actionType);
      }

      // Create audit log
      const auditLog = this.auditLogRepository.create({
        auditLogId: uuidv4(),
        tenantId: auditData.tenantId,
        userId: auditData.userId || null,
        actionTypeId: actionType.actionTypeId,
        entityType: auditData.entityType,
        entityId: auditData.entityId || null,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent || null,
        requestData: auditData.requestData || null,
        responseData: auditData.responseData || null,
      });

      await this.auditLogRepository.save(auditLog);
      console.log(`Audit log created successfully for action: ${auditData.actionName}`);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to prevent breaking event processing
    }
  }

  async handleAuditRequestEvent(eventData: any): Promise<void> {
    try {
      const auditData: AuditLogData = {
        tenantId: eventData.tenantId,
        userId: eventData.userId,
        actionName: eventData.actionName,
        entityType: eventData.entityType,
        entityId: eventData.entityId,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
        requestData: eventData.requestData,
        responseData: eventData.responseData,
      };

      await this.createAuditLog(auditData);
    } catch (error) {
      console.error('Failed to handle audit request event:', error);
    }
  }
}

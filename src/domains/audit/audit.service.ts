import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from './audit-log.entity';
import { AuditActionType } from './audit-action-type.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(AuditActionType)
    private auditActionTypeRepository: Repository<AuditActionType>,
  ) {}

  async createAuditLog(createDto: CreateAuditLogDto): Promise<ApiResponseDto> {
    try {
      // Find or create action type
      let actionType = await this.auditActionTypeRepository.findOne({
        where: { actionName: createDto.actionName },
      });

      if (!actionType) {
        actionType = this.auditActionTypeRepository.create({
          actionTypeId: uuidv4(),
          actionName: createDto.actionName,
          description: `Auto-generated action type for ${createDto.actionName}`,
        });
        await this.auditActionTypeRepository.save(actionType);
      }

      // Create audit log
      const auditLog = this.auditLogRepository.create({
        auditLogId: uuidv4(),
        tenantId: createDto.tenantId,
        userId: createDto.userId || null,
        actionTypeId: actionType.actionTypeId,
        entityType: createDto.entityType,
        entityId: createDto.entityId || null,
        ipAddress: createDto.ipAddress,
        userAgent: createDto.userAgent || null,
        requestData: createDto.requestData || null,
        responseData: createDto.responseData || null,
      });

      const savedAuditLog = await this.auditLogRepository.save(auditLog);

      return new ApiResponseDto('AUDIT_LOGGED', 'Audit entry created successfully', {
        auditLogId: savedAuditLog.auditLogId,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw new BadRequestException({
        code: 'AUDIT_LOG_FAILED',
        message: 'Failed to create audit log entry',
      });
    }
  }

  async handleAuditRequestEvent(eventData: any): Promise<void> {
    try {
      const createDto: CreateAuditLogDto = {
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

      await this.createAuditLog(createDto);
    } catch (error) {
      console.error('Failed to handle audit request event:', error);
    }
  }
}

import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';

@ApiTags('Audit')
@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('log')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create audit log entry' })
  @ApiResponse({ 
    status: 201, 
    description: 'Audit entry created successfully',
    type: ApiResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid audit data' 
  })
  async createAuditLog(@Body() createDto: CreateAuditLogDto): Promise<ApiResponseDto> {
    return this.auditService.createAuditLog(createDto);
  }
}

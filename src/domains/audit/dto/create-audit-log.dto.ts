import { IsString, IsUUID, IsNotEmpty, IsOptional, IsIP } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Action name' })
  @IsString()
  @IsNotEmpty()
  actionName: string;

  @ApiProperty({ description: 'Entity type' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Entity ID', required: false })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiProperty({ description: 'IP address' })
  @IsIP()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ description: 'Request data', required: false })
  @IsOptional()
  requestData?: any;

  @ApiProperty({ description: 'Response data', required: false })
  @IsOptional()
  responseData?: any;
}

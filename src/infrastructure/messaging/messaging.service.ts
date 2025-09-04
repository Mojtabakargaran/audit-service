import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { AuditService } from '../../domains/audit/audit.service';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://admin:kargaran1367@localhost:5672';
      console.log('Audit Service connecting to RabbitMQ at:', rabbitmqUrl);
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchanges
      await this.channel.assertExchange('tenant-events', 'topic', { durable: true });
      await this.channel.assertExchange('user-events', 'topic', { durable: true });
      await this.channel.assertExchange('notification-events', 'topic', { durable: true });

      // Set up event consumers for audit logging
      await this.setupEventConsumers();

      console.log('Audit Service RabbitMQ connection established and consumers ready');
    } catch (error) {
      console.error('Audit Service failed to connect to RabbitMQ:', error);
      // Don't throw error to allow service to start without RabbitMQ initially
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('Audit Service RabbitMQ connections closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connections:', error);
    }
  }

  private async setupEventConsumers(): Promise<void> {
    if (!this.channel) {
      console.warn('Cannot setup event consumers: RabbitMQ not connected');
      return;
    }

    // Consumer for tenant events
    const tenantQueue = 'audit-tenant-events';
    await this.channel.assertQueue(tenantQueue, { durable: true });
    await this.channel.bindQueue(tenantQueue, 'tenant-events', 'tenant.registered');

    await this.channel.consume(tenantQueue, async (message: any) => {
      if (message) {
        try {
          const event = JSON.parse(message.content.toString());
          await this.handleTenantRegisteredEvent(event);
          this.channel?.ack(message);
        } catch (error) {
          console.error('Error processing tenant event:', error);
          this.channel?.nack(message, false, false); // Don't requeue on error
        }
      }
    });

    // Consumer for user events
    const userQueue = 'audit-user-events';
    await this.channel.assertQueue(userQueue, { durable: true });
    await this.channel.bindQueue(userQueue, 'user-events', 'user.created');

    await this.channel.consume(userQueue, async (message: any) => {
      if (message) {
        try {
          const event = JSON.parse(message.content.toString());
          await this.handleUserCreatedEvent(event);
          this.channel?.ack(message);
        } catch (error) {
          console.error('Error processing user event:', error);
          this.channel?.nack(message, false, false); // Don't requeue on error
        }
      }
    });

    console.log('Event consumers setup completed');
  }

  private async handleTenantRegisteredEvent(event: any): Promise<void> {
    try {
      console.log('Processing tenant.registered event:', event.eventId);
      
      await this.auditService.createAuditLog({
        tenantId: event.data.tenantId,
        userId: event.data.ownerId,
        actionName: 'tenant.registered',
        entityType: 'tenant',
        entityId: event.data.tenantId,
        ipAddress: '127.0.0.1', // Default for system events
        userAgent: 'System',
        requestData: {
          hospitalName: event.data.hospitalName,
          subdomain: event.data.subdomain,
          hospitalLicenseNumber: event.data.hospitalLicenseNumber,
          ownerEmail: event.data.ownerEmail,
        },
        responseData: {
          eventId: event.eventId,
          timestamp: event.timestamp,
          success: true,
        },
      });

      console.log('Tenant registration audit log created successfully');
    } catch (error) {
      console.error('Failed to create tenant registration audit log:', error);
    }
  }

  private async handleUserCreatedEvent(event: any): Promise<void> {
    try {
      console.log('Processing user.created event:', event.eventId);
      
      await this.auditService.createAuditLog({
        tenantId: event.data.tenantId,
        userId: event.data.userId,
        actionName: 'user.created',
        entityType: 'user',
        entityId: event.data.userId,
        ipAddress: '127.0.0.1', // Default for system events
        userAgent: 'System',
        requestData: {
          email: event.data.email,
          fullName: event.data.fullName,
          roleType: event.data.roleType,
          status: event.data.status,
        },
        responseData: {
          eventId: event.eventId,
          timestamp: event.timestamp,
          success: true,
        },
      });

      console.log('User creation audit log created successfully');
    } catch (error) {
      console.error('Failed to create user creation audit log:', error);
    }
  }

  async consumeEvents(exchange: string, queue: string, handler: (data: any) => void): Promise<void> {
    try {
      if (!this.channel) {
        console.warn(`Cannot setup consumer for ${exchange}/${queue}: RabbitMQ not connected`);
        return;
      }

      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.consume(queue, async (message: any) => {
        if (message) {
          try {
            const data = JSON.parse(message.content.toString());
            await handler(data);
            this.channel?.ack(message);
          } catch (error) {
            console.error(`Error processing message from ${queue}:`, error);
            this.channel?.nack(message, false, false);
          }
        }
      });

      console.log(`Event consumer setup for ${exchange}/${queue}`);
    } catch (error) {
      console.error(`Failed to set up consumer for ${exchange}/${queue}:`, error);
      throw error;
    }
  }
}

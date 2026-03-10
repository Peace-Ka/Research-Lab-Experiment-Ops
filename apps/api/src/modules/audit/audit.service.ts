import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  log(action: string, entityType: string, entityId: string): void {
    this.logger.log(`${action}:${entityType}:${entityId}`);
  }
}

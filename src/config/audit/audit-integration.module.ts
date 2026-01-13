import { AuditDomainEventHandler } from '@application/events/audit-domain-event.handler';
import { LoggerModule } from '@config/logger/logger.module';
import { PrismaModule } from '@config/prisma/prisma.module';
import { AuditLogRepository } from '@infrastructure/persistence/prisma/repositories/audit-log/audit-log.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AUDIT_LOG_REPOSITORY } from '@shared/constants/tokens';

/**
 * Módulo de integración de auditoría específico del proyecto.
 * Incluye el handler y el repositorio que dependen de implementaciones del proyecto.
 *
 * Este módulo debe importarse después de AuditModule.forRoot() en AppModule.
 */
@Module({
    imports: [PrismaModule, CqrsModule, LoggerModule],
    providers: [
        // Repositorio de auditoría
        {
            provide: AUDIT_LOG_REPOSITORY,
            useClass: AuditLogRepository,
        },
        // Handler de eventos de auditoría
        AuditDomainEventHandler,
    ],
    exports: [AUDIT_LOG_REPOSITORY],
})
export class AuditIntegrationModule {}

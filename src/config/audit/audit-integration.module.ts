// Módulo de integración de auditoría - DESHABILITADO
// Este módulo requiere implementaciones que no están disponibles en el template base
// Descomenta y configura cuando necesites auditoría

// import { LoggerModule } from '@config/logger/logger.module';
// import { PrismaModule } from '@config/prisma/prisma.module';
// import { Module } from '@nestjs/common';
// import { CqrsModule } from '@nestjs/cqrs';

// /**
//  * Módulo de integración de auditoría específico del proyecto.
//  * Incluye el handler y el repositorio que dependen de implementaciones del proyecto.
//  *
//  * Este módulo debe importarse después de AuditModule.forRoot() en AppModule.
//  */
// @Module({
//     imports: [PrismaModule, CqrsModule, LoggerModule],
//     providers: [
//         // Repositorio de auditoría
//         // AuditLogRepository,
//         // Handler de eventos de auditoría
//         // AuditDomainEventHandler,
//     ],
//     exports: [],
// })
// export class AuditIntegrationModule {}

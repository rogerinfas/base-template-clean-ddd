import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PresentationModule } from './presentation/presentation.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { BetterAuthModule } from './infrastructure/config/better-auth/better-auth.module';
import { PrismaModule } from './config/prisma/prisma.module';
import { SeedModule } from './config/seed/seed.module';

/**
 * App Module
 * 
 * Módulo raíz de la aplicación.
 * Importa todos los módulos necesarios para el funcionamiento del sistema.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        PrismaModule, // Prisma debe estar antes de Better Auth
        BetterAuthModule, // Better Auth para autenticación
        SeedModule, // Seeds de inicialización
        PresentationModule, // Presentación (controllers)
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: DomainExceptionFilter,
        },
    ],
})
export class AppModule {}

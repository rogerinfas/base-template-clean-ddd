import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PresentationModule } from './presentation/presentation.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';

/**
 * App Module
 * 
 * Módulo raíz de la aplicación.
 * Solo importa el módulo de presentación (que a su vez importa el de aplicación).
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PresentationModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: DomainExceptionFilter,
        },
    ],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configurar prefijo global
    app.setGlobalPrefix('api');

    // Habilitar validación automática de DTOs
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Elimina propiedades no definidas en el DTO
            forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
            transform: true, // Transforma los payloads a instancias de DTO
            transformOptions: {
                enableImplicitConversion: true, // Convierte tipos automáticamente
            },
        }),
    );

    // Habilitar CORS
    app.enableCors();

    const port = process.env.PORT || 4000;
    await app.listen(port);

    Logger.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}/api`);
    Logger.log(`📚 Documentación: http://localhost:${port}/api-docs (próximamente)`);
}

bootstrap();

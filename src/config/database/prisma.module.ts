import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo de Prisma
 * Provee PrismaService de forma global
 */
@Global()
@Module({
    imports: [],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}


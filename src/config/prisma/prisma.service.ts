import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        // Solo logs de errores y warnings - sin queries para reducir ruido
        super({
            log: ['warn', 'error'] as Prisma.LogLevel[],
        });
    }

    async onModuleInit() {
        await this.$connect();
        // Query logging desactivado para reducir ruido
        // this.setupQueryLogging();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

import { Module } from '@nestjs/common';
import { PrismaService } from '@config/database/prisma.service';
import { UserRepository } from './persistence/prisma/repositories/user.repository';
import { ProductRepository } from './persistence/prisma/repositories/product.repository';
import { USER_REPOSITORY, PRODUCT_REPOSITORY } from '@shared/constants/tokens';

/**
 * Infrastructure Module
 * 
 * Provee las implementaciones concretas de los repositorios.
 * Aquí se hace el binding entre interfaces y implementaciones.
 */
@Module({
    providers: [
        PrismaService,
        {
            provide: USER_REPOSITORY,
            useClass: UserRepository,
        },
        {
            provide: PRODUCT_REPOSITORY,
            useClass: ProductRepository,
        },
    ],
    exports: [USER_REPOSITORY, PRODUCT_REPOSITORY, PrismaService],
})
export class InfrastructureModule {}


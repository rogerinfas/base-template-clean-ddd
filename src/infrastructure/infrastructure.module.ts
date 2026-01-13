import { Module } from '@nestjs/common';
import { PrismaModule } from '@config/prisma/prisma.module';
import { UserRepository } from './persistence/prisma/repositories/user.repository';
import { ProductRepository } from './persistence/prisma/repositories/product.repository';
import { RoleRepository } from './persistence/prisma/repositories/role.repository';
import { PermissionRepository } from './persistence/prisma/repositories/permission.repository';
import { USER_REPOSITORY, PRODUCT_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '@shared/constants/tokens';

/**
 * Infrastructure Module
 * 
 * Provee las implementaciones concretas de los repositorios.
 * Aquí se hace el binding entre interfaces y implementaciones.
 */
@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: USER_REPOSITORY,
            useClass: UserRepository,
        },
        {
            provide: PRODUCT_REPOSITORY,
            useClass: ProductRepository,
        },
        {
            provide: ROLE_REPOSITORY,
            useClass: RoleRepository,
        },
        {
            provide: PERMISSION_REPOSITORY,
            useClass: PermissionRepository,
        },
    ],
    exports: [USER_REPOSITORY, PRODUCT_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY],
})
export class InfrastructureModule {}


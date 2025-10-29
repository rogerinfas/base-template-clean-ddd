import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

// User Use Cases
import { CreateUserCommand } from './use-cases/user/commands/create-user.command';
import { GetUserByIdQuery } from './use-cases/user/queries/get-user-by-id.query';
import { GetAllUsersQuery } from './use-cases/user/queries/get-all-users.query';

// Product Use Cases
import { CreateProductCommand } from './use-cases/product/commands/create-product.command';
import { UpdateProductCommand } from './use-cases/product/commands/update-product.command';
import { GetProductsPaginatedQuery } from './use-cases/product/queries/get-products-paginated.query';

/**
 * Application Module
 * 
 * Contiene todos los casos de uso (Commands y Queries).
 * Importa InfrastructureModule para acceder a los repositorios.
 */
@Module({
    imports: [InfrastructureModule],
    providers: [
        // User
        CreateUserCommand,
        GetUserByIdQuery,
        GetAllUsersQuery,

        // Product
        CreateProductCommand,
        UpdateProductCommand,
        GetProductsPaginatedQuery,
    ],
    exports: [
        // User
        CreateUserCommand,
        GetUserByIdQuery,
        GetAllUsersQuery,

        // Product
        CreateProductCommand,
        UpdateProductCommand,
        GetProductsPaginatedQuery,
    ],
})
export class ApplicationModule {}


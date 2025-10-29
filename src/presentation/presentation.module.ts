import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { UsersController } from './controllers/users.controller';
import { ProductsController } from './controllers/products.controller';

/**
 * Presentation Module
 * 
 * Contiene los controladores HTTP.
 * Importa ApplicationModule para usar los casos de uso.
 */
@Module({
    imports: [ApplicationModule],
    controllers: [UsersController, ProductsController],
})
export class PresentationModule {}


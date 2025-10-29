import { Inject, Injectable } from '@nestjs/common';
import { Product } from '@domain/entities/product.entity';
import { Price } from '@domain/value-objects/price.vo';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/repositories/product.repository.interface';

/**
 * Command: CreateProduct
 * 
 * Crea un nuevo producto en el sistema.
 */

export interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    stock: number;
}

@Injectable()
export class CreateProductCommand {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) {}

    async execute(dto: CreateProductDto): Promise<Product> {
        // 1. Crear Value Object Price (con validación)
        const price = new Price(dto.price);

        // 2. Crear entidad Product
        const product = Product.create({
            name: dto.name,
            description: dto.description,
            price,
            stock: dto.stock,
        });

        // 3. Persistir
        return await this.productRepository.create(product);
    }
}


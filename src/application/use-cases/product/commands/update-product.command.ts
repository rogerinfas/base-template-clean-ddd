import { Inject, Injectable } from '@nestjs/common';
import { Product } from '@domain/entities/product.entity';
import { Price } from '@domain/value-objects/price.vo';
import { IProductRepository, PRODUCT_REPOSITORY } from '@domain/repositories/product.repository.interface';
import { EntityNotFoundException } from '@domain/exceptions/domain.exceptions';

/**
 * Command: UpdateProduct
 * 
 * Actualiza un producto existente.
 */

export interface UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
}

@Injectable()
export class UpdateProductCommand {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) {}

    async execute(id: string, dto: UpdateProductDto): Promise<Product> {
        // 1. Buscar producto existente
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new EntityNotFoundException('Product', id);
        }

        // 2. Actualizar usando método de la entidad
        let updatedProduct = product;

        if (dto.name || dto.description || dto.price) {
            const updates: {
                name?: string;
                description?: string;
                price?: Price;
            } = {};

            if (dto.name) updates.name = dto.name;
            if (dto.description !== undefined) updates.description = dto.description;
            if (dto.price) updates.price = new Price(dto.price);

            updatedProduct = updatedProduct.updateDetails(updates);
        }

        if (dto.stock !== undefined) {
            const stockDiff = dto.stock - product.stock;
            if (stockDiff > 0) {
                updatedProduct = updatedProduct.incrementStock(stockDiff);
            } else if (stockDiff < 0) {
                updatedProduct = updatedProduct.decrementStock(Math.abs(stockDiff));
            }
        }

        // 3. Persistir
        return await this.productRepository.update(id, updatedProduct);
    }
}


import { Inject, Injectable } from '@nestjs/common';
import { Product } from '@domain/entities/product.entity';
import {
    PRODUCT_REPOSITORY,
    PaginatedResult,
    PaginationParams,
} from '@domain/repositories/product.repository.interface';
import type { IProductRepository } from '@domain/repositories/product.repository.interface';

/**
 * Query: GetProductsPaginated
 * 
 * Obtiene productos con paginación.
 * Ejemplo de query compleja con paginación.
 */

@Injectable()
export class GetProductsPaginatedQuery {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) {}

    async execute(params: PaginationParams): Promise<PaginatedResult<Product>> {
        return await this.productRepository.findPaginated(params);
    }
}


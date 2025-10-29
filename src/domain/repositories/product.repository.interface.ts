import { Product } from '../entities/product.entity';

/**
 * Interface de Repositorio: Product
 * 
 * Incluye métodos de paginación y filtrado.
 */

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface IProductRepository {
    // Búsquedas
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    findPaginated(params: PaginationParams): Promise<PaginatedResult<Product>>;
    findByName(name: string): Promise<Product[]>;
    findActive(): Promise<Product[]>;

    // Escritura
    create(product: Product): Promise<Product>;
    update(id: string, product: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<void>;

    // Verificaciones
    existsById(id: string): Promise<boolean>;
}

// Token para inyección de dependencias
export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');


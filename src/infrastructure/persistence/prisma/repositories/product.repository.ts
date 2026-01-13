import { Injectable } from '@nestjs/common';
import {
    IProductRepository,
    PaginatedResult,
    PaginationParams,
} from '@domain/repositories/product.repository.interface';
import { Product } from '@domain/entities/product.entity';
import { PrismaService } from '@config/prisma/prisma.service';
import { ProductMapper } from '../mappers/product.mapper';

/**
 * Implementación del repositorio Product con Prisma.
 * 
 * Incluye ejemplo de paginación.
 */
@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Product | null> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        return product ? ProductMapper.toDomain(product) : null;
    }

    async findAll(): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return products.map((p) => ProductMapper.toDomain(p));
    }

    async findPaginated(params: PaginationParams): Promise<PaginatedResult<Product>> {
        const { page, pageSize } = params;
        const skip = (page - 1) * pageSize;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count(),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: products.map((p) => ProductMapper.toDomain(p)),
            total,
            page,
            pageSize,
            totalPages,
        };
    }

    async findByName(name: string): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });

        return products.map((p) => ProductMapper.toDomain(p));
    }

    async findActive(): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: { isActive: true },
        });

        return products.map((p) => ProductMapper.toDomain(p));
    }

    async create(product: Product): Promise<Product> {
        const prismaProduct = ProductMapper.toPrisma(product);

        const created = await this.prisma.product.create({
            data: prismaProduct,
        });

        return ProductMapper.toDomain(created);
    }

    async update(id: string, product: Partial<Product>): Promise<Product> {
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                ...(product.name && { name: product.name }),
                ...(product.description !== undefined && { description: product.description }),
                ...(product.price && { price: product.price.getValue() }),
                ...(product.stock !== undefined && { stock: product.stock }),
                ...(product.isActive !== undefined && { isActive: product.isActive }),
            },
        });

        return ProductMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.product.delete({
            where: { id },
        });
    }

    async existsById(id: string): Promise<boolean> {
        const count = await this.prisma.product.count({
            where: { id },
        });

        return count > 0;
    }
}


import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '@domain/entities/product.entity';
import { Price } from '@domain/value-objects/price.vo';

/**
 * Mapper: Product
 * 
 * Maneja la conversión de Decimal (Prisma) a number (Domain).
 */
export class ProductMapper {
    /**
     * Convierte de Prisma a Domain
     */
    static toDomain(prismaProduct: PrismaProduct): Product {
        return Product.fromData({
            id: prismaProduct.id,
            name: prismaProduct.name,
            description: prismaProduct.description || undefined,
            price: new Price(Number(prismaProduct.price)),
            stock: prismaProduct.stock,
            isActive: prismaProduct.isActive,
            createdAt: prismaProduct.createdAt,
            updatedAt: prismaProduct.updatedAt,
        });
    }

    /**
     * Convierte de Domain a Prisma
     */
    static toPrisma(product: Product): Omit<PrismaProduct, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            name: product.name,
            description: product.description || null,
            price: product.price.getValue(),
            stock: product.stock,
            isActive: product.isActive,
        };
    }
}


import { User as PrismaUser } from '@prisma/client';
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';

/**
 * Mapper: User
 * 
 * Convierte entre:
 * - Domain Entity (User) ↔ Prisma Model (PrismaUser)
 * 
 * Esto mantiene el dominio independiente de Prisma.
 */
export class UserMapper {
    /**
     * Convierte de Prisma a Domain
     */
    static toDomain(prismaUser: PrismaUser): User {
        return User.fromData({
            id: prismaUser.id,
            email: new Email(prismaUser.email),
            password: prismaUser.password,
            name: prismaUser.name,
            isActive: prismaUser.isActive,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        });
    }

    /**
     * Convierte de Domain a Prisma
     */
    static toPrisma(user: User): Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            email: user.email.getValue(),
            password: user.password,
            name: user.name,
            isActive: user.isActive,
        };
    }
}


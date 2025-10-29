import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { PrismaService } from '@config/database/prisma.service';
import { UserMapper } from '../mappers/user.mapper';

/**
 * Implementación concreta del repositorio User usando Prisma.
 * 
 * Implementa la interfaz definida en el dominio.
 */
@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        return user ? UserMapper.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? UserMapper.toDomain(user) : null;
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user) => UserMapper.toDomain(user));
    }

    async create(user: User): Promise<User> {
        const prismaUser = UserMapper.toPrisma(user);

        const created = await this.prisma.user.create({
            data: prismaUser,
        });

        return UserMapper.toDomain(created);
    }

    async update(id: string, user: Partial<User>): Promise<User> {
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...(user.email && { email: user.email.getValue() }),
                ...(user.name && { name: user.name }),
                ...(user.password && { password: user.password }),
                ...(user.isActive !== undefined && { isActive: user.isActive }),
            },
        });

        return UserMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email },
        });

        return count > 0;
    }
}


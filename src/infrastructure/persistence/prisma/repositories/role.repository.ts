import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { Role } from '@domain/entities/role/role.entity';
import { PrismaService } from '@config/database/prisma.service';
import { RoleMapper } from '../mappers/role.mapper';

/**
 * Implementación concreta del repositorio Role usando Prisma.
 * 
 * Implementa la interfaz definida en el dominio.
 */
@Injectable()
export class RoleRepository implements IRoleRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Role | null> {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return role ? RoleMapper.toDomain(role) : null;
    }

    async findByName(name: string): Promise<Role | undefined> {
        const role = await this.prisma.role.findUnique({
            where: { name },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return role ? RoleMapper.toDomain(role) : undefined;
    }

    async findBySeedRoleKey(seedRoleKey: string): Promise<Role | undefined> {
        const role = await this.prisma.role.findUnique({
            where: { seedRoleKey },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return role ? RoleMapper.toDomain(role) : undefined;
    }

    async findDefaultRole(): Promise<Role | undefined> {
        const role = await this.prisma.role.findFirst({
            where: { isDefault: true },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return role ? RoleMapper.toDomain(role) : undefined;
    }

    async findAll(): Promise<Role[]> {
        const roles = await this.prisma.role.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return roles.map((r) => RoleMapper.toDomain(r));
    }

    async create(role: Role): Promise<Role> {
        const prismaRole = RoleMapper.toPrisma(role);

        const created = await this.prisma.role.create({
            data: {
                ...prismaRole,
                permissions: {
                    create: role.permissions.map((p) => ({
                        permission: {
                            connect: { id: p.id as string },
                        },
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return RoleMapper.toDomain(created);
    }

    async update(id: string, role: Role): Promise<Role> {
        const prismaRole = RoleMapper.toPrisma(role);

        // Actualizar el rol y sus permisos
        const updated = await this.prisma.role.update({
            where: { id },
            data: {
                ...prismaRole,
                permissions: {
                    deleteMany: {},
                    create: role.permissions.map((p) => ({
                        permission: {
                            connect: { id: p.id as string },
                        },
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        return RoleMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.role.delete({
            where: { id },
        });
    }

    async existsByName(name: string): Promise<boolean> {
        const count = await this.prisma.role.count({
            where: { name },
        });

        return count > 0;
    }
}







import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import { Permission } from '@domain/entities/role/permission.entity';
import { PrismaService } from '@config/database/prisma.service';
import { PermissionMapper } from '../mappers/permission.mapper';

/**
 * Implementación concreta del repositorio Permission usando Prisma.
 * 
 * Implementa la interfaz definida en el dominio.
 */
@Injectable()
export class PermissionRepository implements IPermissionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Permission | null> {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
        });

        return permission ? PermissionMapper.toDomain(permission) : null;
    }

    async findByName(name: string): Promise<Permission | undefined> {
        const permission = await this.prisma.permission.findUnique({
            where: { name },
        });

        return permission ? PermissionMapper.toDomain(permission) : undefined;
    }

    async findByResource(resource: string): Promise<Permission[]> {
        const permissions = await this.prisma.permission.findMany({
            where: { resource },
        });

        return permissions.map((p) => PermissionMapper.toDomain(p));
    }

    async findAll(): Promise<Permission[]> {
        const permissions = await this.prisma.permission.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return permissions.map((p) => PermissionMapper.toDomain(p));
    }

    async create(permission: Permission): Promise<Permission> {
        const prismaPermission = PermissionMapper.toPrisma(permission);

        const created = await this.prisma.permission.create({
            data: prismaPermission,
        });

        return PermissionMapper.toDomain(created);
    }

    async update(id: string, permission: Permission): Promise<Permission> {
        const prismaPermission = PermissionMapper.toPrisma(permission);

        const updated = await this.prisma.permission.update({
            where: { id },
            data: prismaPermission,
        });

        return PermissionMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.permission.delete({
            where: { id },
        });
    }

    async upsertByName(permission: Permission): Promise<Permission> {
        const prismaPermission = PermissionMapper.toPrisma(permission);

        const upserted = await this.prisma.permission.upsert({
            where: { name: prismaPermission.name },
            update: {
                description: prismaPermission.description,
                resource: prismaPermission.resource,
                action: prismaPermission.action,
            },
            create: prismaPermission,
        });

        return PermissionMapper.toDomain(upserted);
    }
}


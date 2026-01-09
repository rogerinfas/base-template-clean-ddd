import {
    Permission as PrismaPermission,
    Role as PrismaRole,
    RolePermission as PrismaRolePermission,
} from '@prisma/client';
import { Role } from '../../../../domain/entities/role/role.entity';
import { PermissionMapper } from './permission.mapper';

/**
 * Tipo base de Role de Prisma
 */
type PrismaRoleBase = PrismaRole;

/**
 * Tipo de Role de Prisma con relaciones de permisos incluidas
 */
type PrismaRoleWithPermissions = PrismaRole & {
    permissions: (PrismaRolePermission & {
        permission: PrismaPermission;
    })[];
};

/**
 * Tipo genérico que puede ser Role con o sin relaciones
 */
type PrismaRoleEntity<T extends boolean = false> = T extends true ? PrismaRoleWithPermissions : PrismaRoleBase;

export class RoleMapper {
    /**
     * Convierte un Role de Prisma a entidad de dominio sin relaciones
     */
    static toDomain(prismaRole: PrismaRoleBase): Role;

    /**
     * Convierte un Role de Prisma a entidad de dominio con relaciones
     */
    static toDomain(prismaRole: PrismaRoleWithPermissions): Role;

    /**
     * Implementación del mapper
     */
    static toDomain(prismaRole: PrismaRoleBase | PrismaRoleWithPermissions): Role {
        const permissions =
            'permissions' in prismaRole && prismaRole.permissions
                ? prismaRole.permissions.map((rp) => PermissionMapper.toDomain(rp.permission))
                : [];

        return Role.fromData({
            id: prismaRole.id,
            name: prismaRole.name,
            description: prismaRole.description,
            isDefault: prismaRole.isDefault,
            isActive: prismaRole.isActive,
            permissions,
            createdAt: prismaRole.createdAt,
            updatedAt: prismaRole.updatedAt,
            userModified: prismaRole.userModified,
            seedPermissionsHash: prismaRole.seedPermissionsHash,
            seedRoleKey: prismaRole.seedRoleKey,
        });
    }

    /**
     * Convierte una entidad de dominio Role a formato Prisma
     * Nota: No incluye las relaciones, solo los datos base
     */
    static toPrisma(role: Role): PrismaRoleBase {
        return {
            id: role.id as string,
            name: role.name,
            description: role.description,
            isDefault: role.isDefault,
            isActive: role.isActive,
            createdAt: role.createdAt as Date,
            updatedAt: role.updatedAt as Date,
            userModified: role.userModified,
            seedPermissionsHash: role.seedPermissionsHash,
            seedRoleKey: role.seedRoleKey,
        };
    }
}

/**
 * Exportar tipos para uso en otros archivos
 */
export type { PrismaRoleBase, PrismaRoleEntity, PrismaRoleWithPermissions };



import {
    Permission as PrismaPermission,
    Role as PrismaRole,
    RolePermission as PrismaRolePermission,
    User as PrismaUser,
    UserRole as PrismaUserRole,
} from '@prisma/client';
import { User } from '../../../../domain/entities/user/user.entity';
import { Role } from '../../../../domain/entities/role/role.entity';
import { IdDocumentTypeEnum } from '../../../../domain/types/id-document-types.type';
import { Email } from '../../../../domain/value-objects/email.vo';
import { IdDocumentType } from '../../../../domain/value-objects/id-document-type.vo';
import { RoleMapper } from './role.mapper';

/**
 * Tipo base de User de Prisma sin relaciones
 */
type PrismaUserBase = PrismaUser;

/**
 * Tipo de User de Prisma con roles a través de la tabla intermedia UserRole
 */
type PrismaUserWithUserRoles = PrismaUser & {
    roles: (PrismaUserRole & {
        role: PrismaRole & {
            permissions: (PrismaRolePermission & {
                permission: PrismaPermission;
            })[];
        };
    })[];
};

/**
 * Tipo de User de Prisma con roles a través de la tabla intermedia UserRole (permisos opcionales)
 */
type PrismaUserWithUserRolesOptionalPerms = PrismaUser & {
    roles: (PrismaUserRole & {
        role: PrismaRole & {
            permissions?:
                | (PrismaRolePermission & {
                      permission: PrismaPermission;
                  })[]
                | null;
        };
    })[];
};

/**
 * Tipo de User de Prisma sin la tabla intermedia (roles directos - opcional)
 */
type PrismaUserWithRoles = PrismaUser & {
    roles: (PrismaRole & {
        permissions: (PrismaRolePermission & {
            permission: PrismaPermission;
        })[];
    })[];
};

export class UserMapper {
    /**
     * Convierte un User de Prisma a entidad de dominio sin relaciones
     */
    static toDomain(prismaUser: PrismaUserBase): User;

    /**
     * Convierte un User de Prisma a entidad de dominio con roles (a través de UserRole)
     */
    static toDomain(prismaUser: PrismaUserWithUserRoles): User;

    /**
     * Convierte un User de Prisma a entidad de dominio con roles (a través de UserRole con permisos opcionales)
     */
    static toDomain(prismaUser: PrismaUserWithUserRolesOptionalPerms): User;

    /**
     * Convierte un User de Prisma a entidad de dominio con roles (directos)
     */
    static toDomain(prismaUser: PrismaUserWithRoles): User;

    /**
     * Implementación del mapper
     */
    static toDomain(
        prismaUser:
            | PrismaUserBase
            | PrismaUserWithUserRoles
            | PrismaUserWithUserRolesOptionalPerms
            | PrismaUserWithRoles,
    ): User {
        const { idDocumentType, idNumber, email } = prismaUser;
        const docType = idDocumentType
            ? new IdDocumentType(idDocumentType as IdDocumentTypeEnum)
            : new IdDocumentType(IdDocumentTypeEnum.DNI);

        // Detectar si tiene roles y cómo están estructurados
        const rolesDomain: Role[] = [];

        if ('roles' in prismaUser && prismaUser.roles && prismaUser.roles.length > 0) {
            const firstRole = prismaUser.roles[0];

            // Si tiene la propiedad 'role', es a través de la tabla intermedia UserRole
            if ('role' in firstRole) {
                rolesDomain.push(...prismaUser.roles.map((userRole) => RoleMapper.toDomain(userRole.role)));
            } else {
                // Son roles directos (sin tabla intermedia)
                rolesDomain.push(...prismaUser.roles.map((role) => RoleMapper.toDomain(role)));
            }
        }

        return User.fromData({
            id: prismaUser.id,
            name: prismaUser.name,
            lastName: prismaUser.lastName,
            idDocumentType: docType,
            idNumber: prismaUser.idNumber,
            post: prismaUser.post,
            email: new Email(email),
            phone: prismaUser.phone,
            address: prismaUser.address,
            emailVerified: prismaUser.emailVerified,
            image: prismaUser.image ?? undefined,
            isActive: prismaUser.isActive,
            roles: rolesDomain,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            deletedAt: prismaUser.deletedAt ?? undefined,
            lastLoginAt: prismaUser.lastLoginAt ?? undefined,
        });
    }

    static toPrisma(user: User): PrismaUser {
        return {
            id: user.id as string,
            email: user.email?.value,
            name: user.name,
            lastName: user.lastName,
            idDocumentType: user.idDocumentType?.value,
            idNumber: user.idNumber,
            post: user.post,
            phone: user.phone,
            address: user.address,
            emailVerified: user.emailVerified as boolean,
            image: user.image ?? null,
            isActive: user.isActive as boolean,
            lastLoginAt: user.lastLoginAt ?? null,
            createdAt: user.createdAt as Date,
            updatedAt: user.updatedAt as Date,
            deletedAt: user.deletedAt ?? null,
        };
    }
}

/**
 * Exportar tipos para uso en otros archivos
 */
export type { PrismaUserBase, PrismaUserWithRoles, PrismaUserWithUserRoles, PrismaUserWithUserRolesOptionalPerms };

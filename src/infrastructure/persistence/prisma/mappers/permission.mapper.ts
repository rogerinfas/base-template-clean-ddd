import { Permission as PrismaPermission } from '@prisma/client';
import { Permission } from '../../../../domain/entities/role/permission.entity';
import { ActionType, ResourceAction, ResourceType } from '../../../../domain/value-objects/resource-action.vo';

export class PermissionMapper {
    static toDomain(prismaPermission: PrismaPermission): Permission {
        const resourceAction = new ResourceAction(
            prismaPermission.resource as ResourceType,
            prismaPermission.action as ActionType | string,
        );
        return Permission.fromData({
            id: prismaPermission.id,
            resourceAction,
            description: prismaPermission.description,
            createdAt: prismaPermission.createdAt,
            updatedAt: prismaPermission.updatedAt,
        });
    }

    static toPrisma(permission: Permission): PrismaPermission {
        return {
            id: permission.id as string,
            name: permission.name.value,
            resource: String(permission.resourceAction.resource),
            action: String(permission.resourceAction.action),
            description: permission.description,
            createdAt: permission.createdAt as Date,
            updatedAt: permission.updatedAt as Date,
        };
    }
}






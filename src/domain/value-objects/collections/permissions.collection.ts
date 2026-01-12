import { Permission } from '../../entities/role/permission.entity';
import { InvalidValueObjectException } from '../../exceptions/domain.exceptions';
import { ActionType } from '../resource-action.vo';

/**
 * Value Object collection for managing permissions
 * Provides business logic for permission collections while maintaining immutability
 */
export class PermissionsCollection {
    private readonly _permissions: readonly Permission[];

    private constructor(permissions: Permission[]) {
        this.validatePermissions(permissions);
        this._permissions = Object.freeze([...permissions]);
    }

    /**
     * Create a new permissions collection
     */
    static create(permissions: Permission[] = []): PermissionsCollection {
        return new PermissionsCollection(permissions);
    }

    /**
     * Add a permission to the collection
     */
    add(permission: Permission): PermissionsCollection {
        if (this.contains(permission.id as string)) {
            throw new InvalidValueObjectException(
                `Permission '${permission.permissionName}' already exists in collection`,
            );
        }

        return new PermissionsCollection([...this._permissions, permission]);
    }

    /**
     * Remove a permission from the collection
     */
    remove(permissionId: string): PermissionsCollection {
        const filteredPermissions = this._permissions.filter((p) => p.id !== permissionId);

        if (filteredPermissions.length === this._permissions.length) {
            // Permission not found, return same collection
            return this;
        }

        return new PermissionsCollection(filteredPermissions);
    }

    /**
     * Check if collection contains a specific permission
     */
    contains(permissionId: string): boolean {
        return this._permissions.some((p) => p.id === permissionId);
    }

    /**
     * Check if collection contains a permission by name
     * Supports wildcards: if role has "user:*", it allows any "user:action"
     */
    containsByName(permissionName: string): boolean {
        // Check exact match first
        if (this._permissions.some((p) => p.permissionName === permissionName)) {
            return true;
        }

        // Check wildcard match: if permission is "user:read" and we have "user:*"
        const [resource, action] = permissionName.split(':');
        if (resource && action && action !== '*') {
            const wildcardPermission = `${resource}:*`;
            return this._permissions.some((p) => {
                const permName = p.permissionName;
                return (
                    permName === wildcardPermission ||
                    (p.action === ActionType.wildcard && String(p.resource) === resource)
                );
            });
        }

        return false;
    }

    /**
     * Get permission by ID
     */
    getById(permissionId: string): Permission | undefined {
        return this._permissions.find((p) => p.id === permissionId);
    }

    /**
     * Get permission by name
     */
    getByName(permissionName: string): Permission | undefined {
        return this._permissions.find((p) => p.permissionName === permissionName);
    }

    /**
     * Filter permissions by resource
     */
    filterByResource(resource: string): PermissionsCollection {
        const filtered = this._permissions.filter((p) => p.resource.toLowerCase() === resource.toLowerCase());

        return new PermissionsCollection(filtered);
    }

    /**
     * Filter permissions by action
     */
    filterByAction(action: string): PermissionsCollection {
        const filtered = this._permissions.filter((p) => p.action.toLowerCase() === action.toLowerCase());

        return new PermissionsCollection(filtered);
    }

    /**
     * Get all resource names
     */
    getResources(): string[] {
        const resources = new Set(this._permissions.map((p) => p.resource));

        return Array.from(resources);
    }

    /**
     * Get all action names
     */
    getActions(): string[] {
        const actions = new Set(this._permissions.map((p) => p.action));

        return Array.from(actions);
    }

    /**
     * Get all permission names
     */
    getPermissionNames(): string[] {
        return this._permissions.map((p) => p.permissionName);
    }

    /**
     * Check if collection has admin permissions
     */
    hasAdminPermissions(): boolean {
        const adminResources = ['user', 'role', 'permission', 'system'];
        const criticalActions = ['create', 'update', 'delete'];

        return this._permissions.some((p) => {
            const resource = p.resource.toLowerCase();
            const action = p.action.toLowerCase();

            return adminResources.includes(resource) && criticalActions.includes(action);
        });
    }

    /**
     * Check if collection allows access to a specific resource and action
     * Supports wildcards: if role has "user:*", it allows any "user:action"
     */
    allowsAccess(resource: string, action: string): boolean {
        // Check exact permission first
        const exactPermission = `${resource}:${action}`;
        if (this.containsByName(exactPermission)) {
            return true;
        }

        // Check wildcard permission
        const wildcardPermission = `${resource}:*`;
        return this.containsByName(wildcardPermission);
    }

    /**
     * Get the size of the collection
     */
    get size(): number {
        return this._permissions.length;
    }

    /**
     * Check if collection is empty
     */
    get isEmpty(): boolean {
        return this._permissions.length === 0;
    }

    /**
     * Get immutable array of permissions
     */
    get permissions(): readonly Permission[] {
        return this._permissions;
    }

    /**
     * Convert to array (for compatibility)
     */
    toArray(): Permission[] {
        return [...this._permissions];
    }

    /**
     * Create iterator for the collection
     */
    *[Symbol.iterator](): Iterator<Permission> {
        for (const permission of this._permissions) {
            yield permission;
        }
    }

    /**
     * Merge with another permissions collection
     */
    merge(other: PermissionsCollection): PermissionsCollection {
        const merged = [...this._permissions];

        for (const permission of other._permissions) {
            if (!this.contains(permission.id as string)) {
                merged.push(permission);
            }
        }

        return new PermissionsCollection(merged);
    }

    /**
     * Get intersection with another permissions collection
     */
    intersect(other: PermissionsCollection): PermissionsCollection {
        const intersection = this._permissions.filter((p) => other.contains(p.id as string));

        return new PermissionsCollection(intersection);
    }

    /**
     * Check if collection equals another collection
     */
    equals(other: PermissionsCollection): boolean {
        if (this.size !== other.size) {
            return false;
        }

        return this._permissions.every((p) => other.contains(p.id as string));
    }

    private validatePermissions(permissions: Permission[]): void {
        // Check for duplicates
        const permissionIds = new Set<string>();
        const permissionNames = new Set<string>();

        for (const permission of permissions) {
            const id = permission.id as string;
            const name = permission.permissionName;

            if (permissionIds.has(id)) {
                throw new InvalidValueObjectException(`Duplicate permission ID: ${id}`);
            }

            if (permissionNames.has(name)) {
                throw new InvalidValueObjectException(`Duplicate permission name: ${name}`);
            }

            permissionIds.add(id);
            permissionNames.add(name);
        }
    }
}






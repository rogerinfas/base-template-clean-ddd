import { BaseEntity } from '../base/base.entity';
import {
    CannotDeleteDefaultRoleException,
    InvalidValueObjectException,
    PermissionAlreadyAssignedException,
} from '../../exceptions/domain.exceptions';
import { PermissionsCollection } from '../../value-objects/collections/permissions.collection';
import { Permission } from './permission.entity';

// Interface para datos del rol
interface RoleProps {
    id?: string;
    name: string;
    description: string;
    permissions?: Permission[];
    isDefault?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    // Campos para control de seed vs cambios de usuario
    userModified?: boolean; // true si el usuario modificó el rol manualmente
    seedPermissionsHash?: string | null; // Hash de permisos del seed para detectar cambios en la config
    seedRoleKey?: string | null; // Clave única del seed para identificar roles aunque cambien de nombre (opcional, solo para roles del seed)
}

export class Role extends BaseEntity {
    // Campos readonly para inmutabilidad
    public readonly name: string;
    public readonly description: string;
    public readonly isDefault: boolean;

    // Campos para control de seed vs cambios de usuario
    public readonly userModified: boolean; // true si el usuario modificó el rol manualmente
    public readonly seedPermissionsHash: string | null; // Hash de permisos del seed
    public readonly seedRoleKey: string | null; // Clave única del seed para identificar roles aunque cambien de nombre

    // Permissions como campo mutable (necesario para lógica de negocio)
    public permissions: Permission[];

    constructor(props: RoleProps) {
        super({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            isActive: props.isActive !== undefined ? props.isActive : true,
        });
        this.validateName(props.name);

        this.name = props.name;
        this.description = props.description;
        this.permissions = props.permissions || [];
        this.isDefault = props.isDefault || false;
        this.isActive = props.isActive !== undefined ? props.isActive : true;
        this.userModified = props.userModified || false;
        this.seedPermissionsHash = props.seedPermissionsHash ?? null;
        this.seedRoleKey = props.seedRoleKey ?? null;
    }

    get permissionsCollection(): PermissionsCollection {
        return PermissionsCollection.create(this.permissions);
    }

    /**
     * Factory method para crear un rol nuevo
     */
    static create(props: Omit<RoleProps, 'id' | 'createdAt' | 'updatedAt'>): Role {
        return new Role(props);
    }

    /**
     * Factory method para recrear un rol desde datos existentes
     */
    static fromData(data: RoleProps): Role {
        return new Role(data);
    }

    /**
     * Agrega un permiso al rol
     * @param permission Permiso a agregar
     */
    addPermission(permission: Permission): void {
        // Verificar si el permiso ya está asignado
        if (this.hasPermission(permission.id as string)) {
            throw new PermissionAlreadyAssignedException(permission.permissionName, this.name);
        }

        this.permissions.push(permission);
        this.touch();
    }

    /**
     * Agrega permisos durante la creación sin validación
     * @param permissions Permisos a agregar
     */
    addPermissionsOnCreation(permissions: Permission[]): void {
        this.permissions.push(...permissions);
        this.touch();
    }

    /**
     * Elimina un permiso del rol
     * @param permissionId ID del permiso a eliminar
     */
    removePermission(permissionId: string): void {
        const permissionExists = this.permissions.some((p) => p.id === permissionId);
        if (!permissionExists) {
            return; // Permiso no encontrado, no se hace nada
        }
        this.permissions = this.permissions.filter((p) => p.id !== permissionId);
        this.touch();
    }

    /**
     * Actualiza los detalles del rol
     * @param name Nombre del rol
     * @param description Descripción del rol
     * @returns Nueva instancia del rol con los detalles actualizados
     */
    updateDetails(name?: string, description?: string): Role {
        let hasChanges = false;
        let newName = this.name;
        let newDescription = this.description;

        if (name !== undefined && name !== this.name) {
            this.validateName(name);
            newName = name;
            hasChanges = true;
        }

        if (description !== undefined && description !== this.description) {
            newDescription = description;
            hasChanges = true;
        }

        if (hasChanges) {
            // Crear nueva instancia con los valores actualizados
            return new Role({
                id: this.id,
                name: newName,
                description: newDescription,
                permissions: this.permissions,
                isDefault: this.isDefault,
                isActive: this.isActive,
                createdAt: this.createdAt,
                updatedAt: new Date(),
                userModified: this.userModified,
                seedPermissionsHash: this.seedPermissionsHash,
                seedRoleKey: this.seedRoleKey,
            });
        }

        return this;
    }

    /**
     * Marca el rol como modificado por el usuario
     * @returns Nueva instancia del rol marcada como modificada por usuario
     */
    markAsUserModified(): Role {
        if (this.userModified) {
            return this; // Ya está marcado
        }

        return new Role({
            id: this.id,
            name: this.name,
            description: this.description,
            permissions: this.permissions,
            isDefault: this.isDefault,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
            userModified: true,
            seedPermissionsHash: this.seedPermissionsHash,
            seedRoleKey: this.seedRoleKey,
        });
    }

    /**
     * Actualiza el hash de permisos del seed
     * @param hash Nuevo hash de permisos del seed
     * @returns Nueva instancia del rol con el hash actualizado
     */
    updateSeedPermissionsHash(hash: string): Role {
        return new Role({
            id: this.id,
            name: this.name,
            description: this.description,
            permissions: this.permissions,
            isDefault: this.isDefault,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
            userModified: this.userModified,
            seedPermissionsHash: hash,
            seedRoleKey: this.seedRoleKey,
        });
    }

    /**
     * Establece el rol como por defecto
     * @returns Nueva instancia del rol si hay cambios, la misma instancia si no hay cambios
     */
    setAsDefault(): Role {
        if (this.isDefault) {
            return this; // Ya es por defecto, no se hace nada
        }

        // Crear nueva instancia con isDefault = true
        return new Role({
            id: this.id,
            name: this.name,
            description: this.description,
            permissions: this.permissions,
            isDefault: true,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
            userModified: this.userModified,
            seedPermissionsHash: this.seedPermissionsHash,
            seedRoleKey: this.seedRoleKey,
        });
    }

    /**
     * Elimina el rol como por defecto
     * @returns Nueva instancia del rol si hay cambios, la misma instancia si no hay cambios
     */
    removeAsDefault(): Role {
        if (!this.isDefault) {
            return this; // Ya no es por defecto, no se hace nada
        }

        // Crear nueva instancia con isDefault = false
        return new Role({
            id: this.id,
            name: this.name,
            description: this.description,
            permissions: this.permissions,
            isDefault: false,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
            userModified: this.userModified,
            seedPermissionsHash: this.seedPermissionsHash,
            seedRoleKey: this.seedRoleKey,
        });
    }

    /**
     * Activa el rol
     */
    activate(): void {
        if (this.isActive) {
            return; // Ya está activo, no se hace nada
        }

        // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        this.touch();
    }

    /**
     * Desactiva el rol
     */
    deactivate(): void {
        if (!this.isActive) {
            return; // Ya está inactivo, no se hace nada
        }

        // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        this.touch();
    }

    /**
     * Verifica si el rol tiene un permiso
     * @param permissionId ID del permiso
     * @returns true si el rol tiene el permiso, false en caso contrario
     */
    hasPermission(permissionId: string): boolean {
        return this.permissions.some((p) => p.id === permissionId);
    }

    /**
     * Verifica si el rol tiene un permiso por nombre
     * @param permissionName Nombre del permiso
     * @returns true si el rol tiene el permiso, false en caso contrario
     */
    hasPermissionByName(permissionName: string): boolean {
        return this.permissionsCollection.containsByName(permissionName);
    }

    /**
     * Verifica si el rol es un rol de administrador
     * @returns true si el rol es un rol de administrador, false en caso contrario
     */
    isAdminRole(): boolean {
        // Regla de negocio: Los roles de administrador son identificados por permisos de administrador o nombre
        return (
            this.permissionsCollection.hasAdminPermissions() ||
            this.name.toLowerCase().includes('admin') ||
            this.name.toLowerCase().includes('administrator')
        );
    }

    /**
     * Verifica si el rol puede ser eliminado
     * @returns true si el rol puede ser eliminado, false en caso contrario
     */
    canBeDeleted(): boolean {
        // Regla de negocio: Los roles por defecto no pueden ser eliminados
        return !this.isDefault;
    }

    /**
     * Valida si el rol puede ser eliminado
     */
    validateForDeletion(): void {
        if (!this.canBeDeleted()) {
            throw new CannotDeleteDefaultRoleException();
        }
    }

    /**
     * Obtiene los nombres de los permisos
     * @returns Nombres de los permisos
     */
    getPermissionNames(): string[] {
        return this.permissions.map((p) => p.permissionName);
    }

    /**
     * Valida el nombre del rol
     * @param name Nombre del rol
     */
    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new InvalidValueObjectException('El nombre del rol no puede estar vacío');
        }

        if (name.length > 100) {
            throw new InvalidValueObjectException('El nombre del rol no puede exceder 100 caracteres');
        }
    }
}


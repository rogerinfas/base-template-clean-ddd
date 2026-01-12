import { BaseEntity } from '../base/base.entity';
import {
    InactiveUserException,
    UserAlreadyHasRoleException,
    UserCannotRemoveLastRoleException,
    UserNotEligibleForRoleException,
} from '../../exceptions/user/user.exceptions';
import { IdDocumentType } from '../../value-objects/id-document-type.vo';
import { Email } from '../../value-objects/email.vo';
import { Role } from '../role/role.entity';

// Interface para datos del usuario (mantiene encapsulación)
interface UserProps {
    id?: string;
    name: string;
    lastName: string;
    idDocumentType: IdDocumentType;
    idNumber: string;
    post: string;
    email: Email;
    phone: string;
    address: string;
    emailVerified: boolean;
    image?: string;
    isActive: boolean;
    roles?: Role[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    lastLoginAt?: Date;
}

export class User extends BaseEntity {
    // Campos readonly para inmutabilidad (buena práctica DDD)
    public readonly name: string;
    public readonly lastName: string;
    public readonly idDocumentType: IdDocumentType;
    public readonly idNumber: string;
    public readonly post: string;
    public readonly email: Email;
    public readonly phone: string;
    public readonly address: string;
    public readonly emailVerified: boolean;
    public readonly image?: string;
    public lastLoginAt?: Date;

    // Roles como campo mutable (necesario para lógica de negocio)
    public roles: Role[];

    constructor(props: UserProps) {
        super({
            id: props.id,
            isActive: props.isActive,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            deletedAt: props.deletedAt,
        });
        this.name = props.name;
        this.lastName = props.lastName;
        this.idDocumentType = props.idDocumentType;
        this.idNumber = props.idNumber;
        this.post = props.post;
        this.email = props.email;
        this.phone = props.phone;
        this.address = props.address;
        this.emailVerified = props.emailVerified;
        this.image = props.image;
        this.roles = props.roles || [];
        this.lastLoginAt = props.lastLoginAt;
    }

    /**
     * Factory method para crear un usuario nuevo
     */
    static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
        return new User(props);
    }

    /**
     * Factory method para recrear un usuario desde datos existentes (DB, API, etc.)
     */
    static fromData(data: UserProps): User {
        return new User(data);
    }

    /**
     * Activa el usuario
     */
    activate(): void {
        if (this.isActive) return;
        // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        this.touch();
    }

    /**
     * Desactiva el usuario
     */
    deactivate(): void {
        if (!this.isActive) return;
        // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        this.touch();
        this.softDelete();
    }

    /**
     * Agrega un rol al usuario
     * @param role Rol a agregar
     * @param isNewUser Si es true, omite validaciones y agrega directamente el rol
     */
    addRole(role: Role, isNewUser: boolean = false): void {
        if (isNewUser) {
            // Para usuarios nuevos, agregamos el rol directamente sin validaciones
            this.roles.push(role);
            this.touch();
            return;
        }

        // Para usuarios existentes, aplicamos todas las validaciones
        this.validateUserIsActive('assign role');

        // Verificar si el usuario ya tiene el rol
        if (this.hasRole(role.id as string)) {
            throw new UserAlreadyHasRoleException(this.id as string, role.name);
        }

        // Verificar elegibilidad para roles de administrador
        if (role.isAdminRole() && !this.isEligibleForAdminRole() && this.id) {
            throw new UserNotEligibleForRoleException(this.id, role.name);
        }

        this.roles.push(role);
        this.touch();
    }

    /**
     * Elimina un rol del usuario
     * @param roleId ID del rol a eliminar
     */
    removeRole(roleId: string): void {
        this.validateUserIsActive('remove role');

        if (this.roles.length <= 1) {
            throw new UserCannotRemoveLastRoleException();
        }

        const roleExists = this.roles.some((r) => r.id === roleId);
        if (!roleExists) return;

        this.roles = this.roles.filter((r) => r.id !== roleId);
        this.touch();
    }

    /**
     * Actualiza el email del usuario
     * @param newEmail Nuevo email
     */
    updateEmail(newEmail: Email): void {
        this.validateUserIsActive('change email');

        if (this.email.equals(newEmail)) return;
        // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        this.touch();
    }

    /**
     * Actualiza la información de contacto del usuario
     * @param phone Teléfono
     * @param address Dirección
     */
    updateContactInfo(phone?: string, address?: string): void {
        this.validateUserIsActive('update contact info');

        if (phone && phone !== this.phone) {
            // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        }

        if (address && address !== this.address) {
            // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        }

        this.touch();
    }

    /**
     * Actualiza la imagen del usuario
     * @param imageUrl URL de la imagen
     */
    updateImage(imageUrl?: string): void {
        this.validateUserIsActive('update image');
        // No podemos modificar campos readonly, esto debería ser manejado por el repositorio
        this.touch();
    }

    /**
     * Verifica si el usuario tiene un rol
     * @param roleId ID del rol
     * @returns true si el usuario tiene el rol, false en caso contrario
     */
    hasRole(roleId: string): boolean {
        return this.roles.some((r) => r.id === roleId);
    }

    /**
     * Verifica si el usuario tiene un permiso
     * @param permissionName Nombre del permiso
     * @returns true si el usuario tiene el permiso, false en caso contrario
     */
    hasPermission(permissionName: string): boolean {
        return this.roles.some((r) => r.hasPermissionByName(permissionName));
    }

    /**
     * Verifica si el usuario es elegible para ser administrador
     * @returns true si el usuario es elegible para ser administrador, false en caso contrario
     */
    isEligibleForAdminRole(): boolean {
        // Regla de negocio: Solo usuarios activos con al menos un rol pueden ser administradores
        return this.isActive && this.roles.some((r) => r.isAdminRole());
    }

    /**
     * Valida si el usuario está activo
     * @param action Acción a validar
     */
    private validateUserIsActive(action: string): void {
        if (!this.isActive) {
            throw new InactiveUserException(action);
        }
    }

    /**
     * Actualizar la fecha de último inicio de sesión
     */
    updateLastLoginAt(): void {
        this.lastLoginAt = new Date();
    }
}






import { DomainException } from '../domain.exceptions';

/**
 * Excepción para cuando una excepción del dominio de rol es inválida
 */
export abstract class RoleDomainException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = 'RoleDomainException';
    }
}

/**
 * Excepción para cuando no se puede eliminar el rol por defecto
 */
export class CannotDeleteDefaultRoleException extends RoleDomainException {
    constructor() {
        super('No se puede eliminar el rol por defecto');
        this.name = 'CannotDeleteDefaultRoleException';
    }
}

/**
 * Excepción para cuando un rol tiene usuarios asignados
 */
export class RoleHasAssignedUsersException extends RoleDomainException {
    constructor(roleName: string) {
        super(`No se puede eliminar el rol ${roleName} ya que tiene usuarios asignados`);
        this.name = 'RoleHasAssignedUsersException';
    }
}

/**
 * Excepción para cuando un permiso ya está asignado a un rol
 */
export class PermissionAlreadyAssignedException extends RoleDomainException {
    constructor(permissionName: string, roleName: string) {
        super(`El permiso ${permissionName} ya está asignado al rol ${roleName}`);
        this.name = 'PermissionAlreadyAssignedException';
    }
}







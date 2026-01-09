import { DomainException } from '../domain.exceptions';

/**
 * Excepción para cuando una excepción del dominio de usuario es inválida
 */
export abstract class UserDomainException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = 'UserDomainException';
    }
}

/**
 * Excepción para cuando un usuario no es elegible para un rol
 */
export class UserNotEligibleForRoleException extends UserDomainException {
    constructor(userId: string, roleName: string) {
        super(`El usuario ${userId} no es elegible para el rol: ${roleName}`);
        this.name = 'UserNotEligibleForRoleException';
    }
}

/**
 * Excepción para cuando un usuario ya tiene un rol
 */
export class UserAlreadyHasRoleException extends UserDomainException {
    constructor(userId: string, roleName: string) {
        super(`El usuario ${userId} ya tiene el rol: ${roleName}`);
        this.name = 'UserAlreadyHasRoleException';
    }
}

/**
 * Excepción para cuando un usuario está inactivo
 */
export class InactiveUserException extends UserDomainException {
    constructor(operation: string) {
        super(`No se puede ${operation} para el usuario inactivo`);
        this.name = 'InactiveUserException';
    }
}

/**
 * Excepción para cuando un usuario no puede eliminar el último rol
 */
export class UserCannotRemoveLastRoleException extends UserDomainException {
    constructor() {
        super('No se puede eliminar el último rol del usuario');
        this.name = 'UserCannotRemoveLastRoleException';
    }
}



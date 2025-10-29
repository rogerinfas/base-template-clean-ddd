/**
 * Excepciones de Dominio
 * 
 * Estas excepciones representan errores de lógica de negocio.
 * Se lanzan cuando se violan reglas del dominio.
 */

export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainException';
    }
}

export class InvalidValueObjectException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidValueObjectException';
    }
}

export class EntityNotFoundException extends DomainException {
    constructor(entityName: string, id: string) {
        super(`${entityName} con ID ${id} no encontrado`);
        this.name = 'EntityNotFoundException';
    }
}

export class DuplicateEntityException extends DomainException {
    constructor(entityName: string, field: string, value: string) {
        super(`${entityName} con ${field} '${value}' ya existe`);
        this.name = 'DuplicateEntityException';
    }
}


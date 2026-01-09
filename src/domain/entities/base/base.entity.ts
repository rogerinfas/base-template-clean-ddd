/**
 * Base Entity
 * 
 * Clase base para todas las entidades del dominio.
 * Proporciona funcionalidad común como soft delete, activación, etc.
 */

export abstract class BaseEntity {
    public readonly id?: string;
    public isActive: boolean;
    public readonly createdAt?: Date;
    public updatedAt?: Date;
    public deletedAt?: Date;

    constructor(partial: Partial<BaseEntity>) {
        Object.assign(this, partial);
    }

    /** Verifica si la entidad ya fue persistida */
    get isPersisted(): boolean {
        return this.id !== undefined && this.createdAt !== undefined && this.updatedAt !== undefined;
    }

    /** Marca intención de cambio; el repo puede rehidratar updatedAt con el valor real de DB. */
    touch(): void {
        this.updatedAt = new Date();
    }

    get isTouched(): boolean {
        if (!this.createdAt || !this.updatedAt) {
            return false;
        }
        return this.createdAt.getTime() !== this.updatedAt.getTime();
    }

    softDelete(): void {
        this.isActive = false;
        this.deletedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.deletedAt = undefined;
    }

    toggleActive(): void {
        if (this.isActive && this.isActive === true) {
            this.softDelete();
        } else {
            this.activate();
        }
    }
}



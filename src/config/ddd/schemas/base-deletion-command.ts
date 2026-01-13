import { DeactivationStrategy, SoftDeleteCascadeConfig } from '@config/interfaces/base.interface.repository';
import { DEFAULT_DELETE_STRATEGY } from '@config/types/delete-strategy';
import { Command } from '@nestjs/cqrs';

export type DeleteCommandSchema = {
    id: string;
    deleteStrategy?: DeactivationStrategy;
    /** Configuración de cascada para propagar la desactivación a entidades relacionadas */
    cascade?: SoftDeleteCascadeConfig;
};

/**
 * Comando base para eliminación/desactivación con soporte de cascada programática.
 * Usar con toggleIsActive del repositorio para soft-delete (isActive = false).
 *
 * @example
 * // Sin cascada
 * new DeleteCommand({ id: 'customer-123' });
 *
 * // Con cascada a relaciones
 * new DeleteCommand({
 *   id: 'customer-123',
 *   cascade: { relations: ['contacts', 'addresses'] }
 * });
 *
 * // Hard delete (eliminación física)
 * new DeleteCommand({
 *   id: 'customer-123',
 *   deleteStrategy: 'hard'
 * });
 */
export class DeleteCommand<TReturnType> extends Command<TReturnType> implements DeleteCommandSchema {
    public readonly id: string;
    public readonly deleteStrategy: DeactivationStrategy;
    public readonly cascade?: SoftDeleteCascadeConfig;

    constructor(schema: DeleteCommandSchema) {
        super();
        this.id = schema.id;
        this.deleteStrategy = schema.deleteStrategy ?? DEFAULT_DELETE_STRATEGY;
        this.cascade = schema.cascade;
    }
}

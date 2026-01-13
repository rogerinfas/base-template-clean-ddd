import { BaseComposedEntityType } from './base-entity.types';

export type ExtractNotUndefinedFieldsParams<T extends BaseComposedEntityType> = {
    pick?: Array<keyof T>;
};
export interface BaseEntitiesMethods {
    /** Verifica si la entidad ya fue persistida */
    get isPersisted(): boolean;
    /** Marca intención de cambio; el repo puede rehidratar updatedAt con el valor real de DB. */
    touch(): void;
    get isTouched(): boolean;
    softDelete(): void;
    activate(): void;
    toggleActive(): void;
    getNotUndefinedFields<T extends BaseComposedEntityType>(
        params?: ExtractNotUndefinedFieldsParams<T>,
    ): Record<keyof T, unknown>;
}

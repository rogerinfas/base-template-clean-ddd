import { BaseComposedEntityType, BaseEntityType } from '@config/entities/base-entities/base-entity.types';

export type BaseComposedIdEntityKeys = keyof BaseComposedEntityType;
export type BaseEntityKeys = keyof BaseEntityType;
export type NonMandatoryCreateBaseComposedIdEntityDtoKeys = BaseComposedIdEntityKeys;
export type NonMandatoryCreateBaseEntityDtoKeys = BaseEntityKeys;
export type NonMandatoryUpdateBaseComposedIdEntityDtoKeys = Exclude<BaseComposedIdEntityKeys, 'isActive'>;
export type NonMandatoryUpdateBaseEntityDtoKeys = Exclude<BaseEntityKeys, 'id' | 'isActive'>;
export type NonMandatoryCreateAggregateRootDtoKeys = BaseEntityKeys;
export type NonMandatoryUpdateAggregateRootDtoKeys = BaseEntityKeys;

/**
 * Lista de claves comunes presentes en todas las entidades compuestas base (sin el campo `id`).
 * Se reutiliza para construir esquemas DTO y omitir campos boilerplate en mapeos.
 */
export const baseComposedIdEntityKeys: BaseComposedIdEntityKeys[] = [
    'createdAt',
    'updatedAt',
    'isActive',
    'deletedAt',
] as const;

/**
 * Conjunto completo de claves de `BaseEntityType`, incluyendo el identificador más los campos compuestos.
 */
export const baseEntityKeys: BaseEntityKeys[] = ['id', ...baseComposedIdEntityKeys] as const;

/**
 * Campos que se omiten al crear entidades compuestas (sin `id`), porque el backend los asigna automáticamente.
 */
export const createComposedIdEntityBoilerplateOmittedKeys: NonMandatoryCreateBaseComposedIdEntityDtoKeys[] = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'isActive',
] as const;
/**
 * Campos boilerplate que se omiten al crear entidades completas (incluye `id` además de los compuestos).
 */
export const createBaseEntityBoilerplateOmittedKeys: NonMandatoryCreateBaseEntityDtoKeys[] = [
    'id',
    ...createComposedIdEntityBoilerplateOmittedKeys,
] as const;

/**
 * Campos auto-gestionados que se excluyen en operaciones de actualización para entidades compuestas (sin `id`).
 */
export const updateComposedIdEntityBoilerplateOmittedKeys: NonMandatoryUpdateBaseComposedIdEntityDtoKeys[] = [
    'createdAt',
    'updatedAt',
    'deletedAt',
] as const;
/**
 * Campos boilerplate que se excluyen al actualizar entidades completas. `id` permanece disponible para buscar la entidad.
 */
export const updateBaseEntityBoilerplateOmittedKeys: NonMandatoryUpdateBaseEntityDtoKeys[] = [
    'createdAt',
    'updatedAt',
    'deletedAt',
] as const;

/**
 * Array of keys that should be omitted when creating an aggregate root DTO.
 *
 * These fields are typically auto-generated or managed by the system and should not
 * be provided during creation operations.
 *
 * @remarks
 * - `id`: Auto-generated unique identifier
 * - `createdAt`: Timestamp automatically set on creation
 * - `updatedAt`: Timestamp automatically updated on modification
 * - `deletedAt`: Timestamp for soft deletion tracking
 * - `isActive`: Status flag managed by the system
 *
 * @constant
 * @type {readonly NonMandatoryCreateAggregateRootDtoKeys[]}
 */
export const createAggregateRootBoilerplateOmittedKeys: NonMandatoryCreateAggregateRootDtoKeys[] = [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'isActive',
] as const;

/** * Campos boilerplate que se excluyen al actualizar entidades raíz agregadas. `id` e `isActive` no se modificaran directamente en el caso del aggregate root.
 */
export const updateAggregateRootBoilerplateOmittedKeys: NonMandatoryUpdateAggregateRootDtoKeys[] = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'isActive',
    'id',
] as const;

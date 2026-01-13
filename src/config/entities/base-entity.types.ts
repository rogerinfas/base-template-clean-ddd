/**
 * Tipos base para entidades del dominio
 */

export type BaseComposedEntityType = {
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

export interface BaseEntityType extends BaseComposedEntityType {
    id: string;
}

// Tipo básico para arrays de keys (sin validación - para uso donde no se necesita validación)
export type DtoKeys<TType extends BaseComposedEntityType> = Array<keyof TType>;
export type DtoSchema<TType extends BaseComposedEntityType> = Record<keyof TType, boolean>;

export function createDtoKeys<TType extends BaseComposedEntityType>({
    schema,
}: {
    schema: DtoSchema<TType>;
}): DtoKeys<TType> {
    const omittedKeys = Object.entries(schema)
        .filter(([_, include]) => !include)
        .map(([key, _]) => key) as Array<keyof TType>;

    const allKeys = Object.keys(schema) as Array<keyof TType>;

    return allKeys.filter((key) => !omittedKeys.includes(key));
}


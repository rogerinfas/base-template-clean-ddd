type CollectionHelpers = {
    buildWritablePayloadForNested: <TOut>(obj: Partial<Record<string, unknown>>, extraOmitKeys?: string[]) => TOut;
    buildMutationQueryForManyNestedChildren: <
        TChild extends { id?: string; isActive?: boolean },
        TCreate,
        TUpdate,
        TNestedInput = unknown,
    >(params: {
        items?: Array<Partial<TChild>>;
        mapCreate: (item: Partial<TChild>) => TCreate;
        mapUpdate: (item: Partial<TChild>) => TUpdate;
        options?: {
            inactiveStrategy?: 'delete' | 'update';
            skipEmpty?: boolean;
            returnSentIds?: boolean;
        };
        currentItems?: Array<Partial<TChild>>;
    }) => TNestedInput | undefined;
};

type SingleHelpers = {
    buildWritablePayloadForNested: <TOut>(obj: Partial<Record<string, unknown>>, extraOmitKeys?: string[]) => TOut;
    buildMutationQueryForNestedChild: <
        TChild extends { id?: string; isActive?: boolean },
        TCreate,
        TUpdate,
        TNestedInput = unknown,
    >(params: {
        item?: Partial<TChild> | null;
        mapCreate: (item: Partial<TChild>) => TCreate;
        mapUpdate: (item: Partial<TChild>) => TUpdate;
        options?: { inactiveStrategy?: 'delete' | 'update'; skipEmpty?: boolean };
    }) => TNestedInput | undefined;
};

export function buildCollectionMutation<
    TChild extends { id?: string; isActive?: boolean },
    TCreate,
    TUpdate,
    TNestedInput = unknown,
>(
    helpers: CollectionHelpers,
    params: {
        items?: Array<Partial<TChild>>;
        omitKeys?: string[];
        inactiveStrategy?: 'delete' | 'update';
    },
): TNestedInput | undefined {
    if (!params.items?.length) return undefined;

    const mapper = (child: Partial<TChild>) =>
        helpers.buildWritablePayloadForNested<TCreate | TUpdate>(child, params.omitKeys ?? []);

    return helpers.buildMutationQueryForManyNestedChildren<TChild, TCreate, TUpdate, TNestedInput>({
        items: params.items,
        mapCreate: mapper as (item: Partial<TChild>) => TCreate,
        mapUpdate: mapper as (item: Partial<TChild>) => TUpdate,
        options: {
            skipEmpty: true,
            inactiveStrategy: params.inactiveStrategy ?? 'delete',
        },
    });
}

export function buildSingleMutation<
    TChild extends { id?: string; isActive?: boolean },
    TCreate,
    TUpdate,
    TNestedInput = unknown,
>(
    helpers: SingleHelpers,
    params: {
        item?: Partial<TChild> | null;
        omitKeys?: string[];
        inactiveStrategy?: 'delete' | 'update';
    },
): TNestedInput | undefined {
    if (params.item === undefined) return undefined;
    if (params.item === null) {
        return { delete: true } as TNestedInput;
    }

    const mapCreate = (child: Partial<TChild>) =>
        helpers.buildWritablePayloadForNested<TCreate>(child, params.omitKeys ?? []);
    const mapUpdate = (child: Partial<TChild>) =>
        helpers.buildWritablePayloadForNested<TUpdate>(child, params.omitKeys ?? []);

    return helpers.buildMutationQueryForNestedChild<TChild, TCreate, TUpdate, TNestedInput>({
        item: params.item,
        mapCreate,
        mapUpdate,
        options: {
            skipEmpty: true,
            inactiveStrategy: params.inactiveStrategy ?? 'update',
        },
    });
}

/**
 * Helper para construir mutaciones de relaciones many-to-many unilaterales.
 * Útil cuando se gestiona una relación many-to-many desde una sola entidad (agregado raíz).
 *
 * En create: conecta por la otra entidad (p.ej. unitId) ya que el materialId aún no existe.
 * En update: maneja create/update/delete de forma estándar.
 *
 * **Modo Sync (syncMode: true):**
 * - Elimina automáticamente items que no están en la lista enviada
 * - Requiere proporcionar `currentItems` para comparar
 * - Útil para many-to-many donde la lista enviada es "la verdad absoluta"
 *
 * @template TChild Tipo de la entidad de unión (p.ej. MaterialUnit)
 * @template TCreateInput Tipo de Prisma para create (p.ej. Prisma.MaterialUnitCreateWithoutMaterialInput)
 * @template TUpdateInput Tipo de Prisma para update (p.ej. Prisma.MaterialUnitUpdateWithoutMaterialInput)
 * @template TCreateNestedInput Tipo de Prisma para create nested (p.ej. Prisma.MaterialUnitCreateNestedManyWithoutMaterialInput)
 * @template TUpdateNestedInput Tipo de Prisma para update nested (p.ej. Prisma.MaterialUnitUpdateManyWithoutMaterialNestedInput)
 */
export function buildManyToManyCollectionMutation<
    TChild extends { id?: string; isActive?: boolean; unitId?: string },
    TCreateInput,
    TUpdateInput,
    TCreateNestedInput = unknown,
    TUpdateNestedInput = unknown,
>(
    helpers: CollectionHelpers,
    params: {
        items?: Array<Partial<TChild>>;
        omitKeys?: string[];
        inactiveStrategy?: 'delete' | 'update';
        /**
         * Nombre del campo de la otra entidad para conectar en create (p.ej. 'unit' para conectar por unitId)
         */
        connectByField: string;
        /**
         * Nombre del campo ID de la otra entidad (p.ej. 'unitId')
         */
        connectByIdField: string;
        /**
         * Si es `true`, elimina automáticamente items que no están en la lista enviada.
         * Requiere proporcionar `currentItems` para comparar.
         * @default false
         */
        syncMode?: boolean;
        /**
         * Lista de items actuales (requerido si syncMode es true).
         * Se usa para identificar qué items eliminar.
         */
        currentItems?: Array<Partial<TChild>>;
    },
): {
    create?: TCreateNestedInput;
    update?: TUpdateNestedInput;
} {
    if (!params.items?.length) {
        return {};
    }

    const mapper = (child: Partial<TChild>) =>
        helpers.buildWritablePayloadForNested<TCreateInput | TUpdateInput>(child, params.omitKeys ?? []);

    type OpsType = {
        create?: TCreateInput[];
        update?: Array<{ where: { id: string }; data: TUpdateInput }>;
        delete?: Array<{ id: string }>;
    };

    const ops = helpers.buildMutationQueryForManyNestedChildren<TChild, TCreateInput, TUpdateInput, OpsType>({
        items: params.items,
        mapCreate: mapper as (item: Partial<TChild>) => TCreateInput,
        mapUpdate: mapper as (item: Partial<TChild>) => TUpdateInput,
        options: {
            skipEmpty: true,
            inactiveStrategy: params.inactiveStrategy ?? 'delete',
            returnSentIds: params.syncMode ?? false,
        },
        currentItems: params.currentItems,
    });

    if (!ops) {
        return {};
    }

    const result: {
        create?: TCreateNestedInput;
        update?: TUpdateNestedInput;
    } = {};

    // Adaptar create para many-to-many: conectar por la otra entidad
    if (ops.create && Array.isArray(ops.create)) {
        result.create = {
            create: ops.create
                .filter((item: TCreateInput) => {
                    const itemRecord = item as Record<string, unknown>;
                    return itemRecord[params.connectByIdField];
                })
                .map((item: TCreateInput) => {
                    const itemRecord = item as Record<string, unknown>;
                    const { [params.connectByIdField]: connectId, ...rest } = itemRecord;
                    return {
                        ...rest,
                        [params.connectByField]: {
                            connect: { id: connectId },
                        },
                    };
                }),
        } as TCreateNestedInput;
    }

    // Para update, adaptar create para many-to-many (conectar por la otra entidad)
    // y usar directamente las operaciones de update/delete generadas
    if (ops.create && Array.isArray(ops.create)) {
        const createOps = ops.create
            .filter((item: TCreateInput) => {
                const itemRecord = item as Record<string, unknown>;
                return itemRecord[params.connectByIdField];
            })
            .map((item: TCreateInput) => {
                const itemRecord = item as Record<string, unknown>;
                const { [params.connectByIdField]: connectId, ...rest } = itemRecord;
                return {
                    ...rest,
                    [params.connectByField]: {
                        connect: { id: connectId },
                    },
                };
            });

        if (createOps.length > 0) {
            result.update = {
                ...(result.update || {}),
                create: createOps,
            } as TUpdateNestedInput;
        }
    }

    if (ops.update || ops.delete) {
        result.update = {
            ...(result.update || {}),
            ...(ops.update && { update: ops.update }),
            ...(ops.delete && { delete: ops.delete }),
        } as TUpdateNestedInput;
    }

    return result;
}

/**
 * Configuración de un FK para conectar en operaciones de nested mutation.
 */
type FKConnectConfig = {
    /**
     * Nombre del campo de la relación en Prisma (p.ej. 'garmentTemplate', 'garmentType')
     */
    connectByField: string;
    /**
     * Nombre del campo ID de la FK (p.ej. 'garmentTemplateId', 'garmentTypeId')
     */
    connectByIdField: string;
    /**
     * Si es true, permite null/undefined y genera { disconnect: true } si el valor es null
     * @default false
     */
    optional?: boolean;
};

/**
 * Helper para construir mutaciones de colecciones con MÚLTIPLES FKs.
 * Útil cuando una entidad hija tiene varias relaciones requeridas (p.ej. QuotationItem con garmentTemplate, garmentType).
 *
 * A diferencia de `buildManyToManyCollectionMutation` que solo soporta un FK,
 * esta función permite configurar múltiples campos de conexión.
 *
 * @example
 * ```typescript
 * const itemsOps = buildMultiFKCollectionMutation<
 *     QuotationItem,
 *     Prisma.QuotationItemCreateWithoutQuotationInput,
 *     Prisma.QuotationItemUpdateWithoutQuotationInput,
 *     Prisma.QuotationItemCreateNestedManyWithoutQuotationInput,
 *     Prisma.QuotationItemUpdateManyWithoutQuotationNestedInput
 * >(helpers, {
 *     items: collections.items,
 *     fkConfigs: [
 *         { connectByField: 'garmentTemplate', connectByIdField: 'garmentTemplateId' },
 *         { connectByField: 'garmentType', connectByIdField: 'garmentTypeId' },
 *         { connectByField: 'garmentTypeImage', connectByIdField: 'garmentTypeImageId', optional: true },
 *     ],
 *     inactiveStrategy: 'delete',
 * });
 * ```
 */
export function buildMultiFKCollectionMutation<
    TChild extends { id?: string; isActive?: boolean },
    TCreateInput,
    TUpdateInput,
    TCreateNestedInput = unknown,
    TUpdateNestedInput = unknown,
>(
    helpers: CollectionHelpers,
    params: {
        items?: Array<Partial<TChild>>;
        /**
         * Lista de campos omitidos del payload (se excluyen porque se manejan con connect)
         */
        omitKeys?: string[];
        /**
         * Configuración de FKs que deben convertirse en { connect: { id } }
         */
        fkConfigs: FKConnectConfig[];
        inactiveStrategy?: 'delete' | 'update';
        /**
         * Si es `true`, elimina automáticamente items que no están en la lista enviada.
         * Requiere proporcionar `currentItems` para comparar.
         * @default false
         */
        syncMode?: boolean;
        /**
         * Lista de items actuales (requerido si syncMode es true).
         * Se usa para identificar qué items eliminar.
         */
        currentItems?: Array<Partial<TChild>>;
    },
): {
    create?: TCreateNestedInput;
    update?: TUpdateNestedInput;
} {
    if (!params.items?.length) {
        return {};
    }

    /**
     * Transforma un item aplicando connect para los FKs configurados
     */
    const applyFKConnects = (item: Partial<TChild>): Record<string, unknown> => {
        const basePayload = helpers.buildWritablePayloadForNested<Record<string, unknown>>(item, params.omitKeys ?? []);

        // Aplicar cada FK config
        for (const fkConfig of params.fkConfigs) {
            const idValue = (item as Record<string, unknown>)[fkConfig.connectByIdField];

            // Eliminar el ID field del payload base
            delete basePayload[fkConfig.connectByIdField];

            // Determinar si el valor es "vacío" (null, undefined, o string vacío)
            const isEmpty = idValue === null || idValue === undefined || idValue === '';

            if (idValue === null && fkConfig.optional) {
                // Disconnect si es null y optional
                basePayload[fkConfig.connectByField] = { disconnect: true };
            } else if (!isEmpty && typeof idValue === 'string' && idValue.length > 0) {
                // Connect con el ID solo si es un string válido no vacío
                basePayload[fkConfig.connectByField] = { connect: { id: idValue } };
            }
            // Si es vacío/undefined y no optional, Prisma validará que falta el campo requerido
        }

        return basePayload;
    };

    type OpsType = {
        create?: TCreateInput[];
        update?: Array<{ where: { id: string }; data: TUpdateInput }>;
        delete?: Array<{ id: string }>;
    };

    const ops = helpers.buildMutationQueryForManyNestedChildren<TChild, TCreateInput, TUpdateInput, OpsType>({
        items: params.items,
        mapCreate: (item) => applyFKConnects(item) as TCreateInput,
        mapUpdate: (item) => applyFKConnects(item) as TUpdateInput,
        options: {
            skipEmpty: true,
            inactiveStrategy: params.inactiveStrategy ?? 'delete',
            returnSentIds: params.syncMode ?? false,
        },
        currentItems: params.currentItems,
    });

    if (!ops) {
        return {};
    }

    const result: {
        create?: TCreateNestedInput;
        update?: TUpdateNestedInput;
    } = {};

    // Para create: usar directamente los items ya transformados
    if (ops.create && Array.isArray(ops.create) && ops.create.length > 0) {
        result.create = {
            create: ops.create,
        } as TCreateNestedInput;
    }

    // Para update: mantener create para nuevos items, update para existentes, delete para eliminados
    const updateOps: Record<string, unknown> = {};

    if (ops.create && Array.isArray(ops.create) && ops.create.length > 0) {
        updateOps.create = ops.create;
    }

    if (ops.update && Array.isArray(ops.update) && ops.update.length > 0) {
        updateOps.update = ops.update;
    }

    if (ops.delete && Array.isArray(ops.delete) && ops.delete.length > 0) {
        updateOps.delete = ops.delete;
    }

    if (Object.keys(updateOps).length > 0) {
        result.update = updateOps as TUpdateNestedInput;
    }

    return result;
}

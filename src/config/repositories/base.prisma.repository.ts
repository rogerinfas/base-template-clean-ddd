/** biome-ignore-all lint/suspicious/noExplicitAny: To support all kinds of operations */
import { LoggerService } from '@config/logger/logger.service';
import { normalizeMapperToPrisma } from '@config/utils/normalize-update-dto.util';
import { BadRequestException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
    BaseCascadeRelationConfig,
    BaseFilterArrayOptions,
    DeactivationValidationResult,
    FieldDateOptions,
    FieldNumberOptions,
    FilterOptions,
    PrismaModelName,
    SortOptions,
    ValidateDeactivationParams,
} from '@config/interfaces/base.interface.repository';
import { PrismaService } from '@config/prisma/prisma.service';
import { PrismaUnitOfWorkService } from '@config/prisma/unit-of-work/prisma-unit-of-work.service';
import {
    BuildWhereFromFilterOptionsProps,
    buildWhereFromFilterOptions,
    combineFieldConfigs,
    FieldProcessingConfigExtended,
    toFieldProcessingConfig,
} from './where-clause.prisma.builder';

/**
 * Clase base para repositorios Prisma con soporte automático para transacciones
 * @template T Tipo de entidad
 * @template V Tipo de entidad Prisma para las FilterOptions
 * @template W Tipo de entidad de Prisma para las sortOptions
 * @template K Nombre del modelo Prisma manejado por el repositorio
 */
export abstract class BasePrismaRepository<T, V, W> {
    @Inject(LoggerService) protected readonly logger: LoggerService;
    protected abstract readonly prisma: PrismaService;

    /**
     * Obtiene el cliente de Prisma correcto (transaccional o normal)
     * Automáticamente detecta si hay una transacción activa
     *
     * @deprecated Usa la propiedad `client` en su lugar
     */
    protected getClient(): PrismaClient {
        return PrismaUnitOfWorkService.getCurrentClient(this.prisma) as PrismaClient;
    }

    /**
     * Cliente de Prisma con soporte automático de transacciones
     * Usa este en lugar de `this.prisma` para que las transacciones funcionen automáticamente
     *
     * @example
     * // ❌ Mal - no soporta transacciones
     * await this.prisma.user.findMany();
     *
     * // ✅ Bien - soporta transacciones automáticamente
     * await this.client.user.findMany();
     */
    protected get client(): PrismaClient {
        return PrismaUnitOfWorkService.getCurrentClient(this.prisma) as PrismaClient;
    }

    /**
     *
     * Metodo para obtenerel cliente de prisma cuando la operacion se esta realizando dentor del contexto de una transaccion.
     * Si no esta en el contexto de una transaccion ejecutara la operacion en una llamada norma sin transaccion
     */
    public getDynamicClient(): PrismaClient {
        const txClient = this.client;
        const isInTransaction = this.isWithinTransaction();
        if (isInTransaction) {
            return txClient;
        }
        return this.prisma;
    }

    public get dynamicClient(): PrismaClient {
        return this.getDynamicClient();
    }

    public isWithinTransaction(): boolean {
        const txClient = this.client;
        return txClient !== this.prisma;
    }

    public async withTransaction<R>(fn: (client: PrismaClient) => Promise<R>): Promise<R> {
        if (this.isWithinTransaction()) {
            // Ya estamos en una transacción, usar el cliente actual
            const client = this.client;
            return await fn(client);
        } else {
            // No estamos en una transacción, crear una nueva
            return await this.prisma.$transaction(async (client) => {
                return await fn(client as PrismaClient);
            });
        }
    }

    /**
     * Helper genérico para limpiar payloads de entidades hijas anidadas
     * - Omite campos no actualizables comunes (id, createdAt, updatedAt, deletedAt)
     * - Permite omitir llaves adicionales (p.e. foreign keys del padre)
     * - Normaliza el DTO preservando nulls explícitos
     */
    protected buildWritablePayloadForNested<TOut>(obj: unknown, extraOmitKeys: string[] = []): TOut {
        if (!obj) return {} as TOut;
        const { id, createdAt, updatedAt, deletedAt, ...rest } = obj as Record<string, unknown>;
        const omit = new Set<string>([...extraOmitKeys]);
        const cleaned: Record<string, unknown> = {};
        Object.entries(rest).forEach(([k, v]) => {
            if (!omit.has(k)) cleaned[k] = v;
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return normalizeMapperToPrisma(cleaned) as unknown as TOut;
    }

    /**
     * Construye la mutación nested para colecciones (create/delete/update) de forma genérica
     * items: array de hijos con las banderas estándar (id?, isActive?)
     * mapCreate/mapUpdate: mapeadores a los inputs de Prisma (Create/Update)
     * Retorna el input nested esperado por Prisma (UpdateManyWithout...NestedInput)
     */
    protected buildMutationQueryForManyNestedChildren<
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
            /**
             * Si es `true`, retorna también los IDs que están en `items` para que el repositorio
             * pueda identificar cuáles eliminar. Solo aplica cuando se provee currentItems.
             * @default false
             */
            returnSentIds?: boolean;
        };
        /**
         * Lista de items actuales (opcional). Si se provee junto con returnSentIds,
         * el helper identificará items a eliminar que no están en la lista enviada.
         */
        currentItems?: Array<Partial<TChild>>;
    }): (TNestedInput & { _sentIds?: Set<string> }) | undefined {
        const { items, mapCreate, mapUpdate, options, currentItems } = params;
        if (!items || items.length === 0) return undefined;

        const inactiveStrategy = options?.inactiveStrategy ?? 'delete';
        const skipEmpty = options?.skipEmpty ?? true;
        const returnSentIds = options?.returnSentIds ?? false;

        const toCreate = items.filter((i) => !i.id);
        const toDelete = items.filter((i) => i.id && i.isActive === false && inactiveStrategy === 'delete');
        const toUpdate = items.filter((i) => i.id && (i.isActive !== false || inactiveStrategy === 'update'));

        // Si returnSentIds está activo y hay currentItems, identificar items a eliminar
        if (returnSentIds && currentItems && currentItems.length > 0) {
            const sentIds = new Set(items.filter((i) => i.id).map((i) => i.id as string));
            const itemsToDelete = currentItems.filter((current) => current.id && !sentIds.has(current.id));
            toDelete.push(...itemsToDelete);
        }

        const ops: any = {};
        if (toCreate.length > 0) {
            const created = toCreate.map((c) => mapCreate(c));
            ops.create = skipEmpty ? created.filter((d: any) => d && Object.keys(d).length > 0) : created;
        }
        if (toDelete.length > 0) {
            ops.delete = toDelete.map((d) => ({ id: d.id as string }));
        }
        if (toUpdate.length > 0) {
            const updates = toUpdate.map((u) => ({
                where: { id: u.id as string },
                data: mapUpdate(u),
            }));
            ops.update = skipEmpty ? updates.filter((u: any) => u?.data && Object.keys(u.data).length > 0) : updates;
        }

        // Agregar _sentIds si se solicitó
        if (returnSentIds && items) {
            const sentIds = new Set(items.filter((i) => i.id).map((i) => i.id as string));
            ops._sentIds = sentIds;
        }

        // Remover propiedades vacías (arrays vacíos) y retornar undefined si no queda nada
        ['create', 'delete', 'update'].forEach((k) => {
            const v = (ops as any)[k];
            if (Array.isArray(v) && v.length === 0) {
                delete (ops as any)[k];
            }
        });
        return (Object.keys(ops).length > 0 ? (ops as TNestedInput) : undefined) as TNestedInput | undefined;
    }

    /**
     * Construye la mutación nested para una relación 1-1 (create/delete/update) de forma genérica
     * Nota: delete en relaciones 1-1 de Prisma suele ser boolean (delete: true)
     */
    protected buildMutationQueryForNestedChild<
        TChild extends { id?: string; isActive?: boolean },
        TCreate,
        TUpdate,
        TNestedInput = unknown,
    >(params: {
        item?: Partial<TChild> | null;
        mapCreate: (item: Partial<TChild>) => TCreate;
        mapUpdate: (item: Partial<TChild>) => TUpdate;
        options?: {
            inactiveStrategy?: 'delete' | 'update';
            skipEmpty?: boolean;
        };
    }): TNestedInput | undefined {
        const { item, mapCreate, mapUpdate, options } = params;
        if (!item) return undefined;

        if (!item.id) {
            const payload = mapCreate(item);
            if ((options?.skipEmpty ?? true) && (!payload || Object.keys(payload as any).length === 0)) {
                return undefined;
            }
            return { create: payload } as unknown as TNestedInput;
        }
        if (item.isActive === false) {
            const inactiveStrategy = options?.inactiveStrategy ?? 'delete';
            if (inactiveStrategy === 'delete') {
                return { delete: true } as unknown as TNestedInput;
            }
            const data = mapUpdate(item);
            if ((options?.skipEmpty ?? true) && (!data || Object.keys(data as any).length === 0)) {
                return undefined;
            }
            return { update: data } as unknown as TNestedInput;
        }
        const data = mapUpdate(item);
        if ((options?.skipEmpty ?? true) && (!data || Object.keys(data as any).length === 0)) {
            return undefined;
        }
        return { update: data } as unknown as TNestedInput;
    }

    /**
     * Helpers para construir mutaciones de relaciones anidadas.
     * Expone los métodos de mutación con `this` bindeado para uso en funciones externas.
     *
     * @example
     * // Uso con buildCollectionMutation helper
     * const addressesOps = buildCollectionMutation<Address, CreateInput, UpdateInput, NestedInput>(
     *     this.relationHelpers,
     *     { items: addresses, inactiveStrategy: 'delete' }
     * );
     */
    protected get relationHelpers() {
        return {
            buildWritablePayloadForNested: this.buildWritablePayloadForNested.bind(this),
            buildMutationQueryForManyNestedChildren: this.buildMutationQueryForManyNestedChildren.bind(this),
            buildMutationQueryForNestedChild: this.buildMutationQueryForNestedChild.bind(this),
        } as const;
    }

    /**
     * Configuración por defecto para campos enum/fecha del builder WHERE.
     * Sobrescribir en repositorios concretos usando helpers type-safe (createFieldConfig).
     */
    protected getWhereClauseFieldConfig(): FieldProcessingConfigExtended | undefined {
        return undefined;
    }

    /**
     * Construye la cláusula WHERE para consultas Prisma
     *
     * @param filterOptions Opciones de filtrado
     * @param enumFields Lista de campos que son enums y no deben usar contains
     * @param dateFields Lista de campos que son fechas
     * @returns Objeto de filtrado para Prisma
     *
     * @remarks
     * Para nuevo código, considera usar el WhereClauseBuilder que ofrece:
     * - API fluida más legible
     * - Funciones puras más fáciles de testear
     * - Mejor composición de filtros
     *
     * @example
     * // Alternativa con builder (nuevo)
     * import { createWhereClauseBuilder } from '@config/repositories';
     *
     * const where = createWhereClauseBuilder<Customer>({ enumFields: ['status'] })
     *   .withSearchByField({ name: 'Juan' })
     *   .withOR({ searchByField: { email: 'test' } })
     *   .build();
     */
    protected buildWhereClause<A = T, B = V>(
        filterOptions?: FilterOptions<A>,
        enumFields?: string[],
        dateFields?: string[],
    ): B {
        if (!filterOptions) {
            return {} as B;
        }
        const whereClause = {} as B;

        const {
            searchByField,
            searchByFieldsRelational,
            OR,
            NOT,
            fieldNumber,
            fieldNumbers,
            fieldDate,
            fieldDates,
            arrayByField,
            ORComplex,
            ...rest
        } = filterOptions;

        // Procesar condiciones AND (searchByField y searchByFieldsRelational fuera del OR)
        if (searchByField) {
            Object.entries(searchByField).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    whereClause[key] = this.isEnumField(key, enumFields)
                        ? value
                        : this.isDateField(key, dateFields)
                          ? this.buildDateCondition(value, 'range')
                          : { contains: value, mode: 'insensitive' };
                } else {
                    whereClause[key] = value;
                }
            });
        }

        // Solo procesar searchByFieldsRelational si NO hay OR (para evitar conflictos)
        if (searchByFieldsRelational && !OR) {
            searchByFieldsRelational.forEach((relation) => {
                Object.entries(relation).forEach(([relationName, relationFields]) => {
                    const someConditions = this.buildRecursiveConditions(
                        relationFields,
                        enumFields,
                        relationName,
                        dateFields,
                    );
                    (whereClause as Record<string, unknown>)[relationName] = someConditions;
                });
            });
        }

        // Soporte para fieldNumber individual (retrocompatibilidad)
        if (fieldNumber) {
            this.applyFieldNumberCondition(whereClause as Record<string, unknown>, fieldNumber);
        }

        // Soporte para múltiples fieldNumbers
        if (fieldNumbers && Array.isArray(fieldNumbers)) {
            fieldNumbers.forEach((fieldNum) => {
                this.applyFieldNumberCondition(whereClause as Record<string, unknown>, fieldNum);
            });
        }

        // Soporte para fieldDate individual
        if (fieldDate) {
            this.applyFieldDateCondition(whereClause as Record<string, unknown>, fieldDate);
        }

        // Soporte para múltiples fieldDates
        if (fieldDates && Array.isArray(fieldDates)) {
            fieldDates.forEach((fieldDateItem) => {
                this.applyFieldDateCondition(whereClause as Record<string, unknown>, fieldDateItem);
            });
        }

        // Si hay un objeto OR, construir la lógica OR adicional
        if (OR) {
            const orConditions: Record<string, unknown>[] = [];

            // Agregar condiciones de searchByField dentro de OR
            if (OR.searchByField) {
                Object.entries(OR.searchByField).forEach(([key, value]) => {
                    const condition: Record<string, unknown> = {};
                    if (typeof value === 'string') {
                        condition[key] = this.isEnumField(key, enumFields)
                            ? value
                            : this.isDateField(key, dateFields)
                              ? this.buildDateCondition(value, 'range')
                              : { contains: value, mode: 'insensitive' };
                    } else {
                        condition[key] = value;
                    }
                    orConditions.push(condition);
                });
            }
            // Agregar condiciones relacionales dentro de OR
            if (OR.searchByFieldsRelational) {
                OR.searchByFieldsRelational.forEach((relation) => {
                    Object.entries(relation).forEach(([relationName, relationFields]) => {
                        const condition: Record<string, unknown> = {};
                        condition[relationName] = this.buildRecursiveConditions(
                            relationFields,
                            enumFields,
                            relationName,
                            dateFields,
                        );
                        orConditions.push(condition);
                    });
                });
            }

            if (orConditions.length > 0) {
                (whereClause as Record<string, unknown>).OR = orConditions;
            }

            // Si hay searchByFieldsRelational fuera del OR, agregarlo como AND con el OR
            if (searchByFieldsRelational) {
                const searchOrConditions: Record<string, unknown>[] = [];

                searchByFieldsRelational.forEach((relation) => {
                    Object.entries(relation).forEach(([relationName, relationFields]) => {
                        const someConditions = this.buildRecursiveConditions(
                            relationFields,
                            enumFields,
                            relationName,
                            dateFields,
                        );
                        const searchCondition: Record<string, unknown> = {};
                        searchCondition[relationName] = someConditions;
                        searchOrConditions.push(searchCondition);
                    });
                });

                // Si hay múltiples condiciones de búsqueda, combinarlas con OR interno
                if (searchOrConditions.length > 0) {
                    if (searchOrConditions.length === 1) {
                        Object.assign(whereClause as Record<string, unknown>, searchOrConditions[0]);
                    } else {
                        (whereClause as Record<string, unknown>).AND = [{ OR: searchOrConditions }];
                    }
                }
            }
        }

        if (NOT) {
            const notConditions: Record<string, unknown>[] = [];
            // Agregar condiciones de searchByField dentro de NOT
            if (NOT.searchByField) {
                Object.entries(NOT.searchByField).forEach(([key, value]) => {
                    const condition: Record<string, unknown> = {};
                    if (typeof value === 'string') {
                        condition[key] = this.isEnumField(key, enumFields)
                            ? value
                            : this.isDateField(key, dateFields)
                              ? this.buildDateCondition(value, 'range')
                              : { contains: value, mode: 'insensitive' };
                    } else {
                        condition[key] = value;
                    }
                    notConditions.push(condition);
                });
            }
            // Agregar condiciones relacionales dentro de NOT
            if (NOT.searchByFieldsRelational) {
                NOT.searchByFieldsRelational.forEach((relation) => {
                    Object.entries(relation).forEach(([relationName, relationFields]) => {
                        const condition: Record<string, unknown> = {};
                        condition[relationName] = this.buildRecursiveConditions(
                            relationFields,
                            enumFields,
                            relationName,
                            dateFields,
                        );
                        notConditions.push(condition);
                    });
                });
            }

            if (notConditions.length > 0) {
                (whereClause as Record<string, unknown>)['NOT'] = notConditions;
            }

            // Si hay searchByFieldsRelational fuera del not, agregarlo como AND con el NOT
            if (searchByFieldsRelational) {
                const searchOrConditions: Record<string, unknown>[] = [];
                searchByFieldsRelational.forEach((relation) => {
                    Object.entries(relation).forEach(([relationName, relationFields]) => {
                        const someConditions = this.buildRecursiveConditions(
                            relationFields,
                            enumFields,
                            relationName,
                            dateFields,
                        );
                        const searchCondition: Record<string, unknown> = {};
                        searchCondition[relationName] = someConditions;
                        searchOrConditions.push(searchCondition);
                    });
                });
                // Si hay múltiples condiciones de búsqueda, combinarlas con NOT interno
                if (searchOrConditions.length > 0) {
                    if (searchOrConditions.length === 1) {
                        Object.assign(whereClause as Record<string, unknown>, searchOrConditions[0]);
                    } else {
                        (whereClause as Record<string, unknown>).AND = [{ NOT: searchOrConditions }];
                    }
                }
            }
        }

        // Si hay un objeto ORComplex, construir la lógica OR compleja
        if (ORComplex) {
            const orComplexConditions: Record<string, unknown>[] = [];

            ORComplex.conditions.forEach((conditionGroup) => {
                const combinedCondition: Record<string, unknown> = {};

                // Procesar searchByField
                if (conditionGroup.searchByField) {
                    Object.entries(conditionGroup.searchByField).forEach(([key, value]) => {
                        if (typeof value === 'string') {
                            combinedCondition[key] = this.isEnumField(key, enumFields)
                                ? value
                                : this.isDateField(key, dateFields)
                                  ? this.buildDateCondition(value, 'range')
                                  : { contains: value, mode: 'insensitive' };
                        } else {
                            combinedCondition[key] = value;
                        }
                    });
                }

                // Procesar searchByFieldsRelational
                if (conditionGroup.searchByFieldsRelational) {
                    const searchOrConditions: Record<string, unknown>[] = [];

                    conditionGroup.searchByFieldsRelational.forEach((relation) => {
                        Object.entries(relation).forEach(([relationName, relationFields]) => {
                            const someConditions = this.buildRecursiveConditions(
                                relationFields,
                                enumFields,
                                relationName,
                                dateFields,
                            );
                            const searchCondition: Record<string, unknown> = {};
                            searchCondition[relationName] = someConditions;
                            searchOrConditions.push(searchCondition);
                        });
                    });

                    // Si hay múltiples condiciones de búsqueda, combinarlas con OR
                    if (searchOrConditions.length > 0) {
                        if (searchOrConditions.length === 1) {
                            Object.assign(combinedCondition, searchOrConditions[0]);
                        } else {
                            combinedCondition.OR = searchOrConditions;
                        }
                    }
                }

                // Procesar directFields (campos directos sin búsqueda)
                if (conditionGroup.directFields) {
                    Object.entries(conditionGroup.directFields).forEach(([key, value]) => {
                        combinedCondition[key] = value;
                    });
                }

                if (Object.keys(combinedCondition).length > 0) {
                    orComplexConditions.push(combinedCondition);
                }
            });

            if (orComplexConditions.length > 0) {
                (whereClause as Record<string, unknown>).OR = orComplexConditions;
            }
        }

        if (arrayByField) {
            const arrayWhere = this.handleArrayWhereQuery<A>(arrayByField);
            const arrayKeys = Object.keys(arrayWhere);
            if (arrayKeys.length > 0) {
                arrayKeys.forEach((key) => {
                    whereClause[key] = arrayWhere[key];
                });
            }
        }

        // Agregar el resto de filtros (siempre con AND)
        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined) {
                whereClause[key] = value;
            }
        });
        return whereClause;
    }
    /**
     * Construye la cláusula ORDER BY para consultas Prisma
     * @param sortOptions Opciones de ordenamiento
     * @returns Objeto de ordenamiento para Prisma
     */
    protected buildOrderByClause<A = T, C = W>(
        sortOptions?: SortOptions<A>,
        hasCreatedAtField?: boolean,
        sortDescByCreation?: boolean,
    ): C | undefined {
        const createdAtField = 'createdAt';

        if (!sortOptions && !hasCreatedAtField) {
            return undefined;
        }

        const orderBy = {} as C;

        if (!sortOptions && hasCreatedAtField) {
            orderBy[createdAtField] = sortDescByCreation ? 'desc' : 'asc';
        }

        if (sortOptions?.field) {
            orderBy[sortOptions.field as string] = sortOptions.order ?? 'asc';
        }

        return orderBy;
    }

    /**
     * Verifica si un campo es un enum
     * @param fieldPath Ruta del campo (ej: "type" o "inventoryMovement.type")
     * @param enumFields Lista de campos enum
     * @returns true si el campo es enum
     */
    private isEnumField(fieldPath: string, enumFields?: string[]): boolean {
        if (!enumFields) return false;
        return enumFields.some((enumField) => fieldPath.includes(enumField));
    }

    /**
     * Verifica si un campo es una fecha
     * @param fieldPath Ruta del campo (ej: "createdAt" o "inventoryMovement.date")
     * @param dateFields Lista de campos fecha
     * @returns true si el campo es fecha
     */
    private isDateField(fieldPath: string, dateFields?: string[]): boolean {
        if (!dateFields) return false;
        return dateFields.some((dateField) => fieldPath.includes(dateField));
    }

    /**
     * Construye la condición de fecha para Prisma
     * @param value Valor de la fecha (puede ser rango o fecha simple)
     * @param operator Operador para la fecha
     * @returns Objeto de condición de fecha para Prisma
     */
    private buildDateCondition(value: string, operator?: string): unknown {
        // Si contiene " - " es un rango de fechas
        if (value.includes(' - ')) {
            const [start, end] = value.split(' - ');
            return {
                gte: new Date(start.trim()),
                lte: new Date(end.trim()),
            };
        }

        // Si es una fecha simple, usar el operador especificado o "equals" por defecto
        const dateValue = new Date(value);
        if (operator && operator !== 'range') {
            return { [operator]: dateValue };
        }

        return dateValue;
    }

    /**
     * Aplica una condición de campo numérico a un objeto WHERE (con soporte recursivo)
     * @param where Cláusula WHERE actual
     * @param fieldNumber Objeto con la información del campo numérico
     */
    private applyFieldNumberCondition<A>(where: Record<string, unknown>, fieldNumber: FieldNumberOptions<A>): void {
        const { field, value, operator } = fieldNumber;
        const fieldPath = String(field);

        // Si el campo contiene punto, es una relación anidada
        if (fieldPath.includes('.')) {
            const [relationName, ...nestedPath] = fieldPath.split('.');
            const nestedField = nestedPath.join('.');

            if (!where[relationName]) {
                where[relationName] = {};
            }

            const relationWhere = where[relationName] as Record<string, unknown>;

            // Si hay más niveles de anidación, recursión
            if (nestedField.includes('.')) {
                this.applyFieldNumberCondition(relationWhere, {
                    field: nestedField as keyof A,
                    value,
                    operator,
                });
            } else {
                relationWhere[nestedField] = { [operator]: value };
            }
        } else {
            // Campo directo
            where[fieldPath] = { [operator]: value };
        }
    }

    /**
     * Aplica una condición de campo de fecha a un objeto WHERE (con soporte recursivo)
     * @param where Cláusula WHERE actual
     * @param fieldDate Objeto con la información del campo de fecha
     */
    private applyFieldDateCondition<A>(where: Record<string, unknown>, fieldDate: FieldDateOptions<A>): void {
        const { field, value, operator } = fieldDate;
        const fieldPath = String(field);

        // Si el campo contiene punto, es una relación anidada
        if (fieldPath.includes('.')) {
            const [relationName, ...nestedPath] = fieldPath.split('.');
            const nestedField = nestedPath.join('.');

            if (!where[relationName]) {
                where[relationName] = {};
            }

            const relationWhere = where[relationName] as Record<string, unknown>;

            // Si hay más niveles de anidación, recursión
            if (nestedField.includes('.')) {
                this.applyFieldDateCondition(relationWhere, {
                    field: nestedField as keyof A,
                    value,
                    operator,
                });
            } else {
                const built = this.buildDateCondition(value, operator) as Record<string, unknown> | Date;
                // Merge si ya existe condición previa
                if (
                    relationWhere[nestedField] &&
                    typeof relationWhere[nestedField] === 'object' &&
                    !(relationWhere[nestedField] instanceof Date)
                ) {
                    Object.assign(relationWhere[nestedField] as Record<string, unknown>, built);
                } else {
                    relationWhere[nestedField] = built;
                }
            }
        } else {
            // Campo directo
            const built = this.buildDateCondition(value, operator) as Record<string, unknown> | Date;
            if (where[fieldPath] && typeof where[fieldPath] === 'object' && !(where[fieldPath] instanceof Date)) {
                Object.assign(where[fieldPath] as Record<string, unknown>, built);
            } else {
                where[fieldPath] = built;
            }
        }
    }

    /**
     * Palabras clave de Prisma que deben preservarse sin modificación
     * Basadas en: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
     */
    private readonly PRISMA_KEYWORDS = new Set([
        // Operadores de relación
        'some',
        'every',
        'none',
        'is',
        'isNot',
        // Operadores de comparación
        'in',
        'notIn',
        'lt',
        'lte',
        'gt',
        'gte',
        'equals',
        'not',
        // Operadores de string
        'contains',
        'startsWith',
        'endsWith',
        'mode',
        'search',
        // Operadores lógicos
        'AND',
        'OR',
        'NOT',
        // Otros operadores
        'has',
        'hasEvery',
        'hasSome',
        'isEmpty',
    ]);

    /**
     * Construye condiciones recursivas para consultas relacionales anidadas
     * @param fields Campos que pueden contener objetos anidados
     * @param enumFields Lista de campos que son enums
     * @param relationPrefix Prefijo de la relación para construir la ruta completa del campo
     * @param dateFields Lista de campos que son fechas
     * @returns Objeto con condiciones apropiadas para Prisma
     */
    private buildRecursiveConditions(
        fields: unknown,
        enumFields?: string[],
        relationPrefix?: string,
        dateFields?: string[],
    ): unknown {
        const conditions = {} as Record<string, unknown>;

        if (typeof fields === 'string') {
            const fieldPath = relationPrefix || '';
            return this.isEnumField(fieldPath, enumFields) || this.isDateField(fieldPath, dateFields)
                ? fields
                : { contains: fields, mode: 'insensitive' };
        }

        if (typeof fields === 'object' && fields !== null) {
            Object.entries(fields as Record<string, unknown>).forEach(([fieldName, fieldValue]) => {
                const fieldPath = relationPrefix ? `${relationPrefix}.${fieldName}` : fieldName;

                // Si es una palabra clave de Prisma, preservarla sin modificación
                if (this.PRISMA_KEYWORDS.has(fieldName)) {
                    conditions[fieldName] = fieldValue;
                    return;
                }

                if (typeof fieldValue === 'string') {
                    conditions[fieldName] =
                        this.isEnumField(fieldPath, enumFields) || this.isDateField(fieldPath, dateFields)
                            ? fieldValue
                            : { contains: fieldValue, mode: 'insensitive' };
                } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                    // Recursión para objetos anidados
                    conditions[fieldName] = this.buildRecursiveConditions(
                        fieldValue,
                        enumFields,
                        fieldPath,
                        dateFields,
                    );
                } else {
                    conditions[fieldName] = fieldValue;
                }
            });
        } else {
            return fields;
        }

        return conditions;
    }

    /**
     * Maneja la cláusula WHERE para consultas Prisma con arrays
     * @param arrayByField Opciones de filtrado para arrays
     * @returns Objeto con condiciones para Prisma
     */
    private handleArrayWhereQuery<A>(arrayByField: BaseFilterArrayOptions<A>) {
        const whereClause: Record<keyof A, unknown> = {} as Record<keyof A, unknown>;
        Object.entries(arrayByField).forEach(([key, values]) => {
            if (Array.isArray(values)) {
                let processedValues: unknown[] = [];

                // Detectar si el array contiene fragmentos de un JSON que fueron separados incorrectamente
                if (
                    values.length > 1 &&
                    values.some((v) => typeof v === 'string' && (v.startsWith('[') || v.endsWith(']')))
                ) {
                    // Reconstruir el string JSON completo
                    const reconstructedJson = values.join(',');

                    try {
                        const parsed = JSON.parse(reconstructedJson);
                        if (Array.isArray(parsed)) {
                            processedValues = parsed;
                        } else {
                            processedValues = values;
                        }
                    } catch {
                        // Si no se puede parsear, usar el array original
                        processedValues = values;
                    }
                } else {
                    // Procesar cada valor individualmente como antes
                    processedValues = values.flatMap((value) => {
                        if (typeof value === 'string') {
                            // Verificar si el string tiene comillas escapadas al principio y al final
                            if (value.startsWith('"') && value.endsWith('"')) {
                                // Remover las comillas escapadas
                                const cleanValue = value.slice(1, -1);
                                return cleanValue;
                            }

                            try {
                                // Intentar parsear si es un string JSON
                                const parsed = JSON.parse(value);
                                return Array.isArray(parsed) ? parsed : value;
                            } catch {
                                // Si no se puede parsear, devolver el valor original
                                return value;
                            }
                        }
                        return value;
                    }); // Usar flat() para aplanar arrays anidados
                }

                whereClause[key] = { in: processedValues };
            } else {
                whereClause[key] = values;
            }
        });
        return whereClause;
    }

    /**
     * Maneja errores de repositorio
     * @param operation - Nombre de la operación que falló
     * @param error - El error que ocurrió
     * @param returnValue - Valor de retorno opcional
     * @returns El valor de retorno
     */
    protected handleError<R>(operation: string, error: unknown, returnValue: R | null = null): R | null {
        if (error instanceof Error) {
            this.logger.error(
                {
                    message: `Operación de repositorio falló`,
                    operation,
                    errorMessage: error.message,
                    entityType: this.constructor.name.replace('Repository', ''),
                },
                error.stack,
            );
        } else {
            this.logger.error({
                message: `Operación de repositorio falló`,
                operation,
                error: String(error),
                entityType: this.constructor.name.replace('Repository', ''),
            });
        }

        return returnValue;
    }

    /**
     * Ejecuta una operación de base de datos con manejo de errores
     * @param operation - Nombre de la operación a realizar
     * @param action - Función asíncrona a ejecutar
     * @param fallbackValue - Valor de retorno opcional en caso de error
     * @returns El resultado de la acción o el valor de retorno en caso de error
     * @template R - Tipo de retorno de la operación
     */
    protected async executeWithErrorHandling<R>(
        operation: string,
        action: () => Promise<R>,
        fallbackValue?: R,
        entityId?: string,
    ): Promise<R | undefined> {
        try {
            // Logs DEBUG desactivados para reducir ruido - solo se muestran errores
            const result = await action();
            return result;
        } catch (error) {
            return this.handleError<R>(operation, error, fallbackValue) as R | undefined;
        }
    }

    /**
     * Ejecuta soft-delete en cascada para las relaciones especificadas.
     * Desactiva (isActive = false) todas las entidades relacionadas.
     * Es IMPERATIVO que al usarse se use dentro del contexto de una transacción.
     *
     * @param entityId - ID de la entidad padre
     * @param relations - Array de configuraciones de relación para cascada (tipado con Prisma)
     * @param isActive - Valor a establecer en las relaciones (false para desactivar)
     *
     * @example
     * // Desactivar contactos y direcciones de un cliente
     * await this.executeSoftDeleteCascade('customer-123', [
     *   { model: 'contact', foreignKey: 'customerId' },
     *   { model: 'address', foreignKey: 'customerId' }
     * ], false);
     */
    protected async executeSoftDeleteCascade(
        entityId: string,
        relations: BaseCascadeRelationConfig[],
        isActive: boolean,
        client: PrismaClient,
    ): Promise<void> {
        for (const relation of relations) {
            const model = client[relation.model];
            if (model && typeof (model as any).updateMany === 'function') {
                await (model as any).updateMany({
                    where: { [relation.foreignKey]: entityId },
                    data: { isActive },
                });
                this.logger.log({
                    message: `Cascade ${isActive ? 'reactivation' : 'soft-delete'} executed`,
                    model: relation.model,
                    foreignKey: relation.foreignKey,
                    entityId,
                    isActive,
                });
            } else {
                this.logger.warn({
                    message: `Model not found for cascade operation`,
                    model: relation.model,
                    entityId,
                });
            }
        }
    }

    /**
     * Configuración de relaciones para cascada.
     * Sobrescribir en repositorios específicos para definir las relaciones con tipado fuerte.
     *
     * @returns Array de configuraciones de relación con modelo y foreignKey tipados
     *
     * @example
     * // En CustomerRepository - tipado fuerte con modelos específicos
     * type CustomerChildModels = 'contact' | 'address';
     *
     * protected override getCascadeRelations(): CascadeRelationConfig<CustomerChildModels>[] {
     *   return [
     *     { model: 'contact', foreignKey: 'customerId' },
     *     { model: 'address', foreignKey: 'customerId' }
     *   ];
     * }
     */
    protected getCascadeRelations(): BaseCascadeRelationConfig[] {
        return [];
    }

    /**
     * Resuelve las relaciones de cascada desde los nombres de relación.
     * Busca en getCascadeRelations() las configuraciones que coincidan.
     *
     * @param relationNames - Nombres de las relaciones (ej: ['contacts', 'addresses'])
     * @returns Configuraciones de relación para cascada
     */
    protected resolveCascadeRelations(relationNames: string[]): BaseCascadeRelationConfig[] {
        const allRelations = this.getCascadeRelations();
        // Filtrar por nombres de relación que coincidan (singular o plural)
        return allRelations.filter((rel) => {
            const modelLower = rel.model.toLowerCase();
            return relationNames.some((name) => {
                const nameLower = name.toLowerCase();
                // Coincidir con nombre exacto, singular o plural
                return (
                    nameLower === modelLower ||
                    nameLower === `${modelLower}s` ||
                    `${nameLower}s` === modelLower ||
                    nameLower.replace(/s$/, '') === modelLower ||
                    nameLower === modelLower.replace(/s$/, '')
                );
            });
        });
    }

    // ========================================================================
    // VALIDACIÓN DE RESTRICCIONES DE DESACTIVACIÓN
    // ========================================================================

    /**
     * Valida si una entidad puede ser desactivada verificando restricciones definidas.
     * Construye una query con OR de todas las relaciones que bloquean la desactivación.
     *
     * @template TModel - Nombre del modelo Prisma
     * @param params - Parámetros de validación incluyendo id, restricciones y cliente
     * @returns Resultado con canDeactivate, violations y blockedBy
     *
     * @example
     * // En CustomerRepository
     * const result = await this.validateDeactivationRestrictions<'customer'>({
     *   id: customerId,
     *   restrictions: [
     *     { relation: 'sellings', condition: { isActive: true }, message: 'Tiene ventas activas' },
     *     { relation: 'rentings', condition: { isActive: true }, message: 'Tiene alquileres activos' },
     *   ],
     *   client: txClient,
     * });
     *
     * if (!result.canDeactivate) {
     *   throw new BadRequestException(result.violations.join('. '));
     * }
     */
    protected async validateDeactivationRestrictions<TModel extends PrismaModelName>(
        params: ValidateDeactivationParams<TModel>,
    ): Promise<DeactivationValidationResult> {
        const { id, restrictions, client, softDeleteSkippedRestrictions } = params;

        if (!restrictions || restrictions.length === 0) {
            return { canDeactivate: true, violations: [], blockedBy: [] };
        }

        const effectiveRestrictions = softDeleteSkippedRestrictions
            ? restrictions.filter((r) => !softDeleteSkippedRestrictions.includes(r.relation))
            : restrictions;

        // Construir condiciones OR para todas las restricciones
        // Para relaciones 1:1 (isSingleRelation=true) no se usa 'some', se aplica la condición directamente
        const orConditions = effectiveRestrictions.map((restriction) => {
            const condition = restriction.condition ?? { isActive: true };
            if (restriction.isSingleRelation) {
                // Relación 1:1: aplicar condición directamente
                return {
                    [restriction.relation]: condition,
                };
            }
            // Relación 1:many: usar operador 'some'
            return {
                [restriction.relation]: {
                    some: condition,
                },
            };
        });

        // Necesitamos obtener el nombre del modelo desde el repositorio concreto
        // Para esto usamos una query genérica con el cliente
        const modelName = this.getModelName();

        if (!modelName) {
            this.logger.warn({
                message: 'Model name not defined for deactivation validation',
                entityId: id,
            });
            return { canDeactivate: true, violations: [], blockedBy: [] };
        }

        const model = (client as any)[modelName];
        if (!model || typeof model.findFirst !== 'function') {
            this.logger.warn({
                message: 'Model not found for deactivation validation',
                modelName,
                entityId: id,
            });
            return { canDeactivate: true, violations: [], blockedBy: [] };
        }

        // Ejecutar la query para verificar si hay restricciones
        const entityWithBlockingRelations = await model.findFirst({
            where: {
                id,
                AND: {
                    OR: orConditions,
                    isActive: true,
                },
            },
            select: {
                id: true,
                // Seleccionar las relaciones para determinar cuáles bloquean
                ...Object.fromEntries(
                    restrictions.map((r) => {
                        const condition = r.condition ?? { isActive: true };
                        if (r.isSingleRelation) {
                            // Relación 1:1: usar select simple
                            return [
                                r.relation,
                                {
                                    select: { id: true },
                                },
                            ];
                        }
                        // Relación 1:many: usar where, take y select
                        return [
                            r.relation,
                            {
                                where: condition,
                                take: 1, // Solo necesitamos saber si existe al menos uno
                                select: { id: true },
                            },
                        ];
                    }),
                ),
            },
        });

        if (!entityWithBlockingRelations) {
            return { canDeactivate: true, violations: [], blockedBy: [] };
        }

        // Determinar qué relaciones bloquean la desactivación
        const violations: string[] = [];
        const blockedBy: string[] = [];

        for (const restriction of restrictions) {
            const relationData = entityWithBlockingRelations[restriction.relation as string];
            // Para relaciones 1:1, relationData es un objeto (o null)
            // Para relaciones 1:many, relationData es un array
            const hasBlockingData = restriction.isSingleRelation
                ? relationData !== null && relationData !== undefined
                : Array.isArray(relationData) && relationData.length > 0;

            if (hasBlockingData) {
                violations.push(restriction.message);
                blockedBy.push(restriction.relation as string);
            }
        }

        return {
            canDeactivate: violations.length === 0,
            violations,
            blockedBy,
        };
    }

    /**
     * Valida restricciones y lanza excepción si no se puede desactivar.
     * Método conveniente que combina validación y lanzamiento de error.
     *
     * @template TModel - Nombre del modelo Prisma
     * @param params - Parámetros de validación
     * @throws BadRequestException si hay restricciones violadas
     *
     * @example
     * // En el método toggleActive de CustomerRepository
     * if (!isActive) {
     *   await this.assertCanDeactivate<'customer'>({
     *     id,
     *     restrictions: customerDeactivationRestrictions,
     *     client: txClient,
     *   });
     * }
     */
    protected async assertCanDeactivate<TModel extends PrismaModelName>(
        params: ValidateDeactivationParams<TModel>,
    ): Promise<void> {
        const result = await this.validateDeactivationRestrictions(params);

        if (!result.canDeactivate) {
            const errorMessage =
                result.violations.length === 1
                    ? result.violations[0]
                    : `No se puede desactivar: ${result.violations.join('. ')}`;

            this.logger.warn({
                message: 'Deactivation blocked by restrictions',
                entityId: params.id,
                blockedBy: result.blockedBy,
                violations: result.violations,
            });

            throw new BadRequestException(errorMessage);
        }
    }

    /**
     * Nombre del modelo Prisma para este repositorio.
     * Debe ser sobrescrito en repositorios concretos para habilitar
     * la validación de restricciones de desactivación.
     *
     * @returns Nombre del modelo en minúsculas (ej: 'customer', 'supplier')
     *
     * @example
     * // En CustomerRepository
     * protected override getModelName(): PrismaModelName {
     *   return 'customer';
     * }
     */
    protected getModelName(): PrismaModelName | undefined {
        return undefined;
    }

    buildWhere<ReturnType = V>(props?: BuildWhereFromFilterOptionsProps<T>) {
        const defaultConfig = this.getWhereClauseFieldConfig();
        const providedConfig = props?.config ? toFieldProcessingConfig(props.config) : undefined;

        let configToUse = providedConfig ?? defaultConfig;

        if (defaultConfig && providedConfig) {
            configToUse = combineFieldConfigs(defaultConfig, providedConfig);
        }

        const finalProps: BuildWhereFromFilterOptionsProps<T> | undefined = props
            ? {
                  ...props,
                  config: configToUse ?? props.config,
              }
            : configToUse
              ? { config: configToUse }
              : undefined;

        return buildWhereFromFilterOptions<T>(finalProps) as ReturnType;
    }

    // ========================================================================
    // PRESELECTED IDS - Lógica genérica para paginación con IDs preseleccionados
    // ========================================================================

    /**
     * Construye el contexto de paginación con preselectedIds.
     * Construye el where modificado según la página y los preselectedIds.
     *
     * @param params Parámetros incluyendo where, page y preselectedIds
     * @returns Contexto con lógica de preselección aplicada
     */
    protected buildPreselectedIdsContext(params: {
        where: V;
        page: number;
        preselectedIds?: string[];
    }): PreselectedIdsContext<V> {
        const { where, page, preselectedIds } = params;

        if (!preselectedIds || preselectedIds.length === 0) {
            return {
                usePreselectedLogic: false,
                where,
                preselectedIds: [],
            };
        }

        if (page === 1) {
            // PÁGINA 1: Marcar que se debe usar lógica especial
            return {
                usePreselectedLogic: true,
                isFirstPage: true,
                where,
                preselectedIds,
            };
        }

        // PÁGINAS > 1: Excluir preseleccionados del where
        const modifiedWhere = {
            ...where,
            id: { notIn: preselectedIds },
        } as V;

        return {
            usePreselectedLogic: true,
            isFirstPage: false,
            where: modifiedWhere,
            preselectedIds,
        };
    }

    /**
     * Ejecuta la lógica de paginación con preselectedIds para página 1.
     * Los elementos preseleccionados aparecen primero, seguidos del resto.
     *
     * @param params Parámetros para la ejecución
     * @returns Resultado paginado con preseleccionados primero
     *
     * @example
     * ```typescript
     * // En el repositorio específico:
     * const context = this.buildPreselectedIdsContext({ where, page, preselectedIds });
     *
     * if (context.usePreselectedLogic && context.isFirstPage) {
     *     return this.executePreselectedFirstPage({
     *         context,
     *         pageSize,
     *         orderBy,
     *         fetchPreselected: async (ids) => {
     *             return this.client.myModel.findMany({
     *                 where: { ...where, id: { in: ids } },
     *                 include: myInclude,
     *             });
     *         },
     *         fetchOthers: async (excludeIds, take) => {
     *             return this.client.myModel.findMany({
     *                 where: { ...where, id: { notIn: excludeIds } },
     *                 orderBy,
     *                 take,
     *                 include: myInclude,
     *             });
     *         },
     *         countTotal: async () => this.client.myModel.count({ where }),
     *         mapToDomain: (item) => MyMapper.toDomain(item),
     *     });
     * }
     * ```
     */
    protected async executePreselectedFirstPage<TRaw, TDomain>(params: {
        context: PreselectedIdsContext<V>;
        pageSize: number;
        orderBy: W | undefined;
        fetchPreselected: (ids: string[]) => Promise<TRaw[]>;
        fetchOthers: (excludeIds: string[], take: number) => Promise<TRaw[]>;
        countTotal: () => Promise<number>;
        mapToDomain: (item: TRaw) => TDomain;
    }): Promise<{
        data: TDomain[];
        meta: import('@config/interfaces/base.interface.repository').PaginationMetadata;
    }> {
        const { context, pageSize, fetchPreselected, fetchOthers, countTotal, mapToDomain } = params;

        const preselectedItems = await fetchPreselected(context.preselectedIds);

        if (preselectedItems.length > 0) {
            const remainingSlots = pageSize - preselectedItems.length;
            const otherItems = remainingSlots > 0 ? await fetchOthers(context.preselectedIds, remainingSlots) : [];

            const allItems = [...preselectedItems, ...otherItems];
            const total = await countTotal();

            return {
                data: allItems.map(mapToDomain),
                meta: {
                    total,
                    page: 1,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                    hasNext: 1 < Math.ceil(total / pageSize),
                    hasPrevious: false,
                },
            };
        }

        // Si no se encontraron preseleccionados, retornar resultado vacío
        // El código que llama debería continuar con la lógica normal
        return {
            data: [],
            meta: {
                total: 0,
                page: 1,
                pageSize,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false,
            },
        };
    }
}

/**
 * Contexto para la lógica de preselectedIds.
 * Indica si se debe usar lógica especial y contiene el where modificado.
 */
export type PreselectedIdsContext<TWhere> = {
    usePreselectedLogic: boolean;
    isFirstPage?: boolean;
    where: TWhere;
    preselectedIds: string[];
};

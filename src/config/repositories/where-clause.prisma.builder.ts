/**
 * @fileoverview Builder funcional para construir cláusulas WHERE de Prisma.
 *
 * Este módulo proporciona funciones puras y componibles para construir
 * cláusulas WHERE de manera type-safe y sin duplicación de código.
 *
 * Diseñado para:
 * - Reducir duplicación en buildWhereClause
 * - Facilitar testing unitario
 * - Permitir composición de filtros
 * - Mantener compatibilidad con la API existente
 *
 * @example
 * // Uso directo con funciones
 * const condition = buildFieldCondition('name', 'Juan', config);
 *
 * // Uso con el builder
 * const where = createWhereClauseBuilder<Customer>()
 *   .addSearchByField({ name: 'Juan', email: 'test' })
 *   .addOR({ searchByField: { phone: '123' } })
 *   .build();
 */
import type {
    BaseFilterArrayOptions,
    BaseFilterOptions,
    FieldDateOptions,
    FieldNumberOptions,
    FilterOptions,
    PrismaModelName,
    PrismaScalarFields,
    SearchByFieldsRelational,
} from '../interfaces/base.interface.repository';

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

/**
 * Extrae las claves de tipo string de un tipo T
 * Útil para obtener solo los nombres de campos como strings
 */
export type StringKeyOf<T> = Extract<keyof T, string>;

/**
 * Configuración para el procesamiento de campos usando modelo Prisma.
 * Proporciona autocompletado basado en los campos escalares del modelo.
 *
 * @template TModel - Nombre del modelo Prisma (e.g., 'customer', 'contact')
 *
 * @example
 * // Con autocompletado de campos del modelo Prisma
 * const config: FieldProcessingConfigPrisma<'customer'> = {
 *     enumFields: ['customerType', 'status'],  // ← autocompletado de PrismaScalarFields
 *     dateFields: ['createdAt', 'updatedAt'],
 * };
 */
export interface FieldProcessingConfigPrisma<TModel extends PrismaModelName> {
    /** Campos que son enums y no deben usar 'contains' */
    enumFields?: PrismaScalarFields<TModel>[];
    /** Campos que son fechas */
    dateFields?: PrismaScalarFields<TModel>[];
}

/**
 * Configuración para el procesamiento de campos usando tipo genérico.
 * Útil cuando se trabaja con entidades de dominio o tipos custom.
 *
 * @template T - Tipo de la entidad para autocompletado de campos
 *
 * @example
 * // Con entidad de dominio
 * const config: FieldProcessingConfig<Customer> = {
 *     enumFields: ['customerType'],
 *     dateFields: ['createdAt'],
 * };
 */
export interface FieldProcessingConfig<T = Record<string, unknown>> {
    /** Campos que son enums y no deben usar 'contains' */
    enumFields?: StringKeyOf<T>[];
    /** Campos que son fechas */
    dateFields?: StringKeyOf<T>[];
}

/**
 * Configuración extendida que permite campos de relaciones anidadas.
 * Usa strings para permitir notación de paths anidados (e.g., 'contact.type').
 *
 * @description
 * Para queries que navegan relaciones, los campos pueden estar en cualquier
 * nivel de anidamiento. Esta config acepta strings planos para máxima flexibilidad.
 *
 * @example
 * const config: FieldProcessingConfigExtended = {
 *     enumFields: ['status', 'contact.type', 'address.country'],
 *     dateFields: ['createdAt', 'contact.birthDate'],
 * };
 */
export interface FieldProcessingConfigExtended {
    /** Campos que son enums (puede incluir paths anidados) */
    enumFields?: string[];
    /** Campos que son fechas (puede incluir paths anidados) */
    dateFields?: string[];
}

// ============================================================================
// HELPERS TYPE-SAFE PARA CREAR CONFIGURACIÓN DE CAMPOS
// ============================================================================

/**
 * Crea una configuración de campos tipada para un modelo Prisma.
 * Proporciona autocompletado de campos escalares del modelo.
 *
 * @template TModel - Nombre del modelo Prisma
 * @returns Función que acepta la configuración y retorna el mismo objeto
 *
 * @example
 * const customerConfig = createFieldConfig<'customer'>()({
 *     enumFields: ['customerType', 'status'],  // ← autocompletado
 *     dateFields: ['createdAt', 'updatedAt'],  // ← autocompletado
 * });
 */
export const createFieldConfig =
    <TModel extends PrismaModelName>() =>
    (config: FieldProcessingConfigPrisma<TModel>): FieldProcessingConfigExtended =>
        config as FieldProcessingConfigExtended;

/**
 * Crea un array de campos enum tipados para un modelo Prisma.
 *
 * @template TModel - Nombre del modelo Prisma
 * @returns Función que acepta campos y retorna array de strings
 *
 * @example
 * const enums = enumFields<'customer'>()(['customerType', 'status']);
 */
export const enumFields =
    <TModel extends PrismaModelName>() =>
    (fields: PrismaScalarFields<TModel>[]): string[] =>
        fields as string[];

/**
 * Crea un array de campos fecha tipados para un modelo Prisma.
 *
 * @template TModel - Nombre del modelo Prisma
 * @returns Función que acepta campos y retorna array de strings
 *
 * @example
 * const dates = dateFields<'customer'>()(['createdAt', 'updatedAt']);
 */
export const dateFields =
    <TModel extends PrismaModelName>() =>
    (fields: PrismaScalarFields<TModel>[]): string[] =>
        fields as string[];

/**
 * Combina configuraciones de múltiples modelos para queries con relaciones.
 * Útil cuando la query navega a través de múltiples modelos relacionados.
 *
 * @param configs - Array de configuraciones a combinar
 * @returns Configuración combinada
 *
 * @example
 * const combinedConfig = combineFieldConfigs(
 *     createFieldConfig<'customer'>()({ enumFields: ['customerType'] }),
 *     createFieldConfig<'contact'>()({ dateFields: ['birthDate'] }),
 *     createFieldConfig<'address'>()({ enumFields: ['country'] }),
 * );
 */
export const combineFieldConfigs = (...configs: FieldProcessingConfigExtended[]): FieldProcessingConfigExtended => {
    const enumFields: string[] = [];
    const dateFields: string[] = [];

    configs.forEach((config) => {
        if (config.enumFields) enumFields.push(...config.enumFields);
        if (config.dateFields) dateFields.push(...config.dateFields);
    });

    return {
        enumFields: enumFields.length > 0 ? [...new Set(enumFields)] : undefined,
        dateFields: dateFields.length > 0 ? [...new Set(dateFields)] : undefined,
    };
};

type AnyFieldConfig = FieldProcessingConfig<unknown> | FieldProcessingConfigExtended;

/**
 * Normaliza cualquier configuración (tipada o extendida) a FieldProcessingConfigExtended.
 * Garantiza que los campos sean strings simples.
 */
export const toFieldProcessingConfig = (config?: AnyFieldConfig): FieldProcessingConfigExtended | undefined => {
    if (!config) return undefined;

    const enumFields = config.enumFields?.map((field) => field as string);
    const dateFields = config.dateFields?.map((field) => field as string);

    return {
        enumFields: enumFields && enumFields.length > 0 ? enumFields : undefined,
        dateFields: dateFields && dateFields.length > 0 ? dateFields : undefined,
    };
};

/**
 * Tipo genérico para cláusulas WHERE
 */
export type WhereClause = Record<string, unknown>;

/**
 * Condición de filtro individual
 */
export type FilterCondition = Record<string, unknown>;

/**
 * Tipo para opciones OR/NOT extraído de FilterOptions
 */
export type LogicalGroupOptions<T> = {
    searchByField?: BaseFilterOptions<T>;
    searchByFieldsRelational?: SearchByFieldsRelational<T>[];
    /**
     * Campos directos para condiciones lógicas (ej: { id: { notIn: ['uuid1', 'uuid2'] } })
     * Permite excluir IDs específicos o aplicar condiciones directas
     */
    directFields?: Record<string, unknown>;
};

// ============================================================================
// FUNCIONES HELPER PURAS - Construcción de condiciones individuales
// ============================================================================

/**
 * Verifica si un campo es de tipo enum
 */
export const isEnumField = (fieldName: string, enumFields?: string[]): boolean => {
    return enumFields?.includes(fieldName) ?? false;
};

/**
 * Verifica si un campo es de tipo fecha
 */
export const isDateField = (fieldName: string, dateFields?: string[]): boolean => {
    return dateFields?.includes(fieldName) ?? false;
};

/**
 * Construye una condición de fecha basada en el operador
 */
export const buildDateCondition = (
    value: string,
    operator: 'range' | 'equals' | 'gte' | 'lte' | 'gt' | 'lt' = 'range',
): unknown => {
    // Detectar si es un rango (formato: "2023-01-01 - 2023-12-31")
    if (operator === 'range' && value.includes(' - ')) {
        const [startStr, endStr] = value.split(' - ').map((s) => s.trim());
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        // Ajustar endDate al final del día
        endDate.setHours(23, 59, 59, 999);
        return { gte: startDate, lte: endDate };
    }

    const date = new Date(value);
    switch (operator) {
        case 'equals':
            return date;
        case 'gte':
            return { gte: date };
        case 'lte':
            return { lte: date };
        case 'gt':
            return { gt: date };
        case 'lt':
            return { lt: date };
        default:
            return date;
    }
};

/**
 * Construye la condición para un campo individual.
 * Esta es la función central que elimina la duplicación.
 *
 * @param key - Nombre del campo
 * @param value - Valor a filtrar
 * @param config - Configuración de campos especiales
 * @returns Condición de Prisma para el campo
 *
 * @example
 * buildFieldCondition('name', 'Juan', {});
 * // Retorna: { contains: 'Juan', mode: 'insensitive' }
 *
 * buildFieldCondition('status', 'ACTIVE', { enumFields: ['status'] });
 * // Retorna: 'ACTIVE'
 */
export const buildFieldCondition = (key: string, value: unknown, config: FieldProcessingConfig = {}): unknown => {
    const { enumFields, dateFields } = config;

    if (typeof value === 'string') {
        // Campos enum: valor directo
        if (isEnumField(key, enumFields)) {
            return value;
        }
        // Campos fecha: construir condición de fecha
        if (isDateField(key, dateFields)) {
            return buildDateCondition(value, 'range');
        }
        // Campos string normales: búsqueda case-insensitive
        return { contains: value, mode: 'insensitive' };
    }

    // Otros tipos (number, boolean, etc.): valor directo
    return value;
};

/**
 * Aplica una condición de campo numérico al objeto WHERE
 */
export const buildNumberCondition = <T>(fieldNumber: FieldNumberOptions<T>): FilterCondition => {
    const { field, value, operator } = fieldNumber;
    const fieldKey = String(field);

    switch (operator) {
        case 'equals':
            return { [fieldKey]: value };
        case 'in':
            return { [fieldKey]: { in: [value] } };
        case 'notIn':
            return { [fieldKey]: { notIn: [value] } };
        case 'lt':
            return { [fieldKey]: { lt: value } };
        case 'lte':
            return { [fieldKey]: { lte: value } };
        case 'gt':
            return { [fieldKey]: { gt: value } };
        case 'gte':
            return { [fieldKey]: { gte: value } };
        case 'not':
            return { [fieldKey]: { not: value } };
        default:
            return { [fieldKey]: value };
    }
};

/**
 * Aplica una condición de campo de fecha al objeto WHERE
 */
export const buildDateFieldCondition = <T>(fieldDate: FieldDateOptions<T>): FilterCondition => {
    const { field, value, operator = 'range' } = fieldDate;
    const fieldKey = String(field);
    return { [fieldKey]: buildDateCondition(value, operator) };
};

/**
 * Construye condiciones para arrays (IN queries)
 */
export const buildArrayConditions = <T>(arrayByField: BaseFilterArrayOptions<T>): FilterCondition => {
    const result: FilterCondition = {};

    Object.entries(arrayByField).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
            result[key] = { in: values };
        }
    });

    return result;
};

// ============================================================================
// FUNCIONES HELPER - Construcción de grupos de condiciones
// ============================================================================

/**
 * Procesa un objeto searchByField y retorna las condiciones
 */
export const processSearchByField = <T>(
    searchByField: BaseFilterOptions<T>,
    config: FieldProcessingConfig = {},
): FilterCondition => {
    const result: FilterCondition = {};

    Object.entries(searchByField).forEach(([key, value]) => {
        if (value !== undefined) {
            result[key] = buildFieldCondition(key, value, config);
        }
    });

    return result;
};

/**
 * Procesa searchByField para condiciones OR (cada campo es una condición separada)
 */
export const processSearchByFieldForOR = <T>(
    searchByField: BaseFilterOptions<T>,
    config: FieldProcessingConfig = {},
): FilterCondition[] => {
    const conditions: FilterCondition[] = [];

    Object.entries(searchByField).forEach(([key, value]) => {
        if (value !== undefined) {
            conditions.push({ [key]: buildFieldCondition(key, value, config) });
        }
    });

    return conditions;
};

/**
 * Detecta si un valor tiene estructura de condición de Prisma
 * (contiene operadores como contains, mode, equals, etc.)
 * Verifica recursivamente en objetos anidados
 */
const hasPrismaConditionStructure = (value: unknown, depth: number = 0): boolean => {
    // Limitar la profundidad para evitar recursión infinita
    if (depth > 5) {
        return false;
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const obj = value as Record<string, unknown>;
    const prismaOperators = [
        'contains',
        'mode',
        'equals',
        'not',
        'in',
        'notIn',
        'lt',
        'lte',
        'gt',
        'gte',
        'startsWith',
        'endsWith',
        'search',
    ];

    // Verificar si tiene operadores de Prisma directamente
    if (Object.keys(obj).some((key) => prismaOperators.includes(key))) {
        return true;
    }

    // Si no tiene operadores directamente, verificar recursivamente en valores anidados
    // Esto es importante para relaciones anidadas como customer.legalEntity
    return Object.values(obj).some((val) => hasPrismaConditionStructure(val, depth + 1));
};

/**
 * Construye condiciones recursivas para relaciones anidadas
 * Detecta automáticamente si es una relación directa (many-to-one, one-to-one)
 * basándose en si los valores procesados tienen estructura de Prisma.
 *
 * @param relationFields Campos de la relación a procesar
 * @param config Configuración de campos especiales (enum, date, etc.)
 * @param _relationName Nombre de la relación (para logging/debugging)
 */
export const buildRecursiveRelationConditions = (
    relationFields: unknown,
    config: FieldProcessingConfig = {},
    _relationName?: string,
): unknown => {
    if (!relationFields || typeof relationFields !== 'object') {
        return relationFields;
    }

    const result: Record<string, unknown> = {};

    Object.entries(relationFields as Record<string, unknown>).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Es un objeto anidado, procesar recursivamente
            const processedValue = buildRecursiveRelationConditions(value, config, key);

            // Detectar si es una relación one-to-many de forma genérica:
            // Si el nombre de la clave es plural (termina en 's' y tiene más de 1 carácter antes de la 's')
            // Y el valor procesado tiene estructura de Prisma, es probable que sea one-to-many.
            // Esto es una heurística genérica que funciona para la mayoría de casos.
            const isPlural = key.length > 1 && key.endsWith('s') && !key.endsWith('ss');
            const hasPrismaStructure = hasPrismaConditionStructure(processedValue, 0);

            // Si es plural Y tiene estructura de Prisma, es probable que sea one-to-many
            // Nota: esto es una heurística, pero funciona para la mayoría de casos genéricos
            if (isPlural && hasPrismaStructure) {
                // Es una relación one-to-many, envolver en 'some'
                result[key] = { some: processedValue };
            } else {
                // Es una relación directa o el valor ya tiene 'some', usar directamente
                result[key] = processedValue;
            }
        } else if (typeof value === 'string') {
            result[key] = buildFieldCondition(key, value, config);
        } else {
            result[key] = value;
        }
    });

    // Detectar si es una relación directa: si los valores del resultado tienen
    // estructura de Prisma (contains, mode, etc.) en cualquier nivel anidado,
    // es una relación directa (many-to-one/one-to-one) y NO debe usar 'some'.
    // Solo relaciones one-to-many (arrays) deben usar 'some'.
    if (Object.keys(result).length > 0) {
        const hasPrismaConditions = Object.values(result).some((val) => hasPrismaConditionStructure(val, 0));

        // Si tiene condiciones de Prisma (directamente o anidadas), es relación directa → no usar 'some'
        // Si no tiene condiciones de Prisma, es relación one-to-many → usar 'some'
        if (!hasPrismaConditions) {
            return { some: result };
        }
    }

    return result;
};

// ============================================================================
// BUILDER FUNCIONAL - API Fluida (Opción 2)
// ============================================================================

/**
 * Estado interno del builder
 */
interface WhereClauseBuilderState<T> {
    clause: WhereClause;
    config: FieldProcessingConfigExtended;
    orConditions: FilterCondition[];
    notConditions: FilterCondition[];
    andConditions: FilterCondition[];
}

/**
 * Interfaz del builder con API fluida
 */
export interface IWhereClauseBuilder<T> {
    /**
     * Agrega condiciones de búsqueda por campo (AND)
     */
    withSearchByField(searchByField?: BaseFilterOptions<T>): IWhereClauseBuilder<T>;

    /**
     * Agrega condiciones OR
     */
    withOR(or?: LogicalGroupOptions<T>): IWhereClauseBuilder<T>;

    /**
     * Agrega condiciones NOT
     */
    withNOT(not?: LogicalGroupOptions<T>): IWhereClauseBuilder<T>;

    /**
     * Agrega filtros numéricos
     */
    withFieldNumbers(fieldNumbers?: FieldNumberOptions<T>[]): IWhereClauseBuilder<T>;

    /**
     * Agrega filtros de fecha
     */
    withFieldDates(fieldDates?: FieldDateOptions<T>[]): IWhereClauseBuilder<T>;

    /**
     * Agrega filtros de array
     */
    withArrayByField(arrayByField?: BaseFilterArrayOptions<T>): IWhereClauseBuilder<T>;

    /**
     * Agrega campos directos (rest)
     */
    withDirectFields(fields?: Record<string, unknown>): IWhereClauseBuilder<T>;

    /**
     * Construye la cláusula WHERE final
     */
    build(): WhereClause;
}

/**
 * Crea un nuevo builder para cláusulas WHERE.
 * Proporciona una API fluida alternativa a buildWhereClause.
 *
 * @param config - Configuración de campos especiales (puede usar createFieldConfig para tipado)
 * @returns Builder con API fluida
 *
 * @example
 * // Sin tipado específico
 * const where = createWhereClauseBuilder<Customer>({ enumFields: ['status'] })
 *   .withSearchByField({ name: 'Juan' })
 *   .build();
 *
 * // Con tipado de modelo Prisma (recomendado)
 * const config = createFieldConfig<'customer'>()({
 *     enumFields: ['customerType', 'status'],
 *     dateFields: ['createdAt'],
 * });
 * const where = createWhereClauseBuilder<Customer>(config)
 *   .withSearchByField({ name: 'Juan' })
 *   .build();
 */
export const createWhereClauseBuilder = <T>(
    config?: FieldProcessingConfig<T> | FieldProcessingConfigExtended,
): IWhereClauseBuilder<T> => {
    const normalizedConfig = toFieldProcessingConfig(config);
    const state: WhereClauseBuilderState<T> = {
        clause: {},
        config: normalizedConfig ?? {},
        orConditions: [],
        notConditions: [],
        andConditions: [],
    };

    const builder: IWhereClauseBuilder<T> = {
        withSearchByField(searchByField) {
            if (searchByField) {
                const conditions = processSearchByField(searchByField, state.config);
                Object.assign(state.clause, conditions);
            }
            return builder;
        },

        withOR(or) {
            if (or) {
                if (or.searchByField) {
                    const conditions = processSearchByFieldForOR(or.searchByField, state.config);
                    state.orConditions.push(...conditions);
                }
                if (or.searchByFieldsRelational) {
                    or.searchByFieldsRelational.forEach((relation) => {
                        Object.entries(relation).forEach(([relationName, relationFields]) => {
                            const condition: FilterCondition = {};
                            condition[relationName] = buildRecursiveRelationConditions(
                                relationFields,
                                state.config,
                                relationName,
                            );
                            state.orConditions.push(condition);
                        });
                    });
                }
                // Procesar campos directos (ej: { id: { in: ['uuid1', 'uuid2'] } })
                if (or.directFields) {
                    Object.entries(or.directFields).forEach(([key, value]) => {
                        if (value !== undefined) {
                            const condition: FilterCondition = {};
                            condition[key] = value;
                            state.orConditions.push(condition);
                        }
                    });
                }
            }
            return builder;
        },

        withNOT(not) {
            if (not) {
                if (not.searchByField) {
                    const conditions = processSearchByFieldForOR(not.searchByField, state.config);
                    state.notConditions.push(...conditions);
                }
                if (not.searchByFieldsRelational) {
                    not.searchByFieldsRelational.forEach((relation) => {
                        Object.entries(relation).forEach(([relationName, relationFields]) => {
                            const condition: FilterCondition = {};
                            condition[relationName] = buildRecursiveRelationConditions(
                                relationFields,
                                state.config,
                                relationName,
                            );
                            state.notConditions.push(condition);
                        });
                    });
                }
                // Procesar campos directos (ej: { id: { notIn: ['uuid1', 'uuid2'] } })
                if (not.directFields) {
                    Object.entries(not.directFields).forEach(([key, value]) => {
                        if (value !== undefined) {
                            const condition: FilterCondition = {};
                            condition[key] = value;
                            state.notConditions.push(condition);
                        }
                    });
                }
            }
            return builder;
        },

        withFieldNumbers(fieldNumbers) {
            if (fieldNumbers && fieldNumbers.length > 0) {
                fieldNumbers.forEach((fieldNum) => {
                    const condition = buildNumberCondition(fieldNum);
                    Object.assign(state.clause, condition);
                });
            }
            return builder;
        },

        withFieldDates(fieldDates) {
            if (fieldDates && fieldDates.length > 0) {
                fieldDates.forEach((fieldDate) => {
                    const condition = buildDateFieldCondition(fieldDate);
                    // Hacer merge si ya existe una condición para el mismo campo
                    Object.entries(condition).forEach(([key, value]) => {
                        if (
                            state.clause[key] &&
                            typeof state.clause[key] === 'object' &&
                            !(state.clause[key] instanceof Date) &&
                            typeof value === 'object' &&
                            !(value instanceof Date)
                        ) {
                            // Merge: combinar { gte: fecha1 } con { lte: fecha2 } => { gte: fecha1, lte: fecha2 }
                            Object.assign(state.clause[key] as Record<string, unknown>, value);
                        } else {
                            state.clause[key] = value;
                        }
                    });
                });
            }
            return builder;
        },

        withArrayByField(arrayByField) {
            if (arrayByField) {
                const conditions = buildArrayConditions(arrayByField);
                Object.assign(state.clause, conditions);
            }
            return builder;
        },

        withDirectFields(fields) {
            if (fields) {
                Object.entries(fields).forEach(([key, value]) => {
                    if (value !== undefined) {
                        state.clause[key] = value;
                    }
                });
            }
            return builder;
        },

        build() {
            const result = { ...state.clause };

            if (state.orConditions.length > 0) {
                result.OR = state.orConditions;
            }

            if (state.notConditions.length > 0) {
                result.NOT = state.notConditions;
            }

            if (state.andConditions.length > 0) {
                result.AND = state.andConditions;
            }

            return result;
        },
    };

    return builder;
};

// ============================================================================
// FUNCIÓN DE CONVENIENCIA - Construcción desde FilterOptions
// ============================================================================
export type BuildWhereFromFilterOptionsProps<T> = {
    config?: FieldProcessingConfig<T> | FieldProcessingConfigExtended;
    filterOptions?: FilterOptions<T>;
};
/**
 * Construye una cláusula WHERE completa desde FilterOptions.
 * Función de conveniencia que usa el builder internamente.
 *
 * @param filterOptions - Opciones de filtrado
 * @param config - Configuración de campos especiales (puede usar createFieldConfig)
 * @returns Cláusula WHERE para Prisma
 *
 * @example
 * // Simple
 * const where = buildWhereFromFilterOptions({
 *   filterOptions,
 *   config: { enumFields: ['status'], dateFields: ['createdAt'] },
 * });
 *
 * // Con tipado Prisma (recomendado)
 * const where = buildWhereFromFilterOptions({
 *   filterOptions,
 *   config: createFieldConfig<'customer'>()({
 *       enumFields: ['customerType', 'status'],
 *       dateFields: ['createdAt', 'updatedAt'],
 *   }),
 * });
 */
export const buildWhereFromFilterOptions = <T>(props?: BuildWhereFromFilterOptionsProps<T>): WhereClause => {
    const { filterOptions, config } = props ?? {};
    if (!filterOptions) {
        return {};
    }
    const normalizedConfig = toFieldProcessingConfig(config);

    const {
        searchByField,
        searchByFieldsRelational: _searchByFieldsRelational,
        OR,
        NOT,
        fieldNumber,
        fieldNumbers,
        fieldDate,
        fieldDates,
        arrayByField,
        ORComplex: _ORComplex,
        ...rest
    } = filterOptions;

    // Normalizar fieldNumber/fieldNumbers
    const normalizedFieldNumbers: FieldNumberOptions<T>[] = [];
    if (fieldNumber) normalizedFieldNumbers.push(fieldNumber);
    if (fieldNumbers) normalizedFieldNumbers.push(...fieldNumbers);

    // Normalizar fieldDate/fieldDates
    const normalizedFieldDates: FieldDateOptions<T>[] = [];
    if (fieldDate) normalizedFieldDates.push(fieldDate);
    if (fieldDates) normalizedFieldDates.push(...fieldDates);

    // Extraer OR y NOT como LogicalGroupOptions (evita el problema de tipos)
    const orOptions: LogicalGroupOptions<T> | undefined = OR
        ? {
              searchByField: OR.searchByField,
              searchByFieldsRelational: OR.searchByFieldsRelational,
              directFields: OR.directFields,
          }
        : undefined;

    const notOptions: LogicalGroupOptions<T> | undefined = NOT
        ? {
              searchByField: NOT.searchByField,
              searchByFieldsRelational: NOT.searchByFieldsRelational,
              directFields: NOT.directFields,
          }
        : undefined;

    return createWhereClauseBuilder<T>(normalizedConfig)
        .withSearchByField(searchByField)
        .withOR(orOptions)
        .withNOT(notOptions)
        .withFieldNumbers(normalizedFieldNumbers)
        .withFieldDates(normalizedFieldDates)
        .withArrayByField(arrayByField)
        .withDirectFields(rest as Record<string, unknown>)
        .build();
};

/**
 * @fileoverview Módulo de utilidades para repositorios Prisma
 *
 * Exporta:
 * - Where Clause Builder: Construcción funcional de cláusulas WHERE
 * - Funciones helper: Utilidades para construir condiciones
 */

// Where Clause Builder - Funciones y tipos
export {
    buildArrayConditions,
    buildDateCondition,
    buildDateFieldCondition,
    buildFieldCondition,
    buildNumberCondition,
    buildRecursiveRelationConditions,
    // Función de conveniencia
    buildWhereFromFilterOptions,
    combineFieldConfigs,
    // Helpers type-safe para configuración
    createFieldConfig,
    // Builder
    createWhereClauseBuilder,
    dateFields,
    enumFields,
    type FieldProcessingConfig,
    type FieldProcessingConfigExtended,
    type FieldProcessingConfigPrisma,
    type FilterCondition,
    type IWhereClauseBuilder,
    isDateField,
    // Funciones helper puras
    isEnumField,
    type LogicalGroupOptions,
    processSearchByField,
    processSearchByFieldForOR,
    // Tipos
    type StringKeyOf,
    toFieldProcessingConfig,
    type WhereClause,
} from './where-clause.prisma.builder';

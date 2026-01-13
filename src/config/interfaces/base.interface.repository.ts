import type { Prisma, PrismaClient } from '@prisma/client';

export type PaginationMetadata = {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMetadata;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface SearchByField<F> {
    field: keyof F;
    value: string;
}

export type SortOptions<T> = {
    field: keyof T;
    order: 'asc' | 'desc';
};

export type SearchOperator = 'OR' | 'AND';

export type BaseFilterOptions<T> = {
    [key in keyof T]?: string | number | boolean | Date;
};

export type BaseFilterArrayOptions<T> = {
    [key in keyof T]?: (string | number | boolean | Date)[];
};

export type BaseFilterOptionsRecursive<T> = {
    [key in keyof T]?: string | number | boolean | Date | BaseFilterOptionsRecursive<T[key]> | Record<string, unknown>;
};

export type SearchByFieldsRelational<T> = {
    [key in keyof T]?: string | number | boolean | Date | BaseFilterOptionsRecursive<T[key]> | Record<string, unknown>;
};

export type FieldNumberOptions<T> = {
    field: keyof T;
    value: number;
    operator: 'equals' | 'in' | 'notIn' | 'lt' | 'lte' | 'gt' | 'gte' | 'not';
};

export type FieldDateOptions<T> = {
    field: keyof T;
    value: string; // Formato: "2023-01-01 - 2023-12-31" o "2023-01-01"
    operator?: 'range' | 'equals' | 'gte' | 'lte' | 'gt' | 'lt';
};

export type FilterOptions<T> = BaseFilterOptions<T> & {
    searchByField?: BaseFilterOptions<T>;
    searchByFieldsRelational?: SearchByFieldsRelational<T>[];
    // Opción OR simple: envuelve searchByField y searchByFieldsRelational
    OR?: {
        searchByField?: BaseFilterOptions<T>;
        searchByFieldsRelational?: SearchByFieldsRelational<T>[];
        /**
         * Campos directos para OR (ej: { id: { in: ['uuid1', 'uuid2'] } })
         * Permite incluir IDs específicos o aplicar condiciones OR directas
         */
        directFields?: Record<string, unknown>;
    };
    NOT?: {
        searchByField?: BaseFilterOptions<T>;
        searchByFieldsRelational?: SearchByFieldsRelational<T>[];
        /**
         * Campos directos para NOT (ej: { id: { notIn: ['uuid1', 'uuid2'] } })
         * Permite excluir IDs específicos o aplicar condiciones NOT directas
         */
        directFields?: Record<string, unknown>;
    };
    // Nueva opción para OR complejo que permite combinar diferentes tipos de condiciones
    ORComplex?: {
        conditions: Array<{
            searchByField?: BaseFilterOptions<T>;
            searchByFieldsRelational?: SearchByFieldsRelational<T>[];
            directFields?: BaseFilterOptions<T>;
        }>;
    };
    fieldNumber?: FieldNumberOptions<T>;
    fieldNumbers?: FieldNumberOptions<T>[]; // Múltiples filtros numéricos
    fieldDate?: FieldDateOptions<T>; // Filtro de fecha individual
    fieldDates?: FieldDateOptions<T>[]; // Múltiples filtros de fecha
    arrayByField?: BaseFilterArrayOptions<T>; // Filtro de array
    /**
     * IDs de elementos que deben aparecer primero en la primera página.
     * En página 1: los preseleccionados aparecen primero, luego el resto.
     * En páginas > 1: los preseleccionados se excluyen para evitar duplicados.
     */
    preselectedIds?: string[];
};

export type IncludeOptions<T> = {
    [key in keyof T]?: boolean;
};

export type ExcludeOptions<T> = {
    [key in keyof T]?: boolean;
};

export type FindManyParams<T> = {
    filterOptions?: FilterOptions<T>;
    sortOptions?: SortOptions<T>;
};
export type FindManyPaginatedParams<T> = {
    pagination?: PaginationParams;
    filterOptions?: FilterOptions<T>;
    sortOptions?: SortOptions<T>;
};

export type DeactivationStrategy = 'soft' | 'hard';

// ============================================================================
// TIPOS DE UTILIDAD PARA PRISMA - Extracción type-safe de modelos y relaciones
// ============================================================================

/**
 * Nombres de modelos de Prisma en formato de propiedad (minúscula inicial).
 * Extraído directamente de Prisma.TypeMap.
 * @example 'customer' | 'contact' | 'address' | ...
 */
export type PrismaModelName = Prisma.TypeMap['meta']['modelProps'];

/**
 * Tipo del cliente Prisma para un modelo específico.
 * @example PrismaModelDelegate<'customer'> = typeof prisma.customer
 */
export type PrismaModelDelegate<TModel extends PrismaModelName> = PrismaClient[TModel];

/**
 * Extrae el tipo Payload de un modelo Prisma.
 * Los Payloads contienen: name, objects (relaciones), scalars, composites
 */
export type PrismaPayload<TModel extends PrismaModelName> = Prisma.TypeMap['model'][Capitalize<TModel>]['payload'];

/**
 * Extrae los nombres de las relaciones (objects) de un modelo.
 * @example PrismaRelationNames<'customer'> = 'legalEntity' | 'contacts' | 'addresses' | ...
 */
export type PrismaRelationNames<TModel extends PrismaModelName> = keyof PrismaPayload<TModel>['objects'];

// ============================================================================
// TIPOS DE UTILIDAD PARA INCLUDE - Extracción type-safe de configuración Include
// ============================================================================

/**
 * Nombres de operaciones disponibles para un modelo en el TypeMap.
 * @example PrismaOperationNames<'customer'> = 'findUnique' | 'findFirst' | 'findMany' | ...
 */
export type PrismaOperationNames<TModel extends PrismaModelName> =
    keyof Prisma.TypeMap['model'][Capitalize<TModel>]['operations'];

/**
 * Extrae el tipo de args para la operación findFirst de un modelo.
 * findFirst siempre tiene include disponible en sus args.
 * @example PrismaFindFirstArgs<'customer'> = CustomerFindFirstArgs
 */
export type PrismaFindFirstArgs<TModel extends PrismaModelName> =
    Prisma.TypeMap['model'][Capitalize<TModel>]['operations']['findFirst']['args'];

/**
 * Extrae el tipo Include de los args de findFirst de un modelo.
 * Este tipo representa la configuración que se puede pasar a include: {...}
 * @example PrismaInclude<'customer'> = CustomerInclude
 *
 * @description
 * Incluye todas las relaciones disponibles con sus tipos:
 * - boolean: Para incluir la relación sin filtros
 * - NestedArgs: Para incluir la relación con filtros/select/include anidados
 */
export type PrismaInclude<TModel extends PrismaModelName> = PrismaFindFirstArgs<TModel> extends { include?: infer I }
    ? NonNullable<I>
    : never;

/**
 * Extrae las claves válidas para Include de un modelo.
 * Son los nombres de las relaciones que se pueden incluir.
 * @example PrismaIncludeKeys<'customer'> = 'legalEntity' | 'contacts' | 'addresses' | ...
 */
export type PrismaIncludeKeys<TModel extends PrismaModelName> = keyof PrismaInclude<TModel>;

/**
 * Crea un tipo de Include parcial con solo las relaciones especificadas.
 * Útil para definir qué relaciones siempre se incluyen en un repositorio.
 *
 * @template TModel - Nombre del modelo Prisma
 * @template TKeys - Keys de las relaciones a incluir
 *
 * @example
 * // Solo addresses y contacts de Customer
 * type CustomerPartialInclude = PrismaPartialInclude<'customer', 'addresses' | 'contacts'>;
 * // Resulta en: { addresses?: boolean | {...}, contacts?: boolean | {...} }
 */
export type PrismaPartialInclude<TModel extends PrismaModelName, TKeys extends PrismaIncludeKeys<TModel>> = Pick<
    PrismaInclude<TModel>,
    TKeys
>;

/**
 * Crea un tipo de Include requerido con las relaciones especificadas.
 * Todas las relaciones listadas serán obligatorias.
 *
 * @template TModel - Nombre del modelo Prisma
 * @template TKeys - Keys de las relaciones requeridas
 *
 * @example
 * // Include requerido para Customer repository
 * type CustomerRequiredInclude = PrismaRequiredInclude<'customer', 'legalEntity' | 'contacts'>;
 *
 * const include: CustomerRequiredInclude = {
 *   legalEntity: true,  // ✅ Requerido
 *   contacts: true,     // ✅ Requerido
 * };
 */
export type PrismaRequiredInclude<TModel extends PrismaModelName, TKeys extends PrismaIncludeKeys<TModel>> = Required<
    Pick<PrismaInclude<TModel>, TKeys>
>;

/**
 * Tipo de ayuda para crear configuraciones de Include type-safe.
 * Usa `satisfies` para validar que el objeto cumple con el tipo Include.
 *
 * @template TModel - Nombre del modelo Prisma
 *
 * @example
 * // En CustomerRepository
 * const customerInclude = {
 *   addresses: true,
 *   contacts: true,
 *   legalEntity: { include: { legalRepresentatives: true } },
 * } satisfies PrismaIncludeConfig<'customer'>;
 */
export type PrismaIncludeConfig<TModel extends PrismaModelName> = PrismaInclude<TModel>;

/**
 * Genera un tipo de Include simplificado donde todas las relaciones son `true`.
 * Útil cuando solo necesitas incluir relaciones sin configuración adicional.
 *
 * @template TModel - Nombre del modelo Prisma
 * @template TKeys - Keys de las relaciones a incluir
 *
 * @example
 * // Para incluir solo addresses y contacts
 * type SimpleInclude = PrismaSimpleInclude<'customer', 'addresses' | 'contacts'>;
 * // Resulta en: { addresses: true, contacts: true }
 */
export type PrismaSimpleInclude<TModel extends PrismaModelName, TKeys extends PrismaIncludeKeys<TModel>> = {
    [K in TKeys]: true;
};

/**
 * Extrae el tipo de retorno de una consulta Prisma con include.
 * Útil para tipar resultados de queries que incluyen relaciones.
 *
 * @template TModel - Nombre del modelo Prisma
 * @template TInclude - Configuración de include
 *
 * @example
 * const include = { addresses: true, contacts: true } satisfies PrismaIncludeConfig<'customer'>;
 * type CustomerWithRelations = PrismaResultWithInclude<'customer', typeof include>;
 */
export type PrismaResultWithInclude<
    TModel extends PrismaModelName,
    TInclude extends PrismaInclude<TModel>,
> = Prisma.Result<PrismaModelDelegate<TModel>, { include: TInclude }, 'findFirst'>;

// ============================================================================
// TIPOS DE UTILIDAD PARA WHERE/ORDERBY - Para uso interno en repositorios
// ============================================================================

/**
 * Extrae el tipo WhereInput de Prisma para un modelo.
 * Usar solo en la capa de infraestructura (repositorios).
 *
 * @template TModel - Nombre del modelo Prisma
 *
 * @example
 * // En CustomerRepository
 * type CustomerWhere = PrismaWhereInput<'customer'>;
 * // Equivale a: Prisma.CustomerWhereInput
 *
 * const where: CustomerWhere = {
 *   name: { contains: 'Juan', mode: 'insensitive' },
 *   isActive: true,
 * };
 */
export type PrismaWhereInput<TModel extends PrismaModelName> = PrismaFindFirstArgs<TModel> extends { where?: infer W }
    ? NonNullable<W>
    : never;

/**
 * Extrae el tipo OrderByInput de Prisma para un modelo.
 * Usar solo en la capa de infraestructura (repositorios).
 *
 * @template TModel - Nombre del modelo Prisma
 *
 * @example
 * // En CustomerRepository
 * type CustomerOrderBy = PrismaOrderByInput<'customer'>;
 * // Equivale a: Prisma.CustomerOrderByWithRelationInput
 *
 * const orderBy: CustomerOrderBy = { createdAt: 'desc' };
 */
export type PrismaOrderByInput<TModel extends PrismaModelName> = PrismaFindFirstArgs<TModel> extends {
    orderBy?: infer O;
}
    ? NonNullable<O>
    : never;

/**
 * Extrae el tipo SelectInput de Prisma para un modelo.
 * Usar solo en la capa de infraestructura (repositorios).
 *
 * @template TModel - Nombre del modelo Prisma
 *
 * @example
 * // En CustomerRepository
 * type CustomerSelect = PrismaSelectInput<'customer'>;
 *
 * const select: CustomerSelect = {
 *   id: true,
 *   name: true,
 *   email: true,
 * };
 */
export type PrismaSelectInput<TModel extends PrismaModelName> = PrismaFindFirstArgs<TModel> extends { select?: infer S }
    ? NonNullable<S>
    : never;

/**
 * Extrae los campos escalares de un modelo.
 * @example PrismaScalarFields<'contact'> = 'name' | 'email' | 'customerId' | ...
 */
export type PrismaScalarFields<TModel extends PrismaModelName> = keyof PrismaPayload<TModel>['scalars'];

/**
 * Extrae todos los campos del modelo: escalares + relaciones.
 * Útil cuando se necesita una vista unificada de todas las propiedades disponibles.
 * @example PrismaAllFields<'customer'> = 'id' | 'name' | ... | 'addresses' | 'contacts'
 */
export type PrismaAllFields<TModel extends PrismaModelName> = PrismaScalarFields<TModel> | PrismaRelationNames<TModel>;

/**
 * Garantiza que los campos declarados en un tipo de entidad existan en el modelo de Prisma indicado.
 * Permite excluir propiedades comunes (ej: campos base o virtuales) mediante el tercer genérico.
 *
 * @example
 * type _EnsureCustomer = EnsurePrismaModelFields<CustomerType, 'customer', keyof BaseEntityType>;
 */
export type EnsurePrismaModelFields<
    TEntity,
    TModel extends PrismaModelName,
    TOmit extends keyof TEntity = never,
> = Exclude<Extract<keyof Omit<TEntity, TOmit>, string>, PrismaAllFields<TModel>> extends never
    ? true
    : [
          'EnsurePrismaModelFields violation: no estan presentes todos los campos del modelo de Prisma',
          Exclude<Extract<keyof Omit<TEntity, TOmit>, string>, PrismaAllFields<TModel>>,
      ];

/**
 * Helper para elevar errores de tipos que deberían evaluar a `true`.
 * Si el tipo recibido no extiende `true`, TypeScript arrojará el mensaje original.
 */
export type AssertTrue<T extends true> = T;

type EnsurePrismaCoverage<
    TEntity,
    TModel extends PrismaModelName,
    TMissingAllowed extends PrismaAllFields<TModel> = never,
> = Exclude<Exclude<PrismaAllFields<TModel>, TMissingAllowed>, Extract<keyof TEntity, string>> extends never
    ? true
    : [
          'EnsurePrismaModelFieldsStrict violation: faltan campos del modelo de Prisma en la entidad',
          Exclude<Exclude<PrismaAllFields<TModel>, TMissingAllowed>, Extract<keyof TEntity, string>>,
      ];

/**
 * Variante "blacklist": obliga a exponer todos los campos del modelo Prisma
 * salvo aquellos listados explícitamente en TMissingAllowed.
 * Además mantiene la verificación de campos extra mediante TOmit.
 *
 * @template TEntity - Tipo de la entidad de dominio que se está validando
 * @template TModel - Nombre del modelo de Prisma contra el cual se valida
 * @template TOmit - Claves de TEntity que deben ignorarse en la validación (ej: campos de clase base)
 * @template TMissingAllowed - Campos del modelo Prisma que se permite omitir en la entidad
 *
 * @example
 * type _EnsureCustomer = EnsurePrismaModelFieldsStrict<
 *   CustomerType,
 *   'customer',
 *   keyof BaseEntityType,
 *   'legalEntity' | 'contacts'
 * >;
 */
export type EnsurePrismaModelFieldsStrict<
    TEntity,
    TModel extends PrismaModelName,
    TOmit extends keyof TEntity = never,
    TMissingAllowed extends PrismaAllFields<TModel> = never,
> = EnsurePrismaModelFields<TEntity, TModel, TOmit> extends true
    ? EnsurePrismaCoverage<TEntity, TModel, TMissingAllowed>
    : EnsurePrismaModelFields<TEntity, TModel, TOmit>;

/**
 * Extrae campos que terminan en 'Id' (foreign keys) de un modelo.
 * @example PrismaForeignKeys<'contact'> = 'customerId' | 'supplierId' | 'workshopId'
 */
export type PrismaForeignKeys<TModel extends PrismaModelName> = {
    [K in PrismaScalarFields<TModel>]: K extends `${string}Id` ? K : never;
}[PrismaScalarFields<TModel>];

/**
 * Verifica si un modelo tiene una FK específica.
 * @example HasForeignKey<'contact', 'customerId'> = true
 * @example HasForeignKey<'user', 'customerId'> = false
 */
export type HasForeignKey<
    TModel extends PrismaModelName,
    TForeignKey extends string,
> = TForeignKey extends PrismaForeignKeys<TModel> ? true : false;

/**
 * Filtra modelos que tienen una FK específica.
 * Devuelve el modelo si tiene la FK, o never si no la tiene.
 * @example FilterModelsByForeignKey<'contact', 'customerId'> = 'contact'
 * @example FilterModelsByForeignKey<'user', 'customerId'> = never
 */
export type FilterModelsByForeignKey<TModel extends PrismaModelName, TForeignKey extends string> = HasForeignKey<
    TModel,
    TForeignKey
> extends true
    ? TModel
    : never;

/**
 * Extrae todos los modelos que tienen una FK específica.
 * Itera sobre todos los modelos de Prisma y filtra los que tienen la FK.
 *
 * @template TForeignKey - Nombre de la foreign key (ej: 'customerId')
 *
 * @example
 * // Obtener todos los modelos que tienen customerId
 * type CustomerChildren = ModelsWithForeignKey<'customerId'>;
 * // Resulta en: 'contact' | 'address' | ... (todos los modelos con customerId)
 */
export type ModelsWithForeignKey<TForeignKey extends string> = {
    [M in PrismaModelName]: FilterModelsByForeignKey<M, TForeignKey>;
}[PrismaModelName];

/**
 * Configuración base de relación para cascada (sin restricciones de tipo).
 * Usada internamente por la clase base del repositorio.
 */
export type BaseCascadeRelationConfig = {
    /** Nombre del modelo hijo en Prisma (minúscula) */
    model: PrismaModelName;
    /** Foreign key en el modelo hijo que apunta al padre */
    foreignKey: string;
};

/**
 * Configuración de relación para cascada con tipado fuerte.
 * Usar en repositorios concretos para obtener validación de tipos.
 *
 * @template TChildModel - Nombre del modelo hijo (ej: 'contact')
 *
 * @example
 * // En CustomerRepository
 * type CustomerChildModels = 'contact' | 'address';
 *
 * getCascadeRelations(): CascadeRelationConfig<CustomerChildModels>[] {
 *   return [
 *     { model: 'contact', foreignKey: 'customerId' }, // ✅ TypeScript valida que customerId existe en Contact
 *     { model: 'address', foreignKey: 'customerId' }, // ✅ TypeScript valida que customerId existe en Address
 *     { model: 'contact', foreignKey: 'invalidKey' }, // ❌ Error de compilación
 *   ];
 * }
 */
export type CascadeRelationConfig<TChildModel extends PrismaModelName> = {
    /** Nombre del modelo hijo en Prisma (minúscula) */
    model: TChildModel;
    /** Foreign key en el modelo hijo que apunta al padre (tipado según el modelo) */
    foreignKey: PrismaForeignKeys<TChildModel>;
};

/**
 * Configuración para eliminación/desactivación en cascada programática.
 * Se utiliza cuando se hace soft-delete y se necesita propagar la desactivación
 * a entidades relacionadas (ya que onDelete: Cascade de Prisma solo funciona con DELETE real).
 *
 * @template TParentModel - Modelo padre para validar relaciones
 */
export type SoftDeleteCascadeConfig<TParentModel extends PrismaModelName = PrismaModelName> = {
    /**
     * Nombres de las relaciones a desactivar en cascada.
     * Deben coincidir con las propiedades de relación de la entidad.
     * @example ['contacts', 'addresses'] para Customer
     */
    relations: TParentModel extends PrismaModelName ? PrismaRelationNames<TParentModel>[] : string[];
    /**
     * Si es true, también reactiva las relaciones cuando isActive = true.
     * Por defecto es false (solo aplica cascada en desactivación).
     */
    cascadeOnReactivation?: boolean;
};

/**
 * Parámetros para el método toggleIsActive con soporte de cascada.
 * @template TParentModel - Modelo padre para validación de relaciones tipadas
 */
export type ToggleIsActiveParams<TParentModel extends PrismaModelName = PrismaModelName> = {
    /** ID de la entidad a modificar */
    id: string;
    /** Nuevo estado de activación */
    isActive: boolean;
    /** Estrategia de eliminación: 'soft' (default) o 'hard' */
    strategy?: DeactivationStrategy;
    /** Configuración de cascada para soft-delete */
    cascade?: SoftDeleteCascadeConfig<TParentModel>;
    /** Si es true, omite las restricciones antes de desactivar en soft-delete, solo se deben escoger las relaciones con modelos padres,
     *  no con los hijos porque para ellos se usa las configuraciones cascade */
    softDeleteSkippedRestrictions?: PrismaRelationNames<TParentModel>[];
};

// ============================================================================
// TIPOS DE RESTRICCIONES DE DESACTIVACIÓN - Validación antes de desactivar
// ============================================================================

/**
 * Extrae el tipo del modelo relacionado a partir del nombre de la relación.
 * Utiliza el payload de Prisma para obtener el tipo de la entidad relacionada.
 *
 * @template TModel - Nombre del modelo padre
 * @template TRelation - Nombre de la relación
 *
 * @example
 * // Para Customer que tiene relación 'contacts' apuntando a Contact[]
 * type ContactModel = PrismaRelatedModel<'customer', 'contacts'>;
 * // Resulta en: 'contact' (lowercase del modelo relacionado)
 */
export type PrismaRelatedModelPayload<
    TModel extends PrismaModelName,
    TRelation extends PrismaRelationNames<TModel>,
> = PrismaPayload<TModel>['objects'][TRelation];

/**
 * Extrae el nombre del modelo relacionado desde el payload de la relación.
 * El payload contiene la propiedad 'name' que es el nombre del modelo en PascalCase.
 */
type ExtractModelName<TPayload> = TPayload extends {
    name: infer N extends string;
}
    ? Lowercase<N>
    : never;

/**
 * Obtiene el nombre del modelo relacionado (lowercase) desde una relación.
 *
 * @template TModel - Nombre del modelo padre
 * @template TRelation - Nombre de la relación
 *
 * @example
 * type RelatedModel = PrismaRelatedModelName<'customer', 'contacts'>;
 * // Resulta en: 'contact'
 */
export type PrismaRelatedModelName<
    TModel extends PrismaModelName,
    TRelation extends PrismaRelationNames<TModel>,
> = ExtractModelName<PrismaRelatedModelPayload<TModel, TRelation>> extends PrismaModelName
    ? ExtractModelName<PrismaRelatedModelPayload<TModel, TRelation>>
    : never;

/**
 * Extrae el WhereInput del modelo relacionado usando el ListRelationFilter de Prisma.
 * Prisma genera tipos como `QuotationListRelationFilter` que contienen `some`, `every`, `none`
 * con el WhereInput del modelo relacionado.
 *
 * @template TModel - Nombre del modelo padre
 * @template TRelation - Nombre de la relación
 */
type ExtractRelationWhereInput<
    TModel extends PrismaModelName,
    TRelation extends PrismaRelationNames<TModel>,
> = PrismaWhereInput<TModel>[TRelation] extends { some?: infer W } ? NonNullable<W> : Record<string, unknown>;

/**
 * Tipo para la condición `some` de una relación en Prisma.
 * Extrae el WhereInput directamente del ListRelationFilter de la relación.
 * Esto garantiza autocompletado correcto ya que usa los tipos generados por Prisma.
 *
 * @template TModel - Nombre del modelo padre
 * @template TRelation - Nombre de la relación a filtrar
 *
 * @example
 * type QuotationCondition = PrismaSomeCondition<'customer', 'quotations'>;
 * // Resulta en: QuotationWhereInput (con autocompletado completo)
 *
 * const condition: QuotationCondition = { isActive: true, status: 'PENDING' };
 */
export type PrismaSomeCondition<
    TModel extends PrismaModelName,
    TRelation extends PrismaRelationNames<TModel>,
> = ExtractRelationWhereInput<TModel, TRelation>;

/**
 * Configuración de una restricción de desactivación individual.
 * Define una relación que debe verificarse antes de permitir la desactivación.
 *
 * @template TModel - Nombre del modelo Prisma padre
 * @template TRelation - Nombre de la relación a verificar (opcional para inferencia)
 *
 * @example
 * // Restricción simple: no desactivar si hay ventas activas
 * const restriction: DeactivationRestriction<'customer', 'sellings'> = {
 *   relation: 'sellings',
 *   condition: { isActive: true },
 *   message: 'El cliente tiene ventas activas',
 * };
 *
 * // Restricción con condición compleja
 * const restriction2: DeactivationRestriction<'customer', 'rentings'> = {
 *   relation: 'rentings',
 *   condition: { isActive: true, status: 'PENDING' },
 *   message: 'El cliente tiene alquileres pendientes activos',
 * };
 */
export type DeactivationRestriction<
    TModel extends PrismaModelName,
    TRelation extends PrismaRelationNames<TModel> = PrismaRelationNames<TModel>,
> = {
    /**
     * Nombre de la relación a verificar (type-safe según el modelo).
     * Debe ser una relación válida definida en el schema de Prisma.
     */
    relation: TRelation;
    /**
     * Condición para el filtro `some` de Prisma (para relaciones 1:many)
     * o filtro directo (para relaciones 1:1 cuando isSingleRelation = true).
     * Representa qué registros relacionados bloquean la desactivación.
     * Por defecto se usa { isActive: true } si no se especifica.
     *
     * @example
     * // Bloquear si hay registros activos
     * condition: { isActive: true }
     *
     * // Bloquear si hay registros activos con estado específico
     * condition: { isActive: true, status: 'PENDING' }
     */
    condition?: PrismaSomeCondition<TModel, TRelation>;
    /**
     * Si es true, indica que la relación es 1:1 (ej: purchaseOrder en Quotation).
     * Para relaciones 1:1, Prisma no usa `some`, sino que aplica la condición directamente.
     * Por defecto es false (relación 1:many con operador `some`).
     */
    isSingleRelation?: boolean;
    /**
     * Mensaje de error personalizado que se mostrará cuando
     * la restricción impida la desactivación.
     */
    message: string;
};

/**
 * Array de restricciones de desactivación para un modelo.
 * Usar con satisfies para obtener autocompletado type-safe.
 *
 * @template TModel - Nombre del modelo Prisma
 *
 * @example
 * const customerRestrictions = [
 *   { relation: 'sellings', condition: { isActive: true }, message: 'Tiene ventas activas' },
 *   { relation: 'rentings', condition: { isActive: true }, message: 'Tiene alquileres activos' },
 * ] satisfies DeactivationRestrictions<'customer'>;
 */
export type DeactivationRestrictions<TModel extends PrismaModelName> = Array<
    DeactivationRestriction<TModel, PrismaRelationNames<TModel>>
>;

/**
 * Helper function para crear una restricción de desactivación con autocompletado completo.
 * Infiere el tipo de la relación para dar autocompletado en `condition`.
 *
 * @template TModel - Nombre del modelo Prisma padre
 * @template TRelation - Nombre de la relación (inferido automáticamente)
 *
 * @example
 * // ✅ Con autocompletado completo para `condition`
 * const restriction = createDeactivationRestriction<'customer'>()({
 *   relation: 'quotations',      // Autocompletado de relaciones de Customer
 *   condition: { isActive: true }, // Autocompletado de campos de Quotation
 *   message: 'El cliente tiene cotizaciones activas',
 * });
 *
 * // Usar en array
 * const customerRestrictions = [
 *   createDeactivationRestriction<'customer'>()({
 *     relation: 'quotations',
 *     condition: { isActive: true, status: 'PENDING' }, // ✅ Autocomplete de QuotationWhereInput
 *     message: 'Tiene cotizaciones pendientes',
 *   }),
 *   createDeactivationRestriction<'customer'>()({
 *     relation: 'accountsReceivable',
 *     condition: { isActive: true }, // ✅ Autocomplete de AccountReceivableWhereInput
 *     message: 'Tiene cuentas por cobrar',
 *   }),
 * ];
 */
export const createDeactivationRestriction =
    <TModel extends PrismaModelName>() =>
    <TRelation extends PrismaRelationNames<TModel>>(
        restriction: DeactivationRestriction<TModel, TRelation>,
    ): DeactivationRestriction<TModel, TRelation> =>
        restriction;

/**
 * Helper function para crear múltiples restricciones con autocompletado.
 * Alternativa más concisa cuando se crean varias restricciones.
 *
 * @template TModel - Nombre del modelo Prisma padre
 *
 * @example
 * const customerRestrictions = buildDeactivationRestrictions<'customer'>(
 *   { relation: 'quotations', condition: { isActive: true }, message: 'Tiene cotizaciones' },
 *   { relation: 'accountsReceivable', condition: { isActive: true }, message: 'Tiene cuentas por cobrar' },
 * );
 */
export const buildDeactivationRestrictions = <TModel extends PrismaModelName>(
    ...restrictions: Array<DeactivationRestriction<TModel, PrismaRelationNames<TModel>>>
): DeactivationRestrictions<TModel> => restrictions;

/**
 * Resultado de la validación de restricciones de desactivación.
 * Contiene información sobre qué restricciones fueron violadas.
 */
export type DeactivationValidationResult = {
    /** Indica si la desactivación está permitida */
    canDeactivate: boolean;
    /** Mensajes de error de las restricciones violadas */
    violations: string[];
    /** Relaciones que tienen registros que bloquean la desactivación */
    blockedBy: string[];
};

/**
 * Parámetros para el método de validación de restricciones de desactivación.
 *
 * @template TModel - Nombre del modelo Prisma
 */
export type ValidateDeactivationParams<TModel extends PrismaModelName> = {
    /** ID de la entidad a validar */
    id: string;
    /** Restricciones a verificar */
    restrictions: DeactivationRestrictions<TModel>;
    /** Cliente Prisma (para soporte de transacciones) */
    client: PrismaClient;
    /** Si es true, omite las restricciones antes de desactivar en soft-delete */
    softDeleteSkippedRestrictions?: PrismaRelationNames<TModel>[];
};

export interface IBaseRepository<T> {
    /**
     * Recupera una entidad específica mediante su identificador único
     * @param id Identificador único de la entidad que se desea encontrar
     * @returns La entidad solicitada o undefined si no se encuentra
     */
    findById<V = T>(id: string): Promise<V | undefined>;

    /**
     * Obtiene una colección de entidades que cumplen con criterios específicos
     * @param params Parámetros de consulta incluyendo filtros, ordenamiento y opciones de inclusión/exclusión
     * @returns Arreglo con las entidades que coinciden con los criterios especificados
     */
    findMany<V = T>(params?: FindManyParams<V>): Promise<V[]>;

    /**
     * Determina la cantidad total de registros que cumplen con los criterios de filtrado
     * @param params Objeto con criterios de filtrado para el conteo
     * @returns Número total de registros que cumplen con los criterios
     */
    count(params?: { byField?: FilterOptions<T> }): Promise<number>;

    /**
     * Recupera un conjunto de entidades con soporte para paginación y criterios de filtrado
     * @template V - Tipo de dato para el resultado, por defecto utiliza T
     * @param params Parámetros para configurar la paginación, filtros y ordenamiento
     * @returns Estructura con los datos paginados y metadatos de navegación
     */
    findManyPaginated<V = T>(params?: {
        pagination?: PaginationParams;
        filterOptions?: FilterOptions<T>;
        sortOptions?: SortOptions<T>;
    }): Promise<PaginatedResult<V>>;

    /**
     * Persiste una nueva entidad en el almacenamiento de datos
     * @param entity Datos de la entidad que se va a crear
     * @returns La entidad creada con sus datos actualizados tras la persistencia
     */
    create<V = T, W = T>(entity: V): Promise<W>;

    /**
     * Modifica los datos de una entidad existente
     * @param params Objeto con el identificador de la entidad y los datos a actualizar
     * @returns La entidad con sus datos actualizados
     */
    update<V = T, W = T>(params: { id: string; entity: Partial<V> }): Promise<W>;

    /**
     * Actualiza múltiples entidades simultáneamente
     * @param params Objeto con los identificadores de las entidades y los datos comunes a actualizar
     * @returns Colección de entidades actualizadas
     */
    updateMany<V = T, W = T>(params: { ids: string[]; entity: Partial<V> }): Promise<W[]>;

    /**
     * Restaura el estado activo de una entidad previamente desactivada
     * @param id Identificador único de la entidad a reactivar
     * @returns La entidad reactivada con su estado actualizado
     */
    reactivate(id: string): Promise<T>;

    /**
     * Reactiva múltiples entidades en una sola operación
     * @param params Objeto con los identificadores de las entidades a reactivar
     * @returns Colección de entidades reactivadas
     */
    reactivateMany(params: { ids: string[] }): Promise<T[]>;

    /**
     * Marca una entidad como eliminada o la elimina físicamente del sistema
     * @param id Identificador único de la entidad a eliminar
     * @returns La entidad eliminada o información del resultado de la operación
     */
    delete(id: string): Promise<T>;

    /**
     * Elimina múltiples entidades en una sola operación
     * @param params Objeto con los identificadores de las entidades a eliminar
     * @returns Colección de entidades eliminadas o información del resultado
     */
    deleteMany(params: { ids: string[] }): Promise<T[]>;

    /**
     * Desactiva o activa una entidad
     * @param id Identificador único de la entidad a desactivar
     * @returns La entidad desactivada o activada
     */
    deactivateToggle(id: string, isActive: boolean): Promise<T>;

    /**
     * Desactiva o activa múltiples entidades en una sola operación
     * @param params Objeto con los identificadores de las entidades a desactivar
     * @returns Colección de entidades desactivadas o activadas
     */
    deactivateToggleMany(params: { ids: string[]; isActive: boolean }): Promise<T[]>;

    /**
     * Busca entidades que contengan coincidencias parciales en un campo específico
     * @param param Objeto que especifica el campo de búsqueda y el valor a buscar
     * @returns Colección de entidades que coinciden con el criterio de búsqueda
     */
    searchByFieldCoincidence<V = T>(param: SearchByField<V>): Promise<V[]>;
}

export interface IBaseSimpleRepository<T, TModelName extends PrismaModelName = PrismaModelName> {
    /**
     * Obtiene una colección de entidades que cumplen con criterios específicos
     * @param params Parámetros de consulta incluyendo filtros, ordenamiento y opciones de inclusión/exclusión
     * @returns Arreglo con las entidades que coinciden con los criterios especificados
     */
    findMany<V = T>(params?: FindManyParams<V>): Promise<V[]>;

    /**
     * Recupera una entidad específica mediante su identificador único
     * @param id Identificador único de la entidad que se desea encontrar
     * @returns La entidad solicitada o undefined si no se encuentra
     */
    findById<V = T>(id: string): Promise<V | undefined>;

    /**
     * Persiste una nueva entidad en el almacenamiento de datos
     * @param entity Datos de la entidad que se va a crear
     * @returns La entidad creada con sus datos actualizados tras la persistencia
     */
    create<V = T, W = T>(entity: V): Promise<W>;

    /**
     * Recupera un conjunto de entidades con soporte para paginación y criterios de filtrado
     * @template V - Tipo de dato para el resultado, por defecto utiliza T
     * @param params Parámetros para configurar la paginación, filtros y ordenamiento
     * @returns Estructura con los datos paginados y metadatos de navegación
     */
    findManyPaginated<V = T>(params?: FindManyPaginatedParams<T>): Promise<PaginatedResult<V>>;

    /**
     * Modifica los datos de una entidad existente
     * @param params Objeto con el identificador de la entidad y los datos a actualizar
     * internamente se debe usar el metodo to Prisma del mapper
     * @returns La entidad con sus datos actualizados
     */
    update<V = T, W = T>(params: { id: string; entity: V }): Promise<W>;

    /**
     * Alterna el estado activo/inactivo de una entidad con soporte para cascada programática.
     * Cuando isActive = false, actúa como soft-delete y puede propagar la desactivación en cascada.
     * @param params Parámetros incluyendo id, isActive, estrategia y configuración de cascada
     * @returns La entidad con su estado actualizado
     */
    toggleIsActive<V = T>(params: ToggleIsActiveParams<TModelName>): Promise<V>;
}

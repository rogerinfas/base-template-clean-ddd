/**
 * Calcula el índice inicial para la paginación basado en la página actual y el tamaño de página.
 *
 * @param options - Opciones de paginación
 * @param options.page - Número de página actual (comenzando desde 1)
 * @param options.pageSize - Cantidad de elementos por página
 * @returns El índice inicial para la consulta paginada (offset)
 *
 * @example
 * // Retorna 0 (primeros elementos)
 * paginationStart({ page: 1, pageSize: 10 });
 *
 * @example
 * // Retorna 10 (elementos del 11 al 20)
 * paginationStart({ page: 2, pageSize: 10 });
 */
export function paginationStart({ page, pageSize }: { page: number; pageSize: number }): number {
    return (page - 1) * pageSize;
}

/**
 * Calcula el número total de páginas basado en el total de elementos y el tamaño de página.
 *
 * @param {Object} options - Opciones para el cálculo
 * @param {number} options.total - Número total de elementos
 * @param {number} options.pageSize - Número de elementos por página
 * @returns {number} El número total de páginas redondeado hacia arriba
 */
export function calcTotalPages({ total, pageSize }: { total: number; pageSize: number }): number {
    return Math.ceil(total / pageSize);
}

/**
 * Determina si existe una página siguiente basándose en la página actual y el número total de páginas.
 *
 * @param {Object} params - Parámetros de la función
 * @param {number} params.page - El número de la página actual
 * @param {number} params.totalPages - El número total de páginas disponibles
 * @returns {boolean} - `true` si hay una página siguiente disponible, `false` en caso contrario
 *
 * @example
 * // Retorna true porque la página 2 es menor que el total de 5 páginas
 * hasNextPage({ page: 2, totalPages: 5 });
 *
 * @example
 * // Retorna false porque la página 5 no es menor que el total de 5 páginas
 * hasNextPage({ page: 5, totalPages: 5 });
 */
export function hasNextPage({ page, totalPages }: { page: number; totalPages: number }): boolean {
    return page < totalPages;
}

/**
 * Determina si existe una página anterior en función del número de página actual.
 *
 * @param {object} params - Los parámetros de la función.
 * @param {number} params.page - El número de página actual.
 * @returns {boolean} - Retorna `true` si existe una página anterior (es decir, si la página actual es mayor que 1), de lo contrario `false`.
 *
 * @example
 * const result = hasPreviousPage({ page: 2 }); // Retorna true
 * const result2 = hasPreviousPage({ page: 1 }); // Retorna false
 */
export function hasPreviousPage({ page }: { page: number }): boolean {
    return page > 1;
}

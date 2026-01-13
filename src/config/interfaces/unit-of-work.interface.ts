/**
 * Interfaz simple para transacciones independientes del ORM
 */
export interface IUnitOfWork {
    /**
     * Ejecuta una función dentro de una transacción
     * Los casos de uso funcionan normalmente, los repositorios automáticamente usan la transacción
     * @param fn Función a ejecutar dentro de la transacción
     * @returns El resultado de la función ejecutada
     */
    executeInTransaction<T>(fn: () => Promise<T>): Promise<T>;
}

/**
 * Token de inyección de dependencias para el Unit of Work
 */
export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

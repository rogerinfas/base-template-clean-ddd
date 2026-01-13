/**
 * Normaliza una fecha al primer día del mes a las 00:00:00
 * Útil para campos que solo requieren mes y año
 *
 * @param date - Fecha a normalizar
 * @returns Fecha normalizada al primer día del mes
 *
 * @example
 * normalizeToFirstDayOfMonth(new Date('2024-03-15'))
 * // Returns: new Date('2024-03-01T00:00:00.000Z')
 */
export function normalizeToFirstDayOfMonth(date: Date | string | number): Date {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        throw new Error('Fecha inválida');
    }

    // Crear nueva fecha con el mismo año y mes, pero día 1 a las 00:00:00
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Transformador para class-transformer que normaliza fechas al primer día del mes
 * Útil para campos que solo requieren mes y año
 *
 * @example
 * @Transform(normalizeMonthYearTransform)
 * registrationDate: Date;
 */
export function normalizeMonthYearTransform({
    value,
}: {
    value: Date | string | number | null | undefined;
}): Date | null {
    if (!value) {
        return null;
    }

    try {
        return normalizeToFirstDayOfMonth(value);
    } catch {
        return null;
    }
}

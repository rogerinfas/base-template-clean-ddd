/**
 * Transformador para class-transformer que ajusta fechas agregando 5 horas
 * para compensar la zona horaria de Perú (UTC-5).
 *
 * Útil para campos de fecha como birthday que deben guardarse con la hora correcta
 * para evitar problemas de desplazamiento de fecha cuando se muestran en el frontend.
 *
 * @example
 * ```typescript
 * class WorkerDto {
 *     @Transform(peruTimezoneBirthdayTransform)
 *     @IsOptional()
 *     @IsDate()
 *     birthday?: Date;
 * }
 * ```
 */
export function peruTimezoneBirthdayTransform({
    value,
}: {
    value: Date | string | number | null | undefined;
}): Date | null | undefined {
    if (!value) {
        return value as null | undefined;
    }

    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return null;
        }

        // Agregar 5 horas (18000000 milisegundos) para compensar UTC-5
        const adjustedDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
        return adjustedDate;
    } catch {
        return null;
    }
}

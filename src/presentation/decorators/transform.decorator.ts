import { Transform } from 'class-transformer';

/**
 * Salta validación si el valor está en blanco (undefined, null, o string vacío)
 * Útil para campos opcionales que solo deben validarse si tienen contenido
 */
export function SkipIfBlank() {
    return Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        return value;
    });
}

/**
 * Transforma strings a booleanos.
 * Útil para campos que deben ser booleanos, especialmente en query parameters.
 *
 * IMPORTANTE: Este decorador debe usarse SIN @Type(() => Boolean) ya que
 * enableImplicitConversion convierte cualquier string no vacío a true.
 *
 * @example
 * ```typescript
 * class CreateUserDto {
 *     @TransformStringToBoolean()
 *     @IsBoolean()
 *     isActive: boolean; // 'true' -> true, 'false' -> false
 * }
 * ```
 */
export function TransformStringToBoolean() {
    return Transform(
        ({ value, obj, key }: { value: unknown; obj: Record<string, unknown>; key: string }) => {
            // Usar el valor original del objeto para evitar conversiones previas
            const originalValue = obj[key];

            if (typeof originalValue === 'boolean') return originalValue;
            if (typeof originalValue === 'string') {
                const normalized = originalValue.toLowerCase().trim();
                if (normalized === 'true' || normalized === '1') return true;
                if (normalized === 'false' || normalized === '0') return false;
                return undefined;
            }
            // Si ya es boolean (por body JSON), devolverlo tal cual
            if (typeof value === 'boolean') return value;
            return undefined;
        },
        { toClassOnly: true },
    );
}

/**
 * Transforma strings a arrays.
 * Útil para query parameters que pueden venir como string único o como array.
 * Maneja casos donde el frontend envía un solo valor como string o múltiples valores separados por comas.
 *
 * @param separator - Separador para dividir strings (por defecto: ',')
 *
 * @example
 * ```typescript
 * class PaginatedRequest {
 *     @TransformStringToArray()
 *     @IsArray()
 *     @IsUUID('4', { each: true })
 *     ids?: string[]; // 'id1' -> ['id1'], 'id1,id2' -> ['id1', 'id2'], ['id1'] -> ['id1']
 * }
 * ```
 */
export function TransformStringToArray(separator: string = ',') {
    return Transform(({ value }) => {
        // Si ya es un array, devolverlo tal cual
        if (Array.isArray(value)) {
            return value;
        }
        // Si es un string
        if (typeof value === 'string') {
            // Si contiene el separador, dividir por el separador
            if (value.includes(separator)) {
                return value
                    .split(separator)
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
            }
            // Si es un string simple, devolverlo como array con un elemento
            return [value];
        }
        // Si es undefined o null, devolver undefined
        return undefined;
    });
}


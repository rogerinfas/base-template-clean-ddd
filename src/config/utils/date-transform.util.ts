import { BadRequestException } from '@nestjs/common';

/**
 * Crea un transformador de fechas para class-transformer que valida requerimiento y formato.
 */
export function createDateTransform(requiredMsg: string, invalidMsg: string) {
    return ({ value }: { value: string | number | Date | null | undefined }) => {
        if (!value) throw new BadRequestException(requiredMsg);
        if (typeof value === 'string' || typeof value === 'number') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new BadRequestException(invalidMsg);
            }
            return date;
        }
        return value;
    };
}

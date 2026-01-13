/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class BaseFindRequestDto {
    @ApiProperty({
        description: 'Search by Id',
        required: false,
        type: String,
    })
    @IsOptional()
    @IsString()
    @IsUUID('all', {
        message: 'El ID debe ser un UUID válido',
    })
    id?!: string;

    @ApiProperty({
        description: 'Search by Ids',
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            // Si ya es un array, devolverlo tal como está
            if (Array.isArray(value)) {
                return value;
            }

            // Si es un string vacío, devolver array vacío
            if (value.trim() === '') {
                return [];
            }

            // Si parece ser un array JSON, intentar parsearlo
            if (value.trim().startsWith('[') && value.trim().endsWith(']')) {
                try {
                    // Limpiar y normalizar el string antes de parsear
                    let cleanValue = value.trim();

                    // Manejar casos donde hay comillas dobles escapadas incorrectamente
                    cleanValue = cleanValue.replace(/\\"/g, '"');

                    // Intentar parsear el JSON
                    const parsed = JSON.parse(cleanValue);
                    return Array.isArray(parsed) ? parsed : [cleanValue];
                } catch {
                    // Si falla el parseo, intentar dividir por comas y limpiar
                    try {
                        const withoutBrackets = value.trim().slice(1, -1);
                        if (withoutBrackets.trim() === '') {
                            return [];
                        }

                        // Dividir por comas y limpiar cada elemento
                        const elements = withoutBrackets
                            .split(',')
                            .map((item) => {
                                let cleaned = item.trim();
                                // Remover comillas al inicio y final si existen
                                if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                                    cleaned = cleaned.slice(1, -1);
                                }
                                return cleaned;
                            })
                            .filter((item) => item.length > 0);

                        return elements;
                    } catch {
                        // Si todo falla, devolver el string original como array
                        return [value];
                    }
                }
            }

            // Si es un string simple, devolverlo como array con un elemento
            return [value];
        }
        // Si ya es un array, devolverlo tal como está
        return value;
    })
    ids?: string[];
}

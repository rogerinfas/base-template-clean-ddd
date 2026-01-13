import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO estándar para respuestas de error de la API
 */
export class ErrorResponseDto {
    @ApiProperty({
        description: 'Código de estado HTTP',
        example: 400,
    })
    statusCode! number;

    @ApiProperty({
        description: 'Mensaje de error',
        example: 'Datos de entrada inválidos',
    })
    message!: string | string[];

    @ApiProperty({
        description: 'Tipo de error',
        example: 'BadRequestException',
    })
    error! string;

    @ApiProperty({
        description: 'Timestamp cuando ocurrió el error',
        example: '2024-01-15T10:30:45.123Z',
    })
    timestamp! string;

    @ApiProperty({
        description: 'Ruta de la API donde ocurrió el error',
        example: '/api/v1/user',
    })
    path! string;

    @ApiPropertyOptional({
        description: 'Detalles adicionales del error (solo en desarrollo)',
        example: {
            stack: 'Error: Validation failed...',
            userId: 'anonymous',
        },
    })
    details?: Record<string, unknown>;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformStringToArray, TransformStringToBoolean } from '@presentation/decorators';
import { IsArray, IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class BaseDefaultFiltersDto {
    @ApiPropertyOptional({
        description: 'Filtrar por estado activo/inactivo',
        example: true,
        type: Boolean,
    })
    @TransformStringToBoolean()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description:
            'Fecha de inicio para filtrar por cualquier campo de fecha (ISO 8601). Genérico: cada controlador decide qué campo de fecha usar (createdAt, updatedAt, deliveryDate, etc.)',
        example: '2025-07-28T05:00:00.000Z',
    })
    @IsOptional()
    @IsDate()
    dateFrom?: Date;

    @IsOptional()
    @IsDate()
    @ApiPropertyOptional({
        description:
            'Fecha de fin para filtrar por cualquier campo de fecha (ISO 8601). Genérico: cada controlador decide qué campo de fecha usar (createdAt, updatedAt, deliveryDate, etc.)',
        example: '2025-08-03T04:59:59.999Z',
    })
    dateTo?: Date;

    @IsOptional()
    @TransformStringToArray()
    @IsArray({
        message: 'Los IDs preseleccionados deben ser un array',
    })
    @IsUUID('4', { each: true })
    @ApiPropertyOptional({
        description: 'IDs preseleccionados',
        example: ['550e8400-e29b-41d4-a716-446655440000'],
        type: [String],
    })
    preselectedIds?: string[];
}

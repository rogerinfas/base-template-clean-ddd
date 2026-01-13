import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransformStringToArray, TransformStringToBoolean } from '@presentation/decorators';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { BaseDefaultFiltersDto } from './base-default-filters-request.dto';

export class BasePaginatedRequestDto extends BaseDefaultFiltersDto {
    @ApiProperty({
        description: 'Page number',
        example: 1,
        minimum: 1,
        default: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page! number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    size! number;
}

export class BasePaginatedRequestDtoLegacy {
    @ApiProperty({
        description: 'Page number',
        example: 1,
        minimum: 1,
        default: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page! number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    size! number;

    @ApiPropertyOptional({
        description: 'Search',
        type: String,
        required: false,
    })
    @IsOptional()
    @Type(() => String)
    search?!: string;

    @IsOptional()
    @Transform(({ value }: { value: string }) => (value ? value === 'true' : undefined))
    @IsBoolean()
    isActive?!: string;

    @IsOptional()
    @TransformStringToBoolean()
    @IsBoolean()
    includeInactive?!: boolean;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({
        description:
            'Fecha de inicio para filtrar por cualquier campo de fecha (ISO 8601). Genérico: cada controlador decide qué campo de fecha usar (createdAt, updatedAt, deliveryDate, etc.)',
        example: '2024-01-01',
        type: String,
    })
    dateFrom?!: string;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({
        description:
            'Fecha de fin para filtrar por cualquier campo de fecha (ISO 8601). Genérico: cada controlador decide qué campo de fecha usar (createdAt, updatedAt, deliveryDate, etc.)',
        example: '2024-12-31',
        type: String,
    })
    dateTo?!: string;

    @IsOptional()
    @IsString({ each: true })
    @ApiPropertyOptional({
        description: 'IDs a excluir',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
    })
    @TransformStringToArray()
    @IsArray({
        message: 'Los IDs a excluir deben ser un array',
    })
    @IsUUID('4', { each: true })
    excludeIds?: string[];
}

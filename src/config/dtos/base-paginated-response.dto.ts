import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult, PaginationMetadata } from '@config/interfaces/base.interface.repository';

export abstract class PaginationMetadataDto implements PaginationMetadata {
    @ApiProperty({ type: Number, description: 'Total number of items' })
    total: number;

    @ApiProperty({ type: Number, description: 'Current page number' })
    page: number;

    @ApiProperty({ type: Number, description: 'Number of items per page' })
    pageSize: number;

    @ApiProperty({ type: Number, description: 'Total number of pages' })
    totalPages: number;

    @ApiProperty({ type: Boolean, description: 'Whether there is a next page' })
    hasNext: boolean;

    @ApiProperty({
        type: Boolean,
        description: 'Whether there is a previous page',
    })
    hasPrevious: boolean;
}

/**
 * Clase base para respuestas paginadas que implementa el resultado paginado.
 *
 * @template T - El tipo de los elementos de datos en la respuesta paginada
 *
 * @remarks
 * Al extender esta clase DTO, la propiedad `data` debe ser sobrescrita para
 * especificar el tipo correcto y la documentación apropiada de Swagger.
 *
 * @example
 * ```typescript
 * export class ProductPaginatedResponseDto extends BasePaginatedResponseDto<ProductDto> {
 *   @ApiProperty({ type: [ProductDto], description: 'Array of product items' })
 *   data: ProductDto[];
 * }
 * ```
 */
export abstract class BasePaginatedResponseDto<T> implements PaginatedResult<T> {
    @ApiProperty({ type: [Object], description: 'Array of data items' })
    data: T[];

    @ApiProperty({
        type: PaginationMetadataDto,
        description: 'Pagination metadata',
    })
    meta: PaginationMetadataDto;
}

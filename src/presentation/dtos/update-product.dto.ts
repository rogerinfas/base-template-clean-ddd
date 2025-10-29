import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para actualizar un producto
 * Todos los campos son opcionales
 */
export class UpdateProductDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser texto' })
    @MinLength(1, { message: 'El nombre debe tener al menos 1 carácter' })
    @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
    description?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El precio debe ser un número' })
    @Min(0, { message: 'El precio no puede ser negativo' })
    @Max(999999.99, { message: 'El precio excede el máximo permitido' })
    price?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El stock debe ser un número' })
    @Min(0, { message: 'El stock no puede ser negativo' })
    @Max(999999, { message: 'El stock excede el máximo permitido' })
    stock?: number;
}


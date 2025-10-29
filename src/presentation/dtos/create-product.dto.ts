import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para crear un producto
 */
export class CreateProductDto {
    @IsString({ message: 'El nombre debe ser texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MinLength(1, { message: 'El nombre debe tener al menos 1 carácter' })
    @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
    description?: string;

    @IsNumber({}, { message: 'El precio debe ser un número' })
    @Min(0, { message: 'El precio no puede ser negativo' })
    @Max(999999.99, { message: 'El precio excede el máximo permitido' })
    @IsNotEmpty({ message: 'El precio es requerido' })
    price!: number;

    @IsNumber({}, { message: 'El stock debe ser un número' })
    @Min(0, { message: 'El stock no puede ser negativo' })
    @Max(999999, { message: 'El stock excede el máximo permitido' })
    @IsNotEmpty({ message: 'El stock es requerido' })
    stock!: number;
}


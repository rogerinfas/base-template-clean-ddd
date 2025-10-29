import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

/**
 * DTO para crear un usuario
 * 
 * Usa class-validator para validación automática.
 */
export class CreateUserDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email!: string;

    @IsString({ message: 'La contraseña debe ser texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password!: string;

    @IsString({ message: 'El nombre debe ser texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    name!: string;
}


import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { DuplicateEntityException } from '@domain/exceptions/domain.exceptions';
import * as bcrypt from 'bcrypt';

/**
 * Command: CreateUser
 * 
 * Caso de uso para crear un nuevo usuario.
 * Sigue el patrón CQRS (Command).
 * 
 * Responsabilidades:
 * - Validar que el email no exista
 * - Hashear el password
 * - Crear la entidad User
 * - Persistir usando el repositorio
 */

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
}

@Injectable()
export class CreateUserCommand {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(dto: CreateUserDto): Promise<User> {
        // 1. Validar que el email no exista
        const emailExists = await this.userRepository.existsByEmail(dto.email);
        if (emailExists) {
            throw new DuplicateEntityException('User', 'email', dto.email);
        }

        // 2. Crear Value Object Email (con validación automática)
        const email = new Email(dto.email);

        // 3. Hashear password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 4. Crear entidad User
        const user = User.create({
            email,
            password: hashedPassword,
            name: dto.name,
        });

        // 5. Persistir
        return await this.userRepository.create(user);
    }
}


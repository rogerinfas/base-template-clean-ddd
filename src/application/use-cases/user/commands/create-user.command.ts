import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { IdDocumentType } from '@domain/value-objects/id-document-type.vo';
import { IdDocumentTypeEnum } from '@domain/types/id-document-types.type';
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import type { IUserRepository } from '@domain/repositories/user.repository.interface';
import { DuplicateEntityException } from '@domain/exceptions/domain.exceptions';

/**
 * Command: CreateUser
 * 
 * Caso de uso para crear un nuevo usuario.
 * Sigue el patrón CQRS (Command).
 * 
 * NOTA: Para crear usuarios con contraseña, usa Better Auth directamente:
 * auth.api.signUpEmail() - Better Auth maneja las contraseñas en el modelo Account
 * 
 * Este comando es para crear usuarios sin contraseña (útil para migraciones, seeds, etc.)
 */

export interface CreateUserDto {
    email: string;
    name: string;
    lastName: string;
    idDocumentType?: IdDocumentTypeEnum;
    idNumber: string;
    post: string;
    phone: string;
    address: string;
    isActive?: boolean;
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
        const idDocumentType = new IdDocumentType(dto.idDocumentType || IdDocumentTypeEnum.DNI);

        // 3. Crear entidad User
        const user = User.create({
            email,
            name: dto.name,
            lastName: dto.lastName,
            idDocumentType,
            idNumber: dto.idNumber,
            post: dto.post,
            phone: dto.phone,
            address: dto.address,
            emailVerified: false,
            isActive: dto.isActive ?? true,
        });

        // 4. Persistir
        return await this.userRepository.create(user);
    }
}


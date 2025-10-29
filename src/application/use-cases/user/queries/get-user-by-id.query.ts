import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { EntityNotFoundException } from '@domain/exceptions/domain.exceptions';

/**
 * Query: GetUserById
 * 
 * Caso de uso para obtener un usuario por ID.
 * Sigue el patrón CQRS (Query).
 * 
 * Las queries solo leen datos, no modifican el estado.
 */

@Injectable()
export class GetUserByIdQuery {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new EntityNotFoundException('User', id);
        }

        return user;
    }
}


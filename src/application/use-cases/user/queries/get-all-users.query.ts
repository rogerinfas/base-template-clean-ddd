import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';

/**
 * Query: GetAllUsers
 * 
 * Obtiene todos los usuarios del sistema.
 */

@Injectable()
export class GetAllUsersQuery {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}


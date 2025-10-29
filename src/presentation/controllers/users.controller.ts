import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateUserCommand } from '@application/use-cases/user/commands/create-user.command';
import { GetUserByIdQuery } from '@application/use-cases/user/queries/get-user-by-id.query';
import { GetAllUsersQuery } from '@application/use-cases/user/queries/get-all-users.query';
import { CreateUserDto } from '@presentation/dtos/create-user.dto';

/**
 * Controller: Users
 * 
 * Responsabilidades:
 * - Recibir requests HTTP
 * - Validar DTOs (automático con ValidationPipe)
 * - Delegar lógica a casos de uso
 * - Retornar responses
 */
@Controller('users')
export class UsersController {
    constructor(
        private readonly createUserCommand: CreateUserCommand,
        private readonly getUserByIdQuery: GetUserByIdQuery,
        private readonly getAllUsersQuery: GetAllUsersQuery,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.createUserCommand.execute(createUserDto);

        // No retornar el password
        return {
            id: user.id,
            email: user.email.getValue(),
            name: user.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }

    @Get()
    async findAll() {
        const users = await this.getAllUsersQuery.execute();

        return users.map((user) => ({
            id: user.id,
            email: user.email.getValue(),
            name: user.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
        }));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.getUserByIdQuery.execute(id);

        return {
            id: user.id,
            email: user.email.getValue(),
            name: user.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}


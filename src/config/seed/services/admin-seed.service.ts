import { IdDocumentTypeEnum } from '@domain/types/id-document-types.type';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '@application/use-cases/user/commands/register-user.command';
import { User } from '@domain/entities/better-auth/user.entity';
import type { IRoleRepository } from '@domain/repositories/role/role.repository.interface';
import type { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import { CreateUserRequest } from '@presentation/controllers/user/dtos/create-user.request';
import { ROLE_REPOSITORY, USER_REPOSITORY } from '@shared/constants/tokens';
import { AdminConfig } from '../config/admin.config';

/**
 * Servicio de Seed de Usuario Administrador
 *
 * Este servicio crea el usuario administrador del sistema usando:
 * - Configuración estática: admin.config.ts (datos del usuario)
 * - Variables de entorno: ADMIN_EMAIL y ADMIN_PASSWORD (credenciales)
 *
 * Características:
 * - Idempotente: Verifica existencia usando estrategia híbrida (email + roles)
 * - Resiliente: Encuentra el admin aunque haya sido renombrado o tenga email diferente
 * - Opcional: Solo se ejecuta si ADMIN_EMAIL y ADMIN_PASSWORD están configurados
 * - Asigna roles: Busca y asigna los roles especificados en admin.config.ts
 *
 * Estrategia de identificación:
 * 1. Buscar por email exacto del .env (más rápido y directo)
 * 2. Si no existe, buscar usuarios con el rol "Administrador" del seed
 *    Esto permite encontrar el admin aunque haya cambiado el email
 * 3. Si no se encuentra ninguno, crear un nuevo admin
 *
 * Nota: Si el admin ya existe (por email o por rol), se omite la creación sin error.
 */
@Injectable()
export class AdminSeedService {
    private readonly logger = new Logger(AdminSeedService.name);

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    /**
     * Crea el usuario administrador
     *
     * Estrategia de identificación híbrida:
     * 1. Buscar por email exacto del .env (más rápido)
     * 2. Si no existe, buscar usuarios con el rol "Administrador" del seed
     *    (permite encontrar el admin aunque haya cambiado el email)
     * 3. Si no se encuentra ninguno, crear un nuevo admin
     *
     * @param adminConfig Configuración del administrador
     * @param email Email del administrador (desde env)
     * @param password Password del administrador (desde env)
     */
    async seedAdmin(adminConfig: AdminConfig, email: string, password: string): Promise<void> {
        this.logger.log(`📝 Inicializando usuario administrador: ${email}`);

        // ESTRATEGIA 1: Buscar por email exacto del .env
        let existingUser = await this.userRepository.findByEmail(email);

        // ESTRATEGIA 2: Si no existe por email, buscar por roles del seed
        if (!existingUser) {
            existingUser = await this.findAdminByRoles(adminConfig.roleNames);
        }

        if (existingUser) {
            // Admin existe (encontrado por email o por roles)
            if (existingUser.email.value === email) {
                this.logger.log(`ℹ️  Usuario administrador ya existe: ${email} (omitido)`);
            } else {
                this.logger.log(
                    `ℹ️  Usuario administrador ya existe con email diferente: ${existingUser.email.value} (omitido, no se creará duplicado)`,
                );
            }
            return;
        }

        try {
            // Obtener IDs de roles por nombre
            const roleIds = await this.getRoleIds(adminConfig.roleNames);

            if (roleIds.length === 0) {
                this.logger.warn(
                    `⚠️  No se encontraron roles para asignar al admin: ${adminConfig.roleNames.join(', ')}`,
                );
            }

            // Crear DTO para el comando
            const registerDto: CreateUserRequest = {
                name: adminConfig.name,
                lastName: adminConfig.lastName,
                email,
                password,
                idDocumentType: adminConfig.idDocumentType as IdDocumentTypeEnum,
                idNumber: adminConfig.idNumber,
                post: adminConfig.post,
                phone: adminConfig.phone,
                address: adminConfig.address,
                isActive: true,
                roleIds,
            };

            // Crear usuario usando el comando existente
            const command = new RegisterUserCommand(registerDto);
            await this.commandBus.execute(command);

            this.logger.log('✅ Usuario administrador creado correctamente');
        } catch (error) {
            // Si el error es porque el usuario ya existe (por si acaso, aunque ya verificamos)
            if (error.message?.includes('ya existe') || error.message?.includes('already exists')) {
                this.logger.warn(`⚠️  Usuario administrador ya existe: ${email}`);
            } else {
                this.logger.error('❌ Error al crear usuario administrador', error);
                throw error;
            }
        }
    }

    /**
     * Busca un usuario administrador por sus roles
     * Esto permite encontrar el admin aunque haya cambiado el email
     *
     * @param roleNames Nombres de roles del admin (desde admin.config.ts)
     * @returns Usuario encontrado o undefined
     */
    private async findAdminByRoles(roleNames: string[]): Promise<User | undefined> {
        if (roleNames.length === 0) {
            return undefined;
        }

        try {
            // Obtener los IDs de los roles del admin
            const roleIds = await this.getRoleIds(roleNames);

            if (roleIds.length === 0) {
                return undefined;
            }

            // Buscar usuarios que tengan al menos uno de los roles del admin
            // (normalmente el admin tiene solo el rol "Administrador", pero por si acaso)
            for (const roleId of roleIds) {
                const usersWithRole = await this.userRepository.findUsersByRoleId(roleId);

                // Si encontramos usuarios con el rol, retornar el primero
                // (normalmente solo hay un admin)
                if (usersWithRole.length > 0) {
                    return usersWithRole[0];
                }
            }

            return undefined;
        } catch (error) {
            this.logger.warn('⚠️  Error al buscar admin por roles:', error);
            return undefined;
        }
    }

    /**
     * Obtiene los IDs de roles a partir de sus nombres
     * Optimizado: Carga todos los roles una sola vez
     * @param roleNames Array de nombres de roles
     * @returns Array de IDs de roles
     */
    private async getRoleIds(roleNames: string[]): Promise<string[]> {
        const roleIds: string[] = [];

        // Cargar todos los roles una sola vez (optimización)
        const allRoles = await this.roleRepository.findMany({});
        const rolesMap = new Map(allRoles.map((role) => [role.name, role]));

        for (const roleName of roleNames) {
            try {
                const role = rolesMap.get(roleName);
                if (role) {
                    roleIds.push(role.id);
                } else {
                    this.logger.warn(`⚠️  Rol no encontrado: ${roleName}`);
                }
            } catch (error) {
                this.logger.warn(`⚠️  Error al buscar rol ${roleName}:`, error);
            }
        }

        return roleIds;
    }
}

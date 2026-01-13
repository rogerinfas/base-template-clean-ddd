import { BusinessModule } from '@app/business';
import { Module } from '@nestjs/common';
import { UseCasesModule } from '@application/use-cases/use-cases.module';
import { RepositoriesModule } from '@domain/repositories/repositories.module';
import { AdminSeedService } from './services/admin-seed.service';
import { BusinessSeedService } from './services/business-seed.service';
import { PermissionSeedService } from './services/permission-seed.service';
import { RoleSeedService } from './services/role-seed.service';
import { SizeSeedService } from './services/size-seed.service';
import { UnitSeedService } from './services/unit-seed.service';
import { SystemInitializationService } from './system-initialization.service';

/**
 * Módulo de Seed e Inicialización del Sistema
 *
 * Este módulo maneja la inicialización automática del sistema al iniciar la aplicación.
 * Se ejecuta una sola vez cuando la aplicación arranca (OnApplicationBootstrap).
 *
 * Estructura:
 * - config/: Configuraciones de datos iniciales (permisos, roles, admin)
 * - services/: Servicios que ejecutan los seeds
 * - system-initialization.service.ts: Orquestador principal que coordina todos los seeds
 *
 * Flujo de inicialización:
 * 1. Permisos: Se crean todos los permisos definidos en permissions.config.ts
 * 2. Roles: Se crean los roles definidos en roles.config.ts con sus permisos asignados
 * 3. Admin: Se crea el usuario administrador definido en admin.config.ts (si está configurado en .env)
 *
 * Dependencias:
 * - RepositoriesModule: Para acceder a repositorios de permisos y roles
 * - UseCasesModule: Para usar comandos (CreateRoleCommand, RegisterUserCommand)
 * - BusinessModule: Para acceder al repositorio de Business (BUSINESS_REPOSITORY)
 */
@Module({
    imports: [
        RepositoriesModule, // Para acceder a repositorios
        UseCasesModule, // Para usar comandos (CreateRoleCommand, RegisterUserCommand)
        BusinessModule, // Para acceder al repositorio de Business (BUSINESS_REPOSITORY)
    ],
    providers: [
        SystemInitializationService,
        PermissionSeedService,
        RoleSeedService,
        AdminSeedService,
        SizeSeedService,
        UnitSeedService,
        BusinessSeedService,
    ],
})
export class SeedModule {}

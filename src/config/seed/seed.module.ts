import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { AdminSeedService } from './services/admin-seed.service';
import { PermissionSeedService } from './services/permission-seed.service';
import { RoleSeedService } from './services/role-seed.service';
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
 * - InfrastructureModule: Para acceder a repositorios de permisos y roles
 * - ApplicationModule: Para usar comandos (CreateRoleCommand, RegisterUserCommand)
 */
@Module({
    imports: [
        InfrastructureModule, // Para acceder a repositorios
        ApplicationModule, // Para usar comandos
    ],
    providers: [
        SystemInitializationService,
        PermissionSeedService,
        RoleSeedService,
        AdminSeedService,
    ],
})
export class SeedModule {}

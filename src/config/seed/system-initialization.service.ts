import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { generalEnvs } from '../env/envs';
import { ADMIN_CONFIG } from './config/admin.config';
import { BUSINESS_SEED_CONFIG, IMC_BUSINESS_SEED_CONFIG } from './config/business.config';
import { PERMISSIONS_CONFIG } from './config/permissions.config';
import { ROLES_CONFIG } from './config/roles.config';
import { AdminSeedService } from './services/admin-seed.service';
import { BusinessSeedService } from './services/business-seed.service';
import { PermissionSeedService } from './services/permission-seed.service';
import { RoleSeedService } from './services/role-seed.service';
import { SizeSeedService } from './services/size-seed.service';
import { UnitSeedService } from './services/unit-seed.service';

/**
 * Servicio de Inicialización del Sistema
 *
 * Este servicio se ejecuta automáticamente cuando la aplicación inicia (OnApplicationBootstrap).
 * Coordina la ejecución de todos los seeds necesarios para inicializar el sistema.
 *
 * Orden de ejecución:
 * 1. Permisos: Se crean todos los permisos definidos en permissions.config.ts
 * 2. Roles: Se crean los roles con sus permisos asignados (roles.config.ts)
 * 3. Admin: Se crea el usuario administrador (admin.config.ts + variables de entorno)
 * 4. [Futuros seeds]: Agregar aquí nuevos seeds siguiendo el mismo patrón
 *
 * Cómo agregar un nuevo seed:
 * 1. Crear el servicio de seed en services/ (ej: customer-seed.service.ts)
 * 2. Crear la configuración en config/ (ej: customers.config.ts)
 * 3. Inyectar el servicio en el constructor
 * 4. Agregar la llamada en onApplicationBootstrap() siguiendo el patrón existente
 * 5. Registrar el servicio en seed.module.ts
 *
 * Notas importantes:
 * - OnApplicationBootstrap se ejecuta después de OnModuleInit de todos los módulos
 * - Los seeds son idempotentes y resilientes:
 *   - Roles: Se identifican por "fingerprint" (permisos + isDefault), no solo por nombre
 *     Si cambias el nombre de un rol manualmente, el sistema lo identifica y actualiza sin crear duplicados
 *   - Usuario admin: Se verifica por email antes de crear. Si cambias el email manualmente, no crea duplicados
 * - Si falla algún seed, se registra el error pero la aplicación continúa
 * - El usuario admin solo se crea si ADMIN_EMAIL y ADMIN_PASSWORD están configurados en .env
 */
@Injectable()
export class SystemInitializationService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SystemInitializationService.name);

    constructor(
        private readonly permissionSeedService: PermissionSeedService,
        private readonly roleSeedService: RoleSeedService,
        private readonly adminSeedService: AdminSeedService,
        private readonly sizeSeedService: SizeSeedService,
        private readonly unitSeedService: UnitSeedService,
        private readonly businessSeedService: BusinessSeedService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        this.logger.log('🚀 Iniciando inicialización del sistema...');

        try {
            // =============================================================================
            // SEEDS BASE DEL SISTEMA (orden importante)
            // =============================================================================

            // 1. Crear permisos base del sistema (debe ejecutarse primero)
            this.logger.log('📋 Creando permisos del sistema...');
            await this.permissionSeedService.seedPermissions(PERMISSIONS_CONFIG);

            // 2. Crear roles con sus permisos asignados (después de permisos)
            this.logger.log('👥 Creando roles del sistema...');
            await this.roleSeedService.seedRoles(ROLES_CONFIG);

            // 3. Crear usuario administrador (después de roles)
            this.logger.log('👤 Verificando usuario administrador...');
            await this.initializeAdminUser();

            // =============================================================================
            // SEEDS ADICIONALES (agregar aquí nuevos seeds)
            // =============================================================================

            // 4. Crear tallas estándar del sistema
            this.logger.log('📏 Creando tallas estándar del sistema...');
            await this.sizeSeedService.seedSizes();

            // 5. Crear unidades de medida para el rubro textil
            this.logger.log('📐 Creando unidades de medida del sistema (rubro textil)...');
            await this.unitSeedService.seedUnits();

            // 6. Crear empresa principal del sistema
            this.logger.log('🏢 Creando empresa principal del sistema...');
            await this.businessSeedService.seedBusiness(BUSINESS_SEED_CONFIG);

            // 7. Crear empresa IMC S.R.L.
            this.logger.log('🏢 Creando empresa IMC S.R.L....');
            await this.businessSeedService.seedBusiness(IMC_BUSINESS_SEED_CONFIG);

            this.logger.log('✅ Sistema inicializado correctamente');
        } catch (error) {
            this.logger.error('❌ Error durante la inicialización del sistema', error);
            if (error instanceof Error) {
                this.logger.error('Stack trace:', error.stack);
            }
            // No lanzamos el error para que la aplicación pueda continuar
        }
    }

    /**
     * Inicializa el usuario administrador base
     *
     * El usuario se crea solo si:
     * - ADMIN_EMAIL está configurado en .env
     * - ADMIN_PASSWORD está configurado en .env
     *
     * Si el usuario ya existe, se omite la creación (idempotente).
     */
    private async initializeAdminUser(): Promise<void> {
        const adminEmail = generalEnvs.ADMIN_EMAIL;
        const adminPassword = generalEnvs.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            this.logger.warn('⚠️  ADMIN_EMAIL o ADMIN_PASSWORD no configurados, omitiendo creación de usuario admin');
            return;
        }

        await this.adminSeedService.seedAdmin(ADMIN_CONFIG, adminEmail, adminPassword);
    }
}

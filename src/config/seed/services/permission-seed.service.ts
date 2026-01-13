import { Inject, Injectable, Logger } from '@nestjs/common';
import { Permission } from '@domain/entities/role/permission.entity';
import type { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import { ActionType, ResourceAction } from '@domain/value-objects/resource-action.vo';
import { PERMISSION_REPOSITORY } from '@shared/constants/tokens';
import { PermissionConfig } from '../config/permissions.config';

/**
 * Servicio de Seed de Permisos
 *
 * Este servicio crea los permisos del sistema basándose en la configuración
 * definida en permissions.config.ts.
 *
 * Características:
 * - Idempotente: No crea duplicados si el permiso ya existe
 * - Optimizado: Procesa permisos en batches para mejor rendimiento
 * - Resiliente: Continúa aunque algunos permisos fallen al crearse
 *
 * Formato de permisos:
 * - Los permisos se crean con el formato "resource:action"
 * - Soporta wildcard: "resource:*" para todos los permisos de un recurso
 */
@Injectable()
export class PermissionSeedService {
    private readonly logger = new Logger(PermissionSeedService.name);

    constructor(
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: IPermissionRepository,
    ) {}

    /**
     * Crea los permisos definidos en la configuración
     * Optimizado con batch operations para mejor rendimiento
     * @param permissionsConfig Configuración de permisos a crear
     */
    async seedPermissions(permissionsConfig: PermissionConfig[]): Promise<void> {
        // Cargar todos los permisos existentes de una vez
        const existingPermissions = await this.permissionRepository.findMany({});
        const existingPermissionsMap = new Map(existingPermissions.map((p) => [p.permissionName, p]));

        // Separar permisos que faltan de los que ya existen
        const permissionsToCreate: PermissionConfig[] = [];

        for (const config of permissionsConfig) {
            const actionValue = config.action === ActionType.wildcard ? '*' : String(config.action);
            const permissionName = `${config.resource}:${actionValue}`;

            if (!existingPermissionsMap.has(permissionName)) {
                permissionsToCreate.push(config);
            }
        }

        let created = 0;
        const skipped = permissionsConfig.length - permissionsToCreate.length;
        let errors = 0;

        // Solo crear los permisos que faltan
        if (permissionsToCreate.length > 0) {
            // Procesar en batches para mejor rendimiento
            const BATCH_SIZE = 50;
            for (let i = 0; i < permissionsToCreate.length; i += BATCH_SIZE) {
                const batch = permissionsToCreate.slice(i, i + BATCH_SIZE);

                // Procesar batch en paralelo
                const results = await Promise.allSettled(
                    batch.map(async (config) => {
                        const resourceAction = new ResourceAction(config.resource, config.action);
                        const permission = Permission.create({
                            resourceAction,
                            description: config.description,
                        });

                        await this.permissionRepository.create(permission);
                        return true;
                    }),
                );

                // Contar resultados
                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        created++;
                    } else {
                        errors++;
                    }
                }
            }
        }

        if (created > 0 || skipped > 0) {
            this.logger.log(`✅ Permisos: ${created} creados, ${skipped} ya existían`);
        }
        if (errors > 0) {
            this.logger.error(`❌ Errores al crear permisos: ${errors}`);
        }
    }
}

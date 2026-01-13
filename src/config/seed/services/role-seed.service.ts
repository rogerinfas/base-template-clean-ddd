import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Permission } from '@domain/entities/role/permission.entity';
import { Role } from '@domain/entities/role/role.entity';
import type { IPermissionRepository } from '@domain/repositories/permission/permission.repository.interface';
import type { IRoleRepository } from '@domain/repositories/role/role.repository.interface';
import { PERMISSION_REPOSITORY, ROLE_REPOSITORY } from '@shared/constants/tokens';
import { RoleConfig } from '../config/roles.config';

/**
 * Servicio de Seed de Roles - Versión Robusta con seedRoleKey
 *
 * Este servicio crea y sincroniza los roles del sistema con sus permisos asignados,
 * respetando los cambios que el usuario haya hecho manualmente, pero permitiendo
 * añadir nuevos permisos del seed automáticamente.
 *
 * CARACTERÍSTICAS PRINCIPALES:
 *
 * 1. IDENTIFICACIÓN POR seedRoleKey:
 *    - Cada rol del seed tiene una clave única (seedRoleKey) basada en su nombre
 *    - Permite identificar roles aunque el usuario haya cambiado el nombre
 *    - Búsqueda híbrida: primero por seedRoleKey, luego por nombre como fallback
 *
 * 2. RESPETA CAMBIOS DEL USUARIO:
 *    - NO quita permisos que el usuario quitó
 *    - NO cambia el nombre que el usuario modificó
 *    - NO cambia la descripción que el usuario modificó
 *
 * 3. AÑADE NUEVOS PERMISOS AUTOMÁTICAMENTE:
 *    - Si el seed tiene nuevos permisos que el rol no tiene, se añaden automáticamente
 *    - Funciona incluso si userModified = true (Opción B)
 *    - Solo añade, nunca quita permisos existentes
 *
 * 4. DETECTA CAMBIOS EN LA CONFIGURACIÓN DEL SEED:
 *    - Usa un hash (seedPermissionsHash) para detectar si la config del seed cambió
 *    - Solo actualiza cuando el hash cambia
 *
 * 5. POLÍTICA DE ACTUALIZACIÓN:
 *    - Roles nuevos: Se crean con seedRoleKey y hash
 *    - Roles existentes con hash diferente: Se añaden SOLO permisos nuevos del seed
 *    - Roles existentes con hash igual: Se omiten (no hay cambios)
 *
 * ESCENARIOS DE USO:
 *
 * Escenario 1: Usuario quita permiso "role:*" y cambia nombre a "Operador de USUARIOS"
 * - El seed busca por seedRoleKey "operador" y encuentra el rol
 * - Añade nuevos permisos del seed (ej: "inventory:*") sin quitar "role:*" (que el usuario quitó)
 * - Mantiene el nombre "Operador de USUARIOS" (no lo cambia)
 *
 * Escenario 2: Desarrollador añade nuevo recurso "inventory" con permisos
 * - El seed detecta que el hash cambió
 * - Añade los nuevos permisos de inventory automáticamente
 * - No quita permisos existentes
 *
 * Escenario 3: Sistema recién inicializado
 * - Crea todos los roles con seedRoleKey y hash
 * - userModified = false para todos los roles nuevos
 */
@Injectable()
export class RoleSeedService {
    private readonly logger = new Logger(RoleSeedService.name);

    constructor(
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: IPermissionRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) {}

    /**
     * Sincroniza los roles definidos en la configuración con la base de datos
     * Añade nuevos permisos del seed automáticamente, respetando cambios del usuario
     *
     * @param rolesConfig Configuración de roles a sincronizar
     */
    async seedRoles(rolesConfig: RoleConfig[]): Promise<void> {
        let created = 0;
        let updated = 0;
        let skippedNoChanges = 0;
        let errors = 0;

        // Cargar todos los permisos una sola vez (optimización)
        const allPermissions = await this.permissionRepository.findMany({});
        const permissionsMap = new Map(allPermissions.map((p) => [p.permissionName, p]));

        for (const config of rolesConfig) {
            try {
                const result = await this.processRoleConfig(config, allPermissions, permissionsMap);

                switch (result) {
                    case 'created':
                        created++;
                        break;
                    case 'updated':
                        updated++;
                        break;
                    case 'skipped_no_changes':
                        skippedNoChanges++;
                        break;
                }
            } catch (error) {
                this.logger.error(`❌ Error al procesar rol "${config.name}"`, error);
                errors++;
            }
        }

        // Log de resumen
        this.logSummary(created, updated, skippedNoChanges, errors);
    }

    /**
     * Genera la clave única del seed basada en el nombre del rol
     * Normaliza el nombre: lowercase, sin espacios, sin acentos
     */
    private generateSeedRoleKey(roleName: string): string {
        return roleName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/\s+/g, '-') // Reemplazar espacios con guiones
            .replace(/[^a-z0-9-]/g, ''); // Quitar caracteres especiales
    }

    /**
     * Procesa un rol individual de la configuración
     * @returns Estado del procesamiento
     */
    private async processRoleConfig(
        config: RoleConfig,
        allPermissions: Permission[],
        permissionsMap: Map<string, Permission>,
    ): Promise<'created' | 'updated' | 'skipped_no_changes'> {
        // Generar seedRoleKey para este rol
        const seedRoleKey = this.generateSeedRoleKey(config.name);

        // Obtener IDs de permisos del seed
        const isAdminRole = config.name === 'Administrador';
        const seedPermissionIds = this.getPermissionIds(
            config.permissions,
            allPermissions,
            permissionsMap,
            isAdminRole,
        );

        // Calcular hash de los permisos del seed
        const seedPermissionsHash = this.calculatePermissionsHash(config.permissions);

        // ESTRATEGIA DE BÚSQUEDA HÍBRIDA:
        // 1. Buscar por seedRoleKey (permite encontrar roles aunque hayan sido renombrados)
        // 2. Si no existe, buscar por nombre exacto (compatibilidad con roles antiguos)
        let existingRole = await this.roleRepository.findBySeedRoleKey(seedRoleKey);

        if (!existingRole) {
            // Fallback: buscar por nombre exacto
            existingRole = await this.roleRepository.findByName(config.name);
        }

        if (!existingRole) {
            // Rol no existe, crearlo con seedRoleKey
            await this.createRole(config, seedPermissionIds, seedPermissionsHash, seedRoleKey);
            return 'created';
        }

        // Rol existe - verificar si el seed cambió
        if (existingRole.seedPermissionsHash === seedPermissionsHash) {
            // El hash es igual, no hay cambios en la config del seed
            // Pero si no tiene seedRoleKey, actualizarlo para futuras búsquedas
            if (!existingRole.seedRoleKey) {
                await this.roleRepository.update({
                    id: existingRole.id!,
                    entity: {
                        seedRoleKey: seedRoleKey,
                    },
                });
            }
            return 'skipped_no_changes';
        }

        // El hash cambió - añadir nuevos permisos del seed automáticamente
        // Esto funciona incluso si userModified = true (Opción B)
        await this.addNewSeedPermissions(
            existingRole,
            seedPermissionIds,
            seedPermissionsHash,
            seedRoleKey,
            config.isDefault ?? false,
        );

        return 'updated';
    }

    /**
     * Crea un nuevo rol con los permisos del seed
     */
    private async createRole(
        config: RoleConfig,
        seedPermissionIds: string[],
        seedPermissionsHash: string,
        seedRoleKey: string,
    ): Promise<void> {
        // Obtener los objetos Permission completos
        const permissions = await Promise.all(seedPermissionIds.map((id) => this.permissionRepository.findById(id)));
        const validPermissions = permissions.filter((p): p is Permission => p !== undefined);

        // Crear el rol con los campos de tracking del seed
        const role = Role.create({
            name: config.name,
            description: config.description,
            isDefault: config.isDefault ?? false,
            permissions: validPermissions,
            userModified: false, // Nuevo rol creado por seed
            seedPermissionsHash: seedPermissionsHash,
            seedRoleKey: seedRoleKey,
        });

        await this.roleRepository.create(role);
        this.logger.log(
            `✅ Rol "${config.name}" creado con ${validPermissions.length} permisos (seedRoleKey: ${seedRoleKey})`,
        );
    }

    /**
     * Añade nuevos permisos del seed al rol existente
     * Para el administrador: REEMPLAZA todos los permisos con solo wildcards
     * Para otros roles: NO quita permisos existentes, solo añade los que faltan del seed
     * Respeta el nombre y descripción actuales del rol
     * Funciona incluso si userModified = true (Opción B)
     */
    private async addNewSeedPermissions(
        existingRole: Role,
        seedPermissionIds: string[],
        newSeedPermissionsHash: string,
        seedRoleKey: string,
        isDefault: boolean,
    ): Promise<void> {
        // Verificar si es el administrador (solo wildcards)
        const isAdminRole = seedRoleKey === 'administrador';

        // Para el administrador: REEMPLAZAR todos los permisos con solo wildcards
        if (isAdminRole) {
            // Obtener los objetos Permission de los wildcards del seed
            const seedPermissions = await Promise.all(
                seedPermissionIds.map((id) => this.permissionRepository.findById(id)),
            );
            const validSeedPermissions = seedPermissions.filter((p): p is Permission => p !== undefined);

            // Preparar datos de actualización - REEMPLAZAR todos los permisos
            const updateData: Partial<Role> = {
                permissions: validSeedPermissions, // Reemplazar todos los permisos
                isDefault: isDefault,
                seedPermissionsHash: newSeedPermissionsHash,
                seedRoleKey: seedRoleKey,
            };

            // Actualizar el rol
            await this.roleRepository.update({
                id: existingRole.id!,
                entity: updateData,
            });

            this.logger.log(
                `🔄 Rol "${existingRole.name}" (Administrador) actualizado: permisos reemplazados con solo wildcards (${validSeedPermissions.length} permisos)`,
            );
            return;
        }

        // Para otros roles: Solo agregar nuevos permisos (comportamiento original)
        // Obtener IDs de permisos actuales
        const currentPermissionIds = new Set(existingRole.permissions.map((p) => p.id));

        // Encontrar permisos del seed que NO están en el rol actual
        const newPermissionIds = seedPermissionIds.filter((id) => !currentPermissionIds.has(id));

        if (
            newPermissionIds.length === 0 &&
            existingRole.isDefault === isDefault &&
            existingRole.seedRoleKey === seedRoleKey
        ) {
            // No hay permisos nuevos que añadir, isDefault no cambió, y seedRoleKey ya está actualizado
            // Solo actualizar el hash
            await this.roleRepository.update({
                id: existingRole.id!,
                entity: {
                    seedPermissionsHash: newSeedPermissionsHash,
                },
            });
            this.logger.debug(`🔄 Rol "${existingRole.name}" - hash actualizado, sin nuevos permisos`);
            return;
        }

        // Obtener los objetos Permission de los nuevos permisos
        const newPermissions = await Promise.all(newPermissionIds.map((id) => this.permissionRepository.findById(id)));
        const validNewPermissions = newPermissions.filter((p): p is Permission => p !== undefined);

        // Combinar permisos existentes con los nuevos
        // NO quitamos permisos que el usuario añadió manualmente
        const combinedPermissions = [...existingRole.permissions, ...validNewPermissions];

        // Preparar datos de actualización
        const updateData: Partial<Role> = {
            permissions: combinedPermissions,
            isDefault: isDefault,
            seedPermissionsHash: newSeedPermissionsHash,
            seedRoleKey: seedRoleKey, // Actualizar seedRoleKey si no existe
            // NO actualizamos name ni description (respetar cambios del usuario)
            // NO actualizamos userModified (mantener el estado actual)
        };

        // Actualizar el rol
        await this.roleRepository.update({
            id: existingRole.id!,
            entity: updateData,
        });

        if (validNewPermissions.length > 0) {
            this.logger.log(
                `🔄 Rol "${existingRole.name}" actualizado: +${validNewPermissions.length} nuevos permisos del seed añadidos automáticamente`,
            );
        } else {
            this.logger.log(`🔄 Rol "${existingRole.name}" actualizado: seedRoleKey y hash actualizados`);
        }
    }

    /**
     * Calcula un hash MD5 de la configuración de permisos del seed
     * Se usa para detectar si la configuración cambió
     */
    private calculatePermissionsHash(permissions: string[]): string {
        // Ordenar para consistencia
        const sortedPermissions = [...permissions].sort();
        const dataToHash = JSON.stringify(sortedPermissions);
        return crypto.createHash('md5').update(dataToHash).digest('hex');
    }

    /**
     * Obtiene los IDs de permisos a partir de sus nombres
     * Soporta wildcards:
     * - "*:*" = todos los permisos de todos los recursos
     * - "resource:*" = todos los permisos de un recurso específico
     */
    private getPermissionIds(
        permissionNames: string[],
        allPermissions: Permission[],
        permissionsMap: Map<string, Permission>,
        onlyWildcards: boolean = false,
    ): string[] {
        const permissionIds: string[] = [];

        for (const permissionName of permissionNames) {
            try {
                // Manejar wildcard "*:*" - todos los permisos
                if (permissionName === '*:*') {
                    const allIds = allPermissions.map((p) => p.id);
                    permissionIds.push(...allIds);
                    continue;
                }

                // Manejar wildcard "resource:*"
                if (permissionName.endsWith(':*')) {
                    const resource = permissionName.replace(':*', '');
                    // Buscar el permiso wildcard
                    const wildcardPermission = permissionsMap.get(permissionName);
                    if (wildcardPermission) {
                        permissionIds.push(wildcardPermission.id);
                    }
                    // Si onlyWildcards = false, también agregar todos los permisos específicos del recurso
                    if (!onlyWildcards) {
                        const resourcePermissions = allPermissions.filter((p) => {
                            const permName = p.permissionName;
                            return permName.startsWith(`${resource}:`) && !permName.endsWith(':*');
                        });
                        permissionIds.push(...resourcePermissions.map((p) => p.id));
                    }
                    continue;
                }

                // Permiso específico - buscar en el mapa
                const permission = permissionsMap.get(permissionName);
                if (permission) {
                    permissionIds.push(permission.id);
                }
            } catch (error) {
                this.logger.warn(`⚠️  Error al buscar permiso ${permissionName}:`, error);
            }
        }

        // Eliminar duplicados
        return [...new Set(permissionIds)];
    }

    /**
     * Registra el resumen del proceso de seed
     */
    private logSummary(created: number, updated: number, skippedNoChanges: number, errors: number): void {
        const parts: string[] = [];

        if (created > 0) parts.push(`${created} creados`);
        if (updated > 0) parts.push(`${updated} actualizados`);
        if (skippedNoChanges > 0) parts.push(`${skippedNoChanges} sin cambios`);

        if (parts.length > 0) {
            this.logger.log(`✅ Roles: ${parts.join(', ')}`);
        }

        if (errors > 0) {
            this.logger.error(`❌ Errores al procesar roles: ${errors}`);
        }
    }
}

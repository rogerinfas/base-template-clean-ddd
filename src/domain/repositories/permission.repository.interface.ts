import { Permission } from '../entities/role/permission.entity';

/**
 * Permission repository interface
 *
 * Define las operaciones de persistencia para la entidad Permission.
 * La implementación estará en la capa de infraestructura.
 */
export interface IPermissionRepository {
    /**
     * Busca un permiso por ID
     */
    findById(id: string): Promise<Permission | null>;

    /**
     * Busca un permiso por nombre
     * @param name Nombre del permiso en formato "resource:action"
     * @returns El permiso encontrado o undefined
     */
    findByName(name: string): Promise<Permission | undefined>;

    /**
     * Busca permisos por recurso
     * @param resource Recurso
     * @returns Los permisos del recurso
     */
    findByResource(resource: string): Promise<Permission[]>;

    /**
     * Busca todos los permisos
     */
    findAll(): Promise<Permission[]>;

    /**
     * Crea un nuevo permiso
     */
    create(permission: Permission): Promise<Permission>;

    /**
     * Actualiza un permiso existente
     */
    update(id: string, permission: Permission): Promise<Permission>;

    /**
     * Elimina un permiso
     */
    delete(id: string): Promise<void>;

    /**
     * Crea o actualiza un permiso basado en su nombre (útil para seeds)
     * Operación atómica que evita condiciones de carrera
     * @param permission Permiso a crear o actualizar
     * @returns El permiso creado o actualizado
     */
    upsertByName(permission: Permission): Promise<Permission>;
}

// Token para inyección de dependencias
export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');




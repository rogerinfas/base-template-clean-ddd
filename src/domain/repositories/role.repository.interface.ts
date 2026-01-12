import { Role } from '../entities/role/role.entity';

/**
 * Role repository interface
 *
 * Define las operaciones de persistencia para la entidad Role.
 * La implementación estará en la capa de infraestructura.
 */
export interface IRoleRepository {
    /**
     * Busca el rol por ID
     */
    findById(id: string): Promise<Role | null>;

    /**
     * Busca el rol por nombre
     * @param name Nombre del rol
     * @returns El rol encontrado
     */
    findByName(name: string): Promise<Role | undefined>;

    /**
     * Busca el rol por clave del seed (seedRoleKey)
     * Permite identificar roles del seed aunque hayan sido renombrados
     * @param seedRoleKey Clave única del seed
     * @returns El rol encontrado
     */
    findBySeedRoleKey(seedRoleKey: string): Promise<Role | undefined>;

    /**
     * Busca el rol por defecto
     * @returns El rol por defecto
     */
    findDefaultRole(): Promise<Role | undefined>;

    /**
     * Busca todos los roles
     */
    findAll(): Promise<Role[]>;

    /**
     * Crea un nuevo rol
     */
    create(role: Role): Promise<Role>;

    /**
     * Actualiza un rol existente
     */
    update(id: string, role: Role): Promise<Role>;

    /**
     * Elimina un rol
     */
    delete(id: string): Promise<void>;

    /**
     * Verifica si existe un rol por nombre
     */
    existsByName(name: string): Promise<boolean>;
}

// Token para inyección de dependencias
export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');






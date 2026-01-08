import { User } from '../entities/user/user.entity';

/**
 * Interface de Repositorio: User
 * 
 * Definida en el dominio (inversión de dependencias).
 * La implementación estará en la capa de infraestructura.
 * 
 * Esto permite que el dominio no dependa de detalles técnicos
 * como Prisma, TypeORM, etc.
 */
export interface IUserRepository {
    // Búsquedas
    findById(id: string, includeRoles?: boolean): Promise<User | null>;
    findByEmail(email: string, includeRoles?: boolean): Promise<User | null>;
    findAll(includeRoles?: boolean): Promise<User[]>;

    // Escritura
    create(user: User): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;

    // Verificaciones
    existsByEmail(email: string): Promise<boolean>;
    existsByIdNumber(idNumber: string): Promise<boolean>;
}

// Token para inyección de dependencias
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');


import { User } from '../entities/user.entity';

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
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;

    // Escritura
    create(user: User): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;

    // Verificaciones
    existsByEmail(email: string): Promise<boolean>;
}

// Token para inyección de dependencias
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');


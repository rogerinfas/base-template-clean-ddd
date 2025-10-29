import { Email } from '../value-objects/email.vo';
import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

/**
 * Entity: User
 * 
 * Entidad rica con lógica de negocio.
 * Principios:
 * - Inmutabilidad: Los métodos retornan nuevas instancias
 * - Validación: Todas las reglas de negocio están en la entidad
 * - Factory methods: create() para nuevos, fromData() para existentes
 */

interface UserProps {
    id?: string;
    email: Email;
    password: string; // Password ya hasheado
    name: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    public readonly id?: string;
    public readonly email: Email;
    public readonly password: string;
    public readonly name: string;
    public readonly isActive: boolean;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;

    private constructor(props: UserProps) {
        this.validateName(props.name);
        
        this.id = props.id;
        this.email = props.email;
        this.password = props.password;
        this.name = props.name;
        this.isActive = props.isActive ?? true;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    /**
     * Factory method para crear un nuevo usuario
     */
    static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
        return new User(props);
    }

    /**
     * Factory method para recrear desde persistencia
     */
    static fromData(data: UserProps): User {
        return new User(data);
    }

    /**
     * Actualiza el nombre del usuario
     * Retorna una nueva instancia (inmutabilidad)
     */
    updateName(name: string): User {
        this.validateName(name);
        
        return new User({
            id: this.id,
            email: this.email,
            password: this.password,
            name,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Actualiza el email del usuario
     */
    updateEmail(email: Email): User {
        return new User({
            id: this.id,
            email,
            password: this.password,
            name: this.name,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Actualiza el password (ya hasheado)
     */
    updatePassword(hashedPassword: string): User {
        return new User({
            id: this.id,
            email: this.email,
            password: hashedPassword,
            name: this.name,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Activa el usuario
     */
    activate(): User {
        if (this.isActive) {
            return this;
        }

        return new User({
            id: this.id,
            email: this.email,
            password: this.password,
            name: this.name,
            isActive: true,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Desactiva el usuario
     */
    deactivate(): User {
        if (!this.isActive) {
            return this;
        }

        return new User({
            id: this.id,
            email: this.email,
            password: this.password,
            name: this.name,
            isActive: false,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Validaciones de negocio
     */
    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new InvalidValueObjectException('El nombre no puede estar vacío');
        }

        if (name.length < 2) {
            throw new InvalidValueObjectException('El nombre debe tener al menos 2 caracteres');
        }

        if (name.length > 100) {
            throw new InvalidValueObjectException('El nombre no puede exceder 100 caracteres');
        }
    }
}


import { Price } from '../value-objects/price.vo';
import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

/**
 * Entity: Product
 * 
 * Demuestra:
 * - Uso de Value Objects (Price)
 * - Validaciones de negocio
 * - Métodos de negocio (incrementStock, decrementStock)
 */

interface ProductProps {
    id?: string;
    name: string;
    description?: string;
    price: Price;
    stock: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Product {
    public readonly id?: string;
    public readonly name: string;
    public readonly description?: string;
    public readonly price: Price;
    public readonly stock: number;
    public readonly isActive: boolean;
    public readonly createdAt?: Date;
    public readonly updatedAt?: Date;

    private constructor(props: ProductProps) {
        this.validateName(props.name);
        this.validateStock(props.stock);

        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.price = props.price;
        this.stock = props.stock;
        this.isActive = props.isActive ?? true;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    /**
     * Factory method para crear nuevo producto
     */
    static create(props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'>): Product {
        return new Product(props);
    }

    /**
     * Factory method para recrear desde persistencia
     */
    static fromData(data: ProductProps): Product {
        return new Product(data);
    }

    /**
     * Actualiza los detalles del producto
     */
    updateDetails(updates: {
        name?: string;
        description?: string;
        price?: Price;
    }): Product {
        const newName = updates.name ?? this.name;
        const newDescription = updates.description ?? this.description;
        const newPrice = updates.price ?? this.price;

        if (updates.name) {
            this.validateName(updates.name);
        }

        return new Product({
            id: this.id,
            name: newName,
            description: newDescription,
            price: newPrice,
            stock: this.stock,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Incrementa el stock
     */
    incrementStock(quantity: number): Product {
        if (quantity <= 0) {
            throw new InvalidValueObjectException('La cantidad debe ser mayor a 0');
        }

        const newStock = this.stock + quantity;
        this.validateStock(newStock);

        return new Product({
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: newStock,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Decrementa el stock
     */
    decrementStock(quantity: number): Product {
        if (quantity <= 0) {
            throw new InvalidValueObjectException('La cantidad debe ser mayor a 0');
        }

        if (quantity > this.stock) {
            throw new InvalidValueObjectException('Stock insuficiente');
        }

        const newStock = this.stock - quantity;

        return new Product({
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: newStock,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Activa el producto
     */
    activate(): Product {
        if (this.isActive) {
            return this;
        }

        return new Product({
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: this.stock,
            isActive: true,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Desactiva el producto
     */
    deactivate(): Product {
        if (!this.isActive) {
            return this;
        }

        return new Product({
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: this.stock,
            isActive: false,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }

    /**
     * Verifica si hay stock disponible
     */
    hasStock(): boolean {
        return this.stock > 0;
    }

    /**
     * Validaciones
     */
    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new InvalidValueObjectException('El nombre del producto no puede estar vacío');
        }

        if (name.length > 200) {
            throw new InvalidValueObjectException('El nombre no puede exceder 200 caracteres');
        }
    }

    private validateStock(stock: number): void {
        if (stock < 0) {
            throw new InvalidValueObjectException('El stock no puede ser negativo');
        }

        if (stock > 999999) {
            throw new InvalidValueObjectException('El stock excede el máximo permitido');
        }
    }
}


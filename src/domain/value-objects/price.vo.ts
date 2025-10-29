import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

/**
 * Value Object: Price
 * 
 * Representa un precio monetario con validaciones de negocio.
 * Evita precios negativos o inválidos.
 */
export class Price {
    private readonly value: number;

    constructor(price: number) {
        this.validate(price);
        this.value = Math.round(price * 100) / 100; // Redondear a 2 decimales
    }

    private validate(price: number): void {
        if (price === null || price === undefined) {
            throw new InvalidValueObjectException('El precio no puede ser nulo');
        }

        if (price < 0) {
            throw new InvalidValueObjectException('El precio no puede ser negativo');
        }

        if (price > 999999.99) {
            throw new InvalidValueObjectException('El precio excede el máximo permitido');
        }
    }

    getValue(): number {
        return this.value;
    }

    equals(other: Price): boolean {
        return this.value === other.getValue();
    }

    isGreaterThan(other: Price): boolean {
        return this.value > other.getValue();
    }

    isLessThan(other: Price): boolean {
        return this.value < other.getValue();
    }

    toString(): string {
        return this.value.toFixed(2);
    }
}


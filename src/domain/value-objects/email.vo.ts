import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

/**
 * Value Object: Email
 * 
 * Encapsula la lógica de validación de un email.
 * Es inmutable: una vez creado, no se puede modificar.
 */
export class Email {
    private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    readonly #value: string;

    constructor(email: string) {
        this.validate(email);
        this.#value = email.toLowerCase().trim();
    }

    private validate(email: string): void {
        if (!Email.EMAIL_REGEX.test(email)) {
            throw new InvalidValueObjectException('Formato de email inválido');
        }

        if (email.length > 254) {
            throw new InvalidValueObjectException('Email demasiado largo');
        }
    }

    get value(): string {
        return this.#value;
    }

    getValue(): string {
        return this.#value;
    }

    equals(email: Email): boolean {
        return this.#value === email.value;
    }

    toString(): string {
        return this.#value;
    }
}


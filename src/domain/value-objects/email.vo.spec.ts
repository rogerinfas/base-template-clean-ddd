import { Email } from './email.vo';
import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

/**
 * Test de ejemplo para Value Object Email
 * 
 * Demuestra cómo testear:
 * - Creación válida
 * - Validaciones
 * - Comparaciones
 */
describe('Email Value Object', () => {
    describe('constructor', () => {
        it('debe crear un email válido', () => {
            const email = new Email('test@example.com');
            expect(email.getValue()).toBe('test@example.com');
        });

        it('debe convertir a minúsculas', () => {
            const email = new Email('TEST@EXAMPLE.COM');
            expect(email.getValue()).toBe('test@example.com');
        });

        it('debe eliminar espacios', () => {
            const email = new Email('  test@example.com  ');
            expect(email.getValue()).toBe('test@example.com');
        });
    });

    describe('validación', () => {
        it('debe lanzar error si el email está vacío', () => {
            expect(() => new Email('')).toThrow(InvalidValueObjectException);
            expect(() => new Email('')).toThrow('El email no puede estar vacío');
        });

        it('debe lanzar error si el formato es inválido', () => {
            expect(() => new Email('invalid-email')).toThrow(InvalidValueObjectException);
            expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
        });

        it('debe lanzar error si falta @', () => {
            expect(() => new Email('invalidemail.com')).toThrow(InvalidValueObjectException);
        });

        it('debe lanzar error si falta dominio', () => {
            expect(() => new Email('test@')).toThrow(InvalidValueObjectException);
        });

        it('debe lanzar error si el email es muy largo', () => {
            const longEmail = 'a'.repeat(250) + '@example.com';
            expect(() => new Email(longEmail)).toThrow(InvalidValueObjectException);
            expect(() => new Email(longEmail)).toThrow('Email demasiado largo');
        });
    });

    describe('equals', () => {
        it('debe detectar emails iguales', () => {
            const email1 = new Email('test@example.com');
            const email2 = new Email('TEST@EXAMPLE.COM');

            expect(email1.equals(email2)).toBe(true);
        });

        it('debe detectar emails diferentes', () => {
            const email1 = new Email('test1@example.com');
            const email2 = new Email('test2@example.com');

            expect(email1.equals(email2)).toBe(false);
        });
    });

    describe('toString', () => {
        it('debe retornar el valor del email', () => {
            const email = new Email('test@example.com');
            expect(email.toString()).toBe('test@example.com');
        });
    });
});


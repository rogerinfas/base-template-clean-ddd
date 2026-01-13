import { InvalidValueObjectException } from '../exceptions/domain.exceptions';
import { IdDocumentTypeEnum } from '../types/id-document-types.type';

/**
 * Value Object que representa el tipo de documento de un usuario.
 * Los tipos de documentos permitidos incluyen DNI, RUC, PASSPORT, FOREIGN_ID y OTHER.
 */
export class IdDocumentType {
    public static readonly allowed: readonly IdDocumentTypeEnum[] = Object.values(IdDocumentTypeEnum);
    readonly #value: IdDocumentTypeEnum;
    
    constructor(value: IdDocumentTypeEnum) {
        const isNullableString = (value as unknown) === '';

        if (!value && !isNullableString) {
            throw new InvalidValueObjectException('El tipo de documento no puede estar vacío');
        }

        // Logic for updating to null the enum
        if (isNullableString) {
            this.#value = value as IdDocumentTypeEnum;
            return;
        }

        if (!isNullableString && !this.isValidDocumentType(value)) {
            throw new InvalidValueObjectException(
                `Tipo de documento inválido: ${value}. Valores permitidos son ${IdDocumentType.allowed.join(', ')}`,
            );
        }
        this.#value = value;
    }

    private isValidDocumentType(value: IdDocumentTypeEnum): value is IdDocumentTypeEnum {
        return Object.values(IdDocumentTypeEnum).includes(value);
    }

    get value(): IdDocumentTypeEnum {
        return this.#value;
    }

    equals(other: IdDocumentType): boolean {
        return this.#value === other.value;
    }
}







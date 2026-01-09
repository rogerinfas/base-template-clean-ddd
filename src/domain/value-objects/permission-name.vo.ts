import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

export class PermissionName {
    readonly #value: string;
    readonly #resource: string;
    readonly #action: string;

    constructor(permissionName: string) {
        if (!this.isValid(permissionName)) {
            throw new InvalidValueObjectException('Formato de nombre de permiso inválido');
        }

        this.#value = permissionName;
        const [resource, action] = permissionName.split(':');
        this.#resource = resource;
        this.#action = action;
    }

    private isValid(permissionName: string): boolean {
        // Permite formato "resource:action" o "resource:*" para wildcards
        return /^[a-z0-9-]+:[a-z0-9-*]+$/.test(permissionName);
    }

    get value(): string {
        return this.#value;
    }

    get resource(): string {
        return this.#resource;
    }

    get action(): string {
        return this.#action;
    }

    equals(permissionName: PermissionName): boolean {
        return this.value === permissionName.value;
    }

    static create(resource: string, action: string): PermissionName {
        return new PermissionName(`${resource}:${action}`);
    }
}



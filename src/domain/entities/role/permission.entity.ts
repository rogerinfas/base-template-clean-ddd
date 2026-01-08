import { BaseEntity } from '../base/base.entity';
import { InvalidValueObjectException } from '../../exceptions/domain.exceptions';
import { PermissionName } from '../../value-objects/permission-name.vo';
import { ActionType, ResourceAction, ResourceType } from '../../value-objects/resource-action.vo';

// Interface para datos del permiso
interface PermissionProps {
    id?: string;
    resourceAction: ResourceAction;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Permission extends BaseEntity {
    // Campos readonly para inmutabilidad
    readonly #name: PermissionName;
    readonly #resourceAction: ResourceAction;

    // Description como campo mutable (necesario para actualizaciones)
    public description: string;

    constructor(props: PermissionProps) {
        super({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        });
        this.validateDescription(props.description);

        this.#name = PermissionName.create(String(props.resourceAction.resource), String(props.resourceAction.action));
        this.description = props.description;
        this.#resourceAction = props.resourceAction;
    }

    /**
     * Factory method para crear un permiso nuevo
     */
    static create(props: Omit<PermissionProps, 'id' | 'createdAt' | 'updatedAt'>): Permission {
        return new Permission(props);
    }

    /**
     * Factory method para recrear un permiso desde datos existentes
     */
    static fromData(data: PermissionProps): Permission {
        return new Permission(data);
    }

    /**
     * Actualiza la descripción del permiso
     * @param newDescription Nueva descripción del permiso
     */
    updateDescription(newDescription: string): void {
        this.validateDescription(newDescription);

        if (this.description === newDescription) {
            return; // No change needed
        }

        this.description = newDescription;
        this.touch();
    }

    /**
     * Obtiene el recurso del permiso
     * @returns El recurso del permiso
     */
    get resource(): ResourceType {
        return this.#resourceAction.resource;
    }

    /**
     * Obtiene la acción del permiso
     * @returns La acción del permiso (puede ser ActionType.wildcard para wildcards)
     */
    get action(): ActionType {
        return this.#resourceAction.action;
    }

    /**
     * Obtiene el nombre del permiso
     * @returns El nombre del permiso
     */
    get permissionName(): string {
        return this.#name.value;
    }

    /**
     * Obtiene el nombre del permiso
     * @returns El nombre del permiso
     */
    get stringName(): string {
        return this.#name.value;
    }

    get name(): PermissionName {
        return this.#name;
    }

    get resourceAction(): ResourceAction {
        return this.#resourceAction;
    }

    /**
     * Verifica si este permiso permite una acción específica en un recurso
     * @param resource Recurso
     * @param action Acción
     * @returns true si el permiso permite la acción en el recurso, false en caso contrario
     */
    allowsAction(resource: string, action: string): boolean {
        return this.resource === resource && this.action === action;
    }

    /**
     * Valida la descripción del permiso
     * @param description Descripción del permiso
     */
    private validateDescription(description: string): void {
        if (!description || description.trim().length === 0) {
            throw new InvalidValueObjectException('La descripción de la permiso no puede ser vacía');
        }

        if (description.length > 500) {
            throw new InvalidValueObjectException('La descripción de la permiso no puede exceder 500 caracteres');
        }
    }
}


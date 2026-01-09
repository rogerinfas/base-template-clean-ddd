import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

export enum ResourceType {
    // =============================================================================
    // AUTENTICACIÓN Y RBAC
    // =============================================================================
    user = 'user',
    role = 'role',
}

export enum ActionType {
    // =============================================================================
    // ACCIONES BASE (para todos los módulos)
    // =============================================================================
    read = 'read', // Ver/leer
    create = 'create', // Crear
    update = 'update', // Actualizar
    activate = 'activate', // Activar
    deactivate = 'deactivate', // Desactivar
    delete = 'delete', // Eliminar
    export = 'export', // Exportar

    // =============================================================================
    // WILDCARD (para permisos que otorgan acceso a todas las acciones de un recurso)
    // =============================================================================
    wildcard = '*', // Permite todas las acciones de un recurso (ej: "user:*")
}

export class ResourceAction {
    readonly #resource: ResourceType;
    readonly #action: ActionType;

    constructor(resource: ResourceType | string, action: ActionType | string) {
        const resourceValue = typeof resource === 'string' ? this.parseResourceType(resource) : resource;

        if (!this.isValidResource(resourceValue)) {
            throw new InvalidValueObjectException('Invalid resource name');
        }

        // Si action es "*", usar ActionType.wildcard
        if (action === '*') {
            this.#resource = resourceValue;
            this.#action = ActionType.wildcard;
            return;
        }

        const actionValue = typeof action === 'string' ? this.parseActionType(action) : action;

        this.#resource = resourceValue;
        this.#action = actionValue;
    }

    private isValidResource(resource: ResourceType): boolean {
        // Resource name should be lowercase alphanumeric and cannot be empty
        return Object.values(ResourceType).includes(resource);
    }

    private parseResourceType(resource: string): ResourceType {
        if (Object.values(ResourceType).includes(resource as ResourceType)) {
            return resource as ResourceType;
        }
        throw new InvalidValueObjectException('Invalid resource type');
    }

    private parseActionType(action: string): ActionType {
        // Permitir "*" como string y convertirlo a ActionType.wildcard
        if (action === '*') {
            return ActionType.wildcard;
        }
        if (Object.values(ActionType).includes(action as ActionType)) {
            return action as ActionType;
        }
        throw new InvalidValueObjectException('Invalid action type');
    }

    get resource(): ResourceType {
        return this.#resource;
    }

    get action(): ActionType {
        return this.#action;
    }
}




import { ActionType, ResourceType } from '@domain/value-objects/resource-action.vo';

/**
 * Configuración de permisos del sistema
 * Define todos los permisos que se crearán automáticamente al inicializar el sistema
 *
 * Formato: { resource, action, description }
 * El nombre del permiso se genera automáticamente como "resource:action"
 */
export interface PermissionConfig {
    resource: ResourceType | string;
    action: ActionType | string;
    description: string;
}

/**
 * Mapeo de nombres de recursos a nombres legibles en español
 * Solo incluye los recursos básicos disponibles en el template
 */
const RESOURCE_NAMES = {
    [ResourceType.user]: 'usuarios',
    [ResourceType.role]: 'roles',
} satisfies Record<ResourceType, string>;

/**
 * Genera los permisos base para un recurso
 * Acciones base: read, create, update, activate, deactivate, delete, export
 */
function generateBasePermissions(resource: ResourceType, resourceName: string): PermissionConfig[] {
    return [
        {
            resource,
            action: ActionType.read,
            description: `Ver/leer ${resourceName}`,
        },
        {
            resource,
            action: ActionType.create,
            description: `Crear ${resourceName}`,
        },
        {
            resource,
            action: ActionType.update,
            description: `Actualizar ${resourceName}`,
        },
        {
            resource,
            action: ActionType.activate,
            description: `Activar ${resourceName}`,
        },
        {
            resource,
            action: ActionType.deactivate,
            description: `Desactivar ${resourceName}`,
        },
        {
            resource,
            action: ActionType.delete,
            description: `Eliminar ${resourceName}`,
        },
        {
            resource,
            action: ActionType.export,
            description: `Exportar ${resourceName}`,
        },
    ];
}

/**
 * Genera automáticamente todos los permisos base para TODOS los recursos del ResourceType
 * TypeScript validará en tiempo de compilación que todos los recursos están siendo procesados
 * Si falta alguno en RESOURCE_NAMES, aparecerá un error de tipado
 */
function generateAllBasePermissions(): PermissionConfig[] {
    const allPermissions: PermissionConfig[] = [];

    // Iterar sobre todos los valores del enum ResourceType
    // TypeScript validará que RESOURCE_NAMES tiene todos los valores
    for (const resource of Object.values(ResourceType) as ResourceType[]) {
        // Esta línea causará un error de tipado si falta algún recurso en RESOURCE_NAMES
        const resourceName: string = RESOURCE_NAMES[resource];
        allPermissions.push(...generateBasePermissions(resource, resourceName));
    }

    return allPermissions;
}

/**
 * Genera automáticamente todos los permisos wildcard para TODOS los recursos del ResourceType
 * TypeScript validará en tiempo de compilación que todos los recursos están siendo procesados
 * Si falta alguno en RESOURCE_NAMES, aparecerá un error de tipado
 */
function generateAllWildcardPermissions(): PermissionConfig[] {
    const allWildcards: PermissionConfig[] = [];

    // Iterar sobre todos los valores del enum ResourceType
    // TypeScript validará que RESOURCE_NAMES tiene todos los valores
    for (const resource of Object.values(ResourceType) as ResourceType[]) {
        // Esta línea causará un error de tipado si falta algún recurso en RESOURCE_NAMES
        const resourceName: string = RESOURCE_NAMES[resource];
        allWildcards.push({
            resource,
            action: ActionType.wildcard,
            description: `Todos los permisos de ${resourceName}`,
        });
    }

    return allWildcards;
}

/**
 * Lista de permisos a crear en el sistema
 * Se generan automáticamente desde el enum ResourceType para garantizar que nunca falte ninguno
 */
export const PERMISSIONS_CONFIG: PermissionConfig[] = [
    // Generar automáticamente todos los permisos base para todos los recursos
    ...generateAllBasePermissions(),

    // Generar automáticamente todos los permisos wildcard para todos los recursos
    ...generateAllWildcardPermissions(),
];

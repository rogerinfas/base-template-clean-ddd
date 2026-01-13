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
 * TypeScript validará en tiempo de compilación que TODOS los recursos del enum están presentes
 * Si falta alguno, aparecerá un error de tipado en rojo en el IDE
 */
const RESOURCE_NAMES = {
    [ResourceType.user]: 'usuarios',
    [ResourceType.role]: 'roles',
    [ResourceType.customer]: 'clientes',
    [ResourceType.supplier]: 'proveedores',
    [ResourceType.workshop]: 'talleres',
    [ResourceType.worker]: 'trabajadores',
    [ResourceType['garment-type']]: 'tipos de prendas',
    [ResourceType['garment-type-image']]: 'imágenes de tipos de prendas',
    [ResourceType['material-type']]: 'tipos de insumo',
    [ResourceType.material]: 'materiales',
    [ResourceType.unit]: 'unidades',
    [ResourceType['labor-type']]: 'tipos de acción',
    [ResourceType.labor]: 'acciones',
    [ResourceType.size]: 'tallas',
    [ResourceType['garment-template']]: 'plantillas de prendas',
    [ResourceType['garment-template-material']]: 'insumos de plantilla de prenda',
    [ResourceType['garment-template-labor']]: 'mano de obra de plantilla de prenda',
    [ResourceType.quotation]: 'cotizaciones',
    [ResourceType['quotation-item']]: 'ítems de cotización',
    [ResourceType['quotation-item-size']]: 'distribuciones de talla en items de cotización',
    [ResourceType['purchase-order']]: 'órdenes de pedido',
    [ResourceType.specification]: 'especificaciones',
    [ResourceType['production-assignment']]: 'asignaciones de producción',
    [ResourceType['progress-history']]: 'historial de progreso',
    [ResourceType.payment]: 'pagos a trabajadores',
    [ResourceType['account-receivable']]: 'cuentas por cobrar',
    [ResourceType['account-payable']]: 'cuentas por pagar',
    [ResourceType['account-type']]: 'tipos de cuenta',
    [ResourceType['chart-account']]: 'plan de cuentas',
    [ResourceType.movement]: 'movimientos contables',
    [ResourceType['audit-log']]: 'registros de auditoría',
    [ResourceType['measurement-control']]: 'control de medidas',
    [ResourceType['period-planning']]: 'planificaciones por período',
    [ResourceType.business]: 'empresas',
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

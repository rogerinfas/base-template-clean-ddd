import { ResourceType } from '@domain/value-objects/resource-action.vo';

/**
 * Configuración de roles del sistema
 * Define todos los roles que se crearán automáticamente al inicializar el sistema
 *
 * Formato: { name, description, isDefault?, permissions }
 * - name: Nombre único del rol
 * - description: Descripción del rol
 * - isDefault: Si es true, será el rol por defecto para nuevos usuarios
 * - permissions: Array de nombres de permisos en formato "resource:action"
 *   - Puede usar "*" como wildcard para indicar todos los permisos de un recurso
 *   - Ejemplo: "user:*" significa todos los permisos de usuarios
 *   - Ejemplo: "*:*" significa todos los permisos de todos los recursos
 */
export interface RoleConfig {
    name: string;
    description: string;
    isDefault?: boolean;
    permissions: string[]; // Array de nombres de permisos en formato "resource:action" o "resource:*" o "*:*"
}

/**
 * Constante que mapea TODOS los recursos a sus permisos wildcard
 * TypeScript validará en tiempo de compilación que TODOS los recursos del enum están presentes
 * Si falta alguno, aparecerá un error de tipado en rojo en el IDE
 *
 * Esta constante se usa para validar que generateAllAdminPermissions() genera todos los permisos
 */
const ALL_RESOURCE_WILDCARD_PERMISSIONS = {
    [ResourceType.user]: `${ResourceType.user}:*`,
    [ResourceType.role]: `${ResourceType.role}:*`,
    [ResourceType.customer]: `${ResourceType.customer}:*`,
    [ResourceType.supplier]: `${ResourceType.supplier}:*`,
    [ResourceType.workshop]: `${ResourceType.workshop}:*`,
    [ResourceType.worker]: `${ResourceType.worker}:*`,
    [ResourceType['garment-type']]: `${ResourceType['garment-type']}:*`,
    [ResourceType['garment-type-image']]: `${ResourceType['garment-type-image']}:*`,
    [ResourceType['material-type']]: `${ResourceType['material-type']}:*`,
    [ResourceType.material]: `${ResourceType.material}:*`,
    [ResourceType.unit]: `${ResourceType.unit}:*`,
    [ResourceType['labor-type']]: `${ResourceType['labor-type']}:*`,
    [ResourceType.labor]: `${ResourceType.labor}:*`,
    [ResourceType.size]: `${ResourceType.size}:*`,
    [ResourceType['garment-template']]: `${ResourceType['garment-template']}:*`,
    [ResourceType['garment-template-material']]: `${ResourceType['garment-template-material']}:*`,
    [ResourceType['garment-template-labor']]: `${ResourceType['garment-template-labor']}:*`,
    [ResourceType.quotation]: `${ResourceType.quotation}:*`,
    [ResourceType['quotation-item']]: `${ResourceType['quotation-item']}:*`,
    [ResourceType['quotation-item-size']]: `${ResourceType['quotation-item-size']}:*`,
    [ResourceType['purchase-order']]: `${ResourceType['purchase-order']}:*`,
    [ResourceType.specification]: `${ResourceType.specification}:*`,
    [ResourceType['production-assignment']]: `${ResourceType['production-assignment']}:*`,
    [ResourceType['progress-history']]: `${ResourceType['progress-history']}:*`,
    [ResourceType.payment]: `${ResourceType.payment}:*`,
    [ResourceType['account-receivable']]: `${ResourceType['account-receivable']}:*`,
    [ResourceType['account-payable']]: `${ResourceType['account-payable']}:*`,
    [ResourceType['account-type']]: `${ResourceType['account-type']}:*`,
    [ResourceType['chart-account']]: `${ResourceType['chart-account']}:*`,
    [ResourceType.movement]: `${ResourceType.movement}:*`,
    [ResourceType['audit-log']]: `${ResourceType['audit-log']}:*`,
    [ResourceType['measurement-control']]: `${ResourceType['measurement-control']}:*`,
    [ResourceType['period-planning']]: `${ResourceType['period-planning']}:*`,
    [ResourceType.business]: `${ResourceType.business}:*`,
} satisfies Record<ResourceType, `${ResourceType}:*`>;

/**
 * Genera automáticamente todos los permisos wildcard para TODOS los recursos del ResourceType
 * TypeScript validará en tiempo de compilación que todos los recursos están siendo procesados
 * Si falta alguno, aparecerá un error de tipado en rojo en el IDE
 *
 * La validación se hace comparando con ALL_RESOURCE_WILDCARD_PERMISSIONS que debe tener
 * todos los recursos del enum. Si falta alguno allí, TypeScript mostrará un error.
 */
function generateAllAdminPermissions(): string[] {
    const permissions: string[] = [];

    // Iterar sobre todos los valores del enum ResourceType
    // TypeScript validará que ALL_RESOURCE_WILDCARD_PERMISSIONS tiene todos los valores
    for (const resource of Object.values(ResourceType) as ResourceType[]) {
        // Esta línea causará un error de tipado si falta algún recurso en ALL_RESOURCE_WILDCARD_PERMISSIONS
        const permission: `${ResourceType}:*` = ALL_RESOURCE_WILDCARD_PERMISSIONS[resource];
        permissions.push(permission);
    }

    return permissions;
}

/**
 * Lista de roles a crear en el sistema
 * Agregar aquí todos los roles que el sistema necesita
 */
export const ROLES_CONFIG: RoleConfig[] = [
    {
        name: 'Administrador',
        description: 'Administrador con acceso completo al sistema',
        isDefault: true,
        // Generar automáticamente todos los permisos wildcard para todos los recursos
        // Esto garantiza que nunca falte ningún permiso, incluso si se agregan nuevos recursos
        permissions: generateAllAdminPermissions(),
    },
    {
        name: 'Operador',
        description: 'Operador con permisos limitados para operaciones básicas',
        isDefault: true,
        permissions: [
            // Solo lectura de usuarios y roles
            'user:read',
            'role:read',
            // Clientes - Solo lectura y creación
            'customer:read',
            'customer:create',
            // Proveedores - Solo lectura y creación
            'supplier:read',
            'supplier:create',
            // Talleres - Solo lectura y creación
            'workshop:read',
            'workshop:create',
            // Trabajadores - Solo lectura y creación
            'worker:read',
            'worker:create',
            // Catálogos - Solo lectura
            'garment-type:read',
            'material:read',
            'labor:read',
            'size:read',
            // Plantillas - Solo lectura
            'garment-template:read',
            // Cotizaciones - Solo lectura y creación
            'quotation:read',
            'quotation:create',
            // Órdenes - Solo lectura
            'purchase-order:read',
            // Producción - Solo lectura
            'production-assignment:read',
            'progress-history:read',
            // Pagos - Solo lectura
            'payment:read',
            // Finanzas - Solo lectura
            'account-receivable:read',
            'account-payable:read',
            'movement:read',
            // Planificaciones por período - Solo lectura
            'period-planning:read',
            // Control de medidas - Solo lectura y creación
            'measurement-control:read',
            'measurement-control:create',
        ],
    },
];

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
 * Constante que mapea los recursos básicos a sus permisos wildcard
 * Solo incluye los recursos disponibles en el template
 */
const ALL_RESOURCE_WILDCARD_PERMISSIONS = {
    [ResourceType.user]: `${ResourceType.user}:*`,
    [ResourceType.role]: `${ResourceType.role}:*`,
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
        name: 'Super Administrador',
        description: 'Super Administrador con acceso completo y privilegios máximos al sistema',
        isDefault: false,
        // Generar automáticamente todos los permisos wildcard para todos los recursos
        // Esto garantiza que nunca falte ningún permiso, incluso si se agregan nuevos recursos
        permissions: generateAllAdminPermissions(),
    },
    {
        name: 'Administrador',
        description: 'Administrador con acceso completo al sistema',
        isDefault: true,
        // Generar automáticamente todos los permisos wildcard para todos los recursos
        // Esto garantiza que nunca falte ningún permiso, incluso si se agregan nuevos recursos
        permissions: generateAllAdminPermissions(),
    },
    {
        name: 'Asistente Administrativo',
        description: 'Asistente administrativo con permisos limitados para operaciones de apoyo al administrador',
        isDefault: false,
        permissions: [
            // Lectura completa de usuarios y roles
            'user:read',
            'role:read',
            // Permisos limitados de gestión de usuarios (sin eliminar)
            'user:create',
            'user:update',
            'user:activate',
            'user:deactivate',
            // Sin permisos de eliminación ni gestión de roles
        ],
    },
];

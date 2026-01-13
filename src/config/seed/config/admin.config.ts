/**
 * Configuración del usuario administrador
 * Define los datos del usuario administrador que se creará automáticamente
 *
 * Nota: El email y password se obtienen de las variables de entorno:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 */
export interface AdminConfig {
    name: string;
    lastName: string;
    idDocumentType: string;
    idNumber: string;
    post: string;
    phone: string;
    address: string;
    roleNames: string[]; // Nombres de roles a asignar al admin
}

/**
 * Configuración base del administrador
 * Los campos email y password se obtienen de las variables de entorno
 */
export const ADMIN_CONFIG: AdminConfig = {
    name: 'Administrador',
    lastName: 'Sistema',
    idDocumentType: 'DNI',
    idNumber: '29263967', // Puede cambiarse o obtenerse de env
    post: 'Administrador',
    phone: '+51998050028',
    address: 'Dirección del sistema',
    roleNames: ['Administrador'], // Roles a asignar al admin
};

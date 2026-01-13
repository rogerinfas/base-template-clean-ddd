import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
    path: `.env`,
});

// # =============================================================================
// # CONFIGURACIÓN GENERAL DE LA APLICACIÓN
// # =============================================================================

// # Entorno de ejecución: development | production | test
// NODE_ENV="development"

// # Puerto en el que se ejecutará la aplicación
// PORT=4000

// # =============================================================================
// # CONFIGURACIÓN DE BASE DE DATOS
// # =============================================================================

// # URL de conexión a la base de datos PostgreSQL
// # Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd?schema=public
// DATABASE_URL="postgresql://root:root@localhost:5432/workwear?schema=public"

// # =============================================================================
// # CONFIGURACIÓN DE BETTER AUTH
// # =============================================================================

// # Secret key para Better Auth (cambiar en producción)
// # Generar un secret seguro: openssl rand -base64 32
// BETTER_AUTH_SECRET="dev-secret-change-in-production"

// # URL base de Better Auth (debe coincidir con la URL de la aplicación)
// BETTER_AUTH_URL="http://localhost:4000"

// # Dominio para cookies entre subdominios (opcional)
// # BETTER_AUTH_DOMAIN=".workwear.com"

// # =============================================================================
// # CONFIGURACIÓN DE SESIONES
// # =============================================================================

// # Tiempo de expiración de la sesión (formato: 15m, 1h, 7d, etc.)
// SESSION_EXPIRED_IN="15m"

// # Tiempo de actualización de la sesión (formato: 15m, 1h, 7d, etc.)
// SESSION_UPDATE_AGE="15m"

// # =============================================================================
// # CONFIGURACIÓN DE URLs Y CORS
// # =============================================================================

// # URL del frontend/web (para CORS y redirecciones)
// WEB_URL="http://localhost:3000"

// # URL del frontend (alternativa)
// FRONTEND_URL="http://localhost:3000"

// # =============================================================================
// # CONFIGURACIÓN DE RATE LIMITING (THROTTLER)
// # =============================================================================

// # Tiempo de vida de la ventana de throttling en segundos
// THROTTLER_TTL=60

// # Número máximo de solicitudes permitidas en la ventana de tiempo
// THROTTLER_LIMIT=60

// # User agents a ignorar en el throttling (separados por comas)
// # THROTTLER_IGNORE_USER_AGENTS="bot,crawler"

// # =============================================================================
// # CONFIGURACIÓN DE CORREO ELECTRÓNICO
// # =============================================================================

// # Host del servidor SMTP
// MAIL_HOST="sandbox.smtp.mailtrap.io"

// # Puerto del servidor SMTP (587 para TLS, 465 para SSL)
// MAIL_PORT=2525

// # Usuario del servidor SMTP
// MAIL_USER="8a78c9a5ec9e39"

// # Contraseña del servidor SMTP
// MAIL_PASSWORD="2225a4737ac48b"

// # Dirección de correo desde la cual se enviarán los emails
// MAIL_FROM="no-reply@ejemplo.com"

// # Usar conexión segura (true para SSL/TLS, false para conexión no segura)
// MAIL_SECURE="false"

// # Directorio de plantillas de correo (opcional, por defecto usa templates/)
// # MAIL_TEMPLATES_DIR="./src/templates"

// # =============================================================================
// # CONFIGURACIÓN DE NEGOCIO
// # =============================================================================

// # Nombre de la empresa/negocio
// BUSINESS_NAME="Work Wear Industrial E.I.R.L."

// # =============================================================================
// # INICIALIZACIÓN DEL SISTEMA (SEEDS)
// # =============================================================================

// # Usuario administrador base que se crea automáticamente al iniciar la aplicación
// # Solo se crea si no existe (evita duplicados)
// # Estas variables son opcionales: si no se configuran, se omite la creación del usuario admin

// # Email del usuario administrador base
// ADMIN_EMAIL="admin@admin.com"

// # Contraseña del usuario administrador base
// # IMPORTANTE: Cambiar esta contraseña en producción
// ADMIN_PASSWORD="Admin1234!"

// # =============================================================================
// # CONFIGURACIÓN DE SUNAT RUC
// # =============================================================================
// API_PERU_DEV_URL="https://apiperu.dev/api/"
// API_PERU_TOKEN=""

// # =============================================================================
// # CONFIGURACIÓN DE EXCEL
// # =============================================================================
// EXCEL_COMPANY_NAME="Work Wear E.I.R.L"
// EXCEL_LOGO_PATH="src/assets/logo.webp"

type GeneralEnvVars = {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    FRONTEND_URL: string;
    WEB_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    BETTER_AUTH_DOMAIN?: string;
    SESSION_EXPIRED_IN: string;
    SESSION_UPDATE_AGE: string;
    THROTTLER_TTL: string;
    THROTTLER_LIMIT: string;
    THROTTLER_IGNORE_USER_AGENTS?: string;
    MAIL_HOST?: string;
    MAIL_PORT?: string;
    MAIL_USER?: string;
    MAIL_PASSWORD?: string;
    MAIL_FROM?: string;
    MAIL_SECURE?: string;
    MAIL_TEMPLATES_DIR?: string;
    BUSINESS_NAME: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    API_PERU_DEV_URL: string;
    API_PERU_TOKEN: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
    R2_REGION: string;
    EXCEL_COMPANY_NAME: string;
    EXCEL_LOGO_PATH?: string;
};

const envsSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        PORT: z.string().default('4000'),
        DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
        FRONTEND_URL: z.string().url().default('http://localhost:3000'),
        WEB_URL: z.url().default('http://localhost:3000'),
        BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
        BETTER_AUTH_URL: z.url().default('http://localhost:4000'),
        BETTER_AUTH_DOMAIN: z.string().optional(),
        SESSION_EXPIRED_IN: z.string().default('15m'),
        SESSION_UPDATE_AGE: z.string().default('15m'),
        THROTTLER_TTL: z.string().default('60'),
        THROTTLER_LIMIT: z.string().default('60'),
        THROTTLER_IGNORE_USER_AGENTS: z.string().optional(),
        MAIL_HOST: z.string().optional(),
        MAIL_PORT: z.string().optional(),
        MAIL_USER: z.string().optional(),
        MAIL_PASSWORD: z.string().optional(),
        MAIL_FROM: z.email().optional(),
        MAIL_SECURE: z.string().optional(),
        MAIL_TEMPLATES_DIR: z.string().optional(),
        BUSINESS_NAME: z.string().default('Work Wear Industrial E.I.R.L.'),
        ADMIN_EMAIL: z.email(),
        ADMIN_PASSWORD: z.string(),
        API_PERU_DEV_URL: z.string().min(1, 'API_PERU_DEV_URL is required').default('https://apiperu.dev/api/'),
        API_PERU_TOKEN: z.string().min(1, 'API_PERU_TOKEN is required'),
        R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),
        R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
        R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
        R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
        R2_REGION: z.string().default('auto'),
        EXCEL_COMPANY_NAME: z.string().min(1, 'EXCEL_COMPANY_NAME is required'),
        EXCEL_LOGO_PATH: z.string().optional(),
    })
    .loose() satisfies z.ZodType<GeneralEnvVars>;

// Zod's parse() method automatically throws errors if validation fails
const result = envsSchema.safeParse(process.env);
if (!result.success) {
    throw new Error(`Config validation error: ${result.error.message}`);
}
const envVars = result.data;

export const generalEnvs: GeneralEnvVars = {
    NODE_ENV: envVars.NODE_ENV,
    PORT: envVars.PORT,
    DATABASE_URL: envVars.DATABASE_URL,
    FRONTEND_URL: envVars.FRONTEND_URL,
    WEB_URL: envVars.WEB_URL,
    BETTER_AUTH_SECRET: envVars.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: envVars.BETTER_AUTH_URL,
    BETTER_AUTH_DOMAIN: envVars.BETTER_AUTH_DOMAIN,
    SESSION_EXPIRED_IN: envVars.SESSION_EXPIRED_IN,
    SESSION_UPDATE_AGE: envVars.SESSION_UPDATE_AGE,
    THROTTLER_TTL: envVars.THROTTLER_TTL,
    THROTTLER_LIMIT: envVars.THROTTLER_LIMIT,
    THROTTLER_IGNORE_USER_AGENTS: envVars.THROTTLER_IGNORE_USER_AGENTS,
    MAIL_HOST: envVars.MAIL_HOST,
    MAIL_PORT: envVars.MAIL_PORT,
    MAIL_USER: envVars.MAIL_USER,
    MAIL_PASSWORD: envVars.MAIL_PASSWORD,
    MAIL_FROM: envVars.MAIL_FROM,
    MAIL_SECURE: envVars.MAIL_SECURE,
    MAIL_TEMPLATES_DIR: envVars.MAIL_TEMPLATES_DIR,
    BUSINESS_NAME: envVars.BUSINESS_NAME,
    ADMIN_EMAIL: envVars.ADMIN_EMAIL,
    ADMIN_PASSWORD: envVars.ADMIN_PASSWORD,
    API_PERU_DEV_URL: envVars.API_PERU_DEV_URL,
    API_PERU_TOKEN: envVars.API_PERU_TOKEN,
    R2_ACCOUNT_ID: envVars.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: envVars.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: envVars.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: envVars.R2_BUCKET_NAME,
    R2_REGION: envVars.R2_REGION,
    EXCEL_COMPANY_NAME: envVars.EXCEL_COMPANY_NAME,
    EXCEL_LOGO_PATH: envVars.EXCEL_LOGO_PATH,
} as const;

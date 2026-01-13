import { PrismaClient } from '@prisma/client';
import type { BetterAuthPlugin } from 'better-auth';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';
import { BETTER_AUTH_COOKIE_PREFIX } from '@shared/constants/auth';

// Crear una instancia de PrismaClient para Better Auth
// Esta instancia se comparte con PrismaService
const prismaClient = new PrismaClient();

// Plugin personalizado para validar usuario activo
const validateActiveUserPlugin = {
    id: 'validate-active-user',
    hooks: {
        before: [
            {
                matcher: (context) => context.path?.includes('/sign-in'),
                handler: async (ctx) => {
                    const body = ctx.body as unknown as Record<string, unknown> | undefined;
                    const email = body?.email;

                    if (email && typeof email === 'string') {
                        const user = await prismaClient.user.findUnique({
                            where: { email },
                            select: { isActive: true },
                        });

                        if (user && !user.isActive) {
                            throw new APIError('FORBIDDEN', {
                                message: 'Tu cuenta está inactiva. Por favor contacta al administrador.',
                            });
                        }
                    }
                },
            },
            {
                matcher: (context) => context.path?.includes('/request-password-reset'),
                handler: async () => {
                    // No hacer nada aquí, la validación se hará en sendResetPassword
                    // para mantener el fallo silencioso (no revelar si el usuario existe o está activo)
                },
            },
        ],
    },
} satisfies BetterAuthPlugin;

export const auth = betterAuth({
    database: prismaAdapter(prismaClient, {
        provider: 'postgresql',
    }),

    plugins: [openAPI(), validateActiveUserPlugin],

    user: {
        changeEmail: {
            enabled: true,
        },
        additionalFields: {
            // Campos adicionales del usuario que Better Auth manejará
            lastName: {
                type: 'string',
                required: false,
            },
            idDocumentType: {
                type: 'string',
                required: false,
                defaultValue: 'DNI',
            },
            idNumber: {
                type: 'string',
                required: false,
            },
            phone: {
                type: 'string',
                required: false,
            },
            address: {
                type: 'string',
                required: false,
            },
            post: {
                type: 'string',
                required: false,
            },
            isActive: {
                type: 'boolean',
                required: false,
                defaultValue: true,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        // Configuración para reset de contraseña
        resetPasswordTokenExpiresIn: 3600, // 1 hora en segundos
        sendResetPassword: async ({ user, url, token }) => {
            // Verificar si el usuario está activo antes de enviar el email
            // Si está inactivo, no enviar el email (fallo silencioso por seguridad)
            const dbUser = await prismaClient.user.findUnique({
                where: { email: user.email },
                select: { isActive: true },
            });

            // Si el usuario no existe o está inactivo, no enviar el email
            // Esto mantiene el fallo silencioso (no revela si el email existe o está activo)
            if (!dbUser || !dbUser.isActive) {
                // Simplemente retornar sin enviar el email
                // Better Auth retornará éxito pero no se enviará ningún correo
                return;
            }

            // La función se ejecuta cuando se llama, no cuando se configura
            // Por lo tanto, el helper ya debería estar inicializado
            // Usamos require para evitar problemas de TypeScript con import dinámico
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PasswordResetEmailHelper } = require('./helpers/password-reset-email.helper');
            await PasswordResetEmailHelper.sendPasswordResetEmail(user, url, token);
        },
        onPasswordReset: async () => {
            // No hacer nada aquí, la validación se hará en sendResetPassword
            // para mantener el fallo silencioso (no revelar si el usuario existe o está activo)
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 días - Duración máxima del token
        updateAge: 60 * 60 * 24 * 7, // Refresh cada 7 días - Extiende la sesión automáticamente
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7, // 7 días - Cache se actualiza con el refresh
        },
    },

    rateLimit: {
        window: 60, // 1 minuto
        max: 100,
        storage: 'memory',
    },

    // NestJS Better Auth requiere array estático (no soporta funciones)
    // Incluir IPs privadas comunes para desarrollo en red local
    trustedOrigins: [
        process.env.WEB_URL || 'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:4000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:4000',
    ],

    logger: {
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
        verboseLogging: process.env.NODE_ENV !== 'production',
    },

    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    advanced: {
        database: {
            generateId: false,
        },
        crossSubDomainCookies: {
            // Solo habilitar en producción cuando hay un dominio configurado
            enabled: process.env.NODE_ENV === 'production' && !!process.env.BETTER_AUTH_DOMAIN,
            domain: process.env.BETTER_AUTH_DOMAIN,
        },
        useSecureCookies: process.env.NODE_ENV === 'production',
        cookiePrefix: BETTER_AUTH_COOKIE_PREFIX,
        defaultCookieAttributes: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            // En desarrollo usar 'lax' para permitir cookies en mismo sitio
            // En producción usar 'none' + secure para cross-origin
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 días
        },
    },

    // Habilitar sistema de hooks (necesario para @thallesp/nestjs-better-auth)
    hooks: {},
});

// Tipos exportados
export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session;


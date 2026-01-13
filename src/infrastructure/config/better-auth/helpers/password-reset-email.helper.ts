/**
 * Helper para enviar emails de reset de contraseña desde Better Auth
 * 
 * NOTA: Por ahora está simplificado. Si necesitas enviar emails,
 * puedes integrar @nestjs-modules/mailer o tu servicio de email preferido.
 */
export class PasswordResetEmailHelper {
    private static mailerServiceInstance: any | null = null;

    /**
     * Inicializa el helper con la instancia de MailerService (opcional)
     * Debe ser llamado después de que NestJS esté inicializado
     */
    static initialize(mailerService?: any): void {
        PasswordResetEmailHelper.mailerServiceInstance = mailerService;
    }

    /**
     * Envía un email de reset de contraseña
     * @param user Usuario que solicita el reset
     * @param resetUrl URL completa para resetear la contraseña
     * @param token Token de reset (opcional, para logging)
     */
    static async sendPasswordResetEmail(
        user: { email: string; name: string },
        resetUrl: string,
        token?: string,
    ): Promise<void> {
        // Si hay un mailerService configurado, usarlo
        if (PasswordResetEmailHelper.mailerServiceInstance) {
            try {
                await PasswordResetEmailHelper.mailerServiceInstance.sendMail({
                    to: user.email,
                    subject: 'Restablecer tu contraseña',
                    template: 'reset-password',
                    context: {
                        name: user.name,
                        email: user.email,
                        resetUrl,
                        tokenExpirationHours: 1,
                    },
                });
                return;
            } catch (error) {
                console.error(`Failed to send password reset email to ${user.email}:`, error);
                throw error;
            }
        }

        // Si no hay mailerService, solo loggear (para desarrollo)
        console.log('Password reset email (not sent - no mailer configured):', {
            to: user.email,
            resetUrl,
        });
    }
}


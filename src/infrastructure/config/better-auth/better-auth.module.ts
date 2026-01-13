import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './better-auth.config';
import { PasswordResetEmailHelper } from './helpers/password-reset-email.helper';

@Module({
    imports: [
        ConfigModule,
        // Integración del paquete nestjs-better-auth
        AuthModule.forRoot({
            auth,
            // Auto-configura CORS para los orígenes confiables
            disableTrustedOriginsCors: false,
            // Auto-configura el body parser
            disableBodyParser: false,
            // Guard global automático (protege todas las rutas por defecto)
            disableGlobalAuthGuard: false,
        }),
    ],
})
export class BetterAuthModule implements OnModuleInit {
    onModuleInit() {
        // Inicializar el helper de password reset (opcional, si tienes MailerService)
        // Si tienes @nestjs-modules/mailer, puedes inyectarlo aquí:
        // PasswordResetEmailHelper.initialize(this.mailerService);
        PasswordResetEmailHelper.initialize();
    }
}


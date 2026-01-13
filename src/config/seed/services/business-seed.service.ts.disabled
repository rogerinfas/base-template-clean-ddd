import { CreateBankAccountCommand } from '@app/business/application/bank-account/commands/create-bank-account.command.use-case';
import { CreateBusinessCommand } from '@app/business/application/business/commands/create-business.command.use-case';
import { CreateSelfContactCommand } from '@app/business/application/self-contact/commands/create-self-contact.command.use-case';
import { BankAccount } from '@app/business/domain/entities/bank-account/bank-account.entity';
import { Business } from '@app/business/domain/entities/business/business.entity';
import { SelfContact } from '@app/business/domain/entities/self-contact/self-contact.entity';
import type { IBusinessRepository } from '@app/business/domain/interfaces/business.repository.interface';
import {
    BUSINESS_REPOSITORY,
    SELF_CONTACT_REPOSITORY,
} from '@app/business/domain/interfaces/repositories-interface.providers';
import type { ISelfContactRepository } from '@app/business/domain/interfaces/self-contact.repository.interface';
import { CurrencyEnum } from '@app/business/domain/vo/currency.vo';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import { BUSINESS_SEED_CONFIG, BusinessSeedConfig } from '../config/business.config';

// Tipo para archivos de Multer (compatible con CreateBusinessCommand)
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    filename?: string;
}

/**
 * Servicio de Seed de Empresa
 *
 * Este servicio crea la empresa principal del sistema basándose en la configuración
 * definida en business.config.ts.
 *
 * Características:
 * - Idempotente: No crea duplicados si la empresa ya existe (verifica por prefijo y RUC)
 * - Resiliente: Continúa aunque falle la subida del logo
 * - Logo automático: Sube el logo desde assets/logo.webp si existe
 *
 * Estrategia de identificación:
 * - Verifica si existe una empresa con el mismo prefijo
 * - Verifica si existe una empresa con el mismo RUC
 * - Si no existe ninguna, crea la nueva empresa
 */
@Injectable()
export class BusinessSeedService {
    private readonly logger = new Logger(BusinessSeedService.name);

    constructor(
        @Inject(BUSINESS_REPOSITORY)
        private readonly businessRepository: IBusinessRepository,
        @Inject(SELF_CONTACT_REPOSITORY)
        private readonly selfContactRepository: ISelfContactRepository,
        private readonly commandBus: CommandBus,
    ) {}

    /**
     * Crea la empresa definida en la configuración
     * @param businessConfig Configuración de empresa a crear (opcional, usa BUSINESS_SEED_CONFIG por defecto)
     */
    async seedBusiness(businessConfig: BusinessSeedConfig = BUSINESS_SEED_CONFIG): Promise<void> {
        this.logger.log('🏢 Inicializando empresa principal del sistema...');

        try {
            // Verificar si ya existe una empresa con el mismo prefijo
            const existingByPrefix = await this.businessRepository.findByPrefix(businessConfig.prefix);
            if (existingByPrefix) {
                this.logger.log(`⏭️  Empresa con prefijo "${businessConfig.prefix}" ya existe, omitiendo creación`);
                return;
            }

            // Verificar si ya existe una empresa con el mismo RUC
            const existingByRuc = await this.businessRepository.findByRuc(businessConfig.ruc);
            if (existingByRuc) {
                this.logger.log(`⏭️  Empresa con RUC "${businessConfig.ruc}" ya existe, omitiendo creación`);
                return;
            }

            // Intentar cargar el logo desde assets
            let logoFile: MulterFile | undefined;
            try {
                // Determinar el nombre del logo basado en el prefix
                // Para IMC busca logo_imc.webp, para otros busca logo.webp
                const logoFileName = businessConfig.prefix === 'IMC' ? 'logo_imc.webp' : 'logo.webp';

                // Intentar múltiples rutas posibles para el logo
                const possiblePaths = [
                    path.join(process.cwd(), 'src', 'assets', logoFileName),
                    path.join(__dirname, '..', '..', '..', 'assets', logoFileName),
                    path.join(process.cwd(), 'assets', logoFileName),
                ];

                let logoPath: string | null = null;
                for (const possiblePath of possiblePaths) {
                    if (fs.existsSync(possiblePath)) {
                        logoPath = possiblePath;
                        break;
                    }
                }

                if (logoPath) {
                    const logoBuffer = fs.readFileSync(logoPath);
                    const stats = fs.statSync(logoPath);

                    logoFile = {
                        fieldname: 'logo',
                        originalname: logoFileName,
                        encoding: '7bit',
                        mimetype: 'image/webp',
                        size: stats.size,
                        buffer: logoBuffer,
                        filename: logoFileName,
                    };

                    this.logger.log(`📷 Logo encontrado en ${logoPath} (${(stats.size / 1024).toFixed(2)} KB)`);
                } else {
                    this.logger.warn(
                        `⚠️  Logo no encontrado en ninguna de las rutas posibles: ${possiblePaths.join(
                            ', ',
                        )}. Se creará la empresa sin logo`,
                    );
                }
            } catch (error) {
                this.logger.warn('⚠️  Error al cargar el logo, se creará la empresa sin logo', error);
            }

            // Crear la entidad Business
            const business = new Business({
                prefix: businessConfig.prefix,
                name: businessConfig.name,
                ruc: businessConfig.ruc,
                address: businessConfig.address,
                color: businessConfig.color,
                isActive: true,
                // logoUrl se manejará automáticamente por el comando si hay logoFile
            });

            // Intentar crear la empresa con el logo, pero si falla la subida del logo, crear sin logo
            let createdBusiness: Business;
            try {
                // Ejecutar el comando de creación del business con el logo si existe
                createdBusiness = await this.commandBus.execute(new CreateBusinessCommand(business, logoFile));
            } catch (error) {
                // Si falla por error de subida de logo (Cloudflare R2), intentar crear sin logo
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (
                    errorMessage.includes('signature') ||
                    errorMessage.includes('Cloudflare') ||
                    errorMessage.includes('R2') ||
                    errorMessage.includes('subir archivo')
                ) {
                    this.logger.warn(
                        `⚠️  Error al subir el logo a Cloudflare R2, creando empresa sin logo: ${errorMessage}`,
                    );
                    // Intentar crear la empresa sin logo
                    createdBusiness = await this.commandBus.execute(new CreateBusinessCommand(business, undefined));
                } else {
                    // Si es otro tipo de error, re-lanzarlo
                    throw error;
                }
            }

            this.logger.log(
                `✅ Empresa creada: ${businessConfig.name} (${businessConfig.prefix})${
                    createdBusiness.logoUrl ? ' con logo' : ' sin logo (error en subida)'
                }`,
            );

            // Crear la cuenta bancaria si está configurada
            if (businessConfig.bankAccount) {
                try {
                    const bankAccount = new BankAccount({
                        accountNumber: businessConfig.bankAccount.accountNumber,
                        accountCci: businessConfig.bankAccount.accountCci,
                        accountType: businessConfig.bankAccount.accountType,
                        bankName: businessConfig.bankAccount.bankName,
                        accountHolder: businessConfig.bankAccount.accountHolder,
                        currency: businessConfig.bankAccount.currency as CurrencyEnum,
                        businessId: createdBusiness.id,
                        isActive: true,
                    });

                    await this.commandBus.execute(new CreateBankAccountCommand(bankAccount));

                    this.logger.log(
                        `✅ Cuenta bancaria creada: ${businessConfig.bankAccount.bankName} - ${businessConfig.bankAccount.accountNumber}`,
                    );
                } catch (error) {
                    this.logger.warn(
                        '⚠️  Error al crear cuenta bancaria, continuando...',
                        error instanceof Error ? error : new Error(String(error)),
                    );
                }
            }

            // Crear el contacto interno si está configurado
            if (businessConfig.selfContact) {
                try {
                    // Verificar si ya existe un contacto con el mismo email o teléfono EN LA MISMA EMPRESA
                    let existingContact = null;
                    if (businessConfig.selfContact.email) {
                        const contactByEmail = await this.selfContactRepository.findByEmail(
                            businessConfig.selfContact.email,
                        );
                        // Solo considerar si pertenece a la misma empresa
                        if (contactByEmail && contactByEmail.businessId === createdBusiness.id) {
                            existingContact = contactByEmail;
                        }
                    }
                    if (!existingContact && businessConfig.selfContact.phone) {
                        const contactByPhone = await this.selfContactRepository.findByPhone(
                            businessConfig.selfContact.phone,
                        );
                        // Solo considerar si pertenece a la misma empresa
                        if (contactByPhone && contactByPhone.businessId === createdBusiness.id) {
                            existingContact = contactByPhone;
                        }
                    }

                    if (existingContact) {
                        this.logger.log(
                            `⏭️  Contacto interno con email "${businessConfig.selfContact.email || 'N/A'}" o teléfono "${
                                businessConfig.selfContact.phone || 'N/A'
                            }" ya existe en esta empresa, omitiendo creación`,
                        );
                    } else {
                        const selfContact = new SelfContact({
                            name: businessConfig.selfContact.name,
                            lastName: businessConfig.selfContact.lastName,
                            email: businessConfig.selfContact.email,
                            phone: businessConfig.selfContact.phone,
                            phone2: businessConfig.selfContact.phone2,
                            businessId: createdBusiness.id,
                            isActive: true,
                        });

                        await this.commandBus.execute(new CreateSelfContactCommand(selfContact));

                        this.logger.log(
                            `✅ Contacto interno creado: ${
                                businessConfig.selfContact.name
                            } ${businessConfig.selfContact.lastName || ''}`,
                        );
                    }
                } catch (error) {
                    this.logger.warn(
                        '⚠️  Error al crear contacto interno, continuando...',
                        error instanceof Error ? error : new Error(String(error)),
                    );
                }
            }
        } catch (error) {
            this.logger.error(
                `❌ Error al crear empresa ${businessConfig.name} (${businessConfig.prefix})`,
                error instanceof Error ? error : new Error(String(error)),
            );
            throw error; // Re-lanzar para que el sistema de inicialización lo maneje
        }
    }
}

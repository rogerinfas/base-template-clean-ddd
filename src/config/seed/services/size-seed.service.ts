import { Size } from '@domain/entities/size/size.entity';
import type { ISizeRepository } from '@domain/repositories/size/size.repository.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SIZE_REPOSITORY } from '@shared/constants/tokens';
import { SIZES_SEED_CONFIG, SizeSeedConfig } from '../config/sizes.config';

/**
 * Servicio de Seed de Tallas
 *
 * Este servicio crea las tallas estándar del sistema basándose en la configuración
 * definida en sizes.config.ts.
 *
 * Características:
 * - Idempotente: No crea duplicados si la talla ya existe (verifica por nombre y abreviatura)
 * - Optimizado: Carga todas las tallas existentes una sola vez para evitar queries repetidas
 * - Resiliente: Continúa aunque algunas tallas fallen al crearse
 *
 * Estrategia de identificación:
 * - Verifica si existe una talla con el mismo nombre (case-insensitive)
 * - Verifica si existe una talla con la misma abreviatura (case-insensitive)
 * - Si no existe ninguna, crea la nueva talla
 */
@Injectable()
export class SizeSeedService {
    private readonly logger = new Logger(SizeSeedService.name);

    constructor(
        @Inject(SIZE_REPOSITORY)
        private readonly sizeRepository: ISizeRepository,
    ) {}

    /**
     * Crea las tallas definidas en la configuración
     * @param sizesConfig Configuración de tallas a crear (opcional, usa SIZES_SEED_CONFIG por defecto)
     */
    async seedSizes(sizesConfig: SizeSeedConfig[] = SIZES_SEED_CONFIG): Promise<void> {
        this.logger.log('📏 Inicializando tallas base del sistema...');

        // Cargar todas las tallas existentes de una vez
        const existingPaginated = await this.sizeRepository.findManyPaginated({
            pagination: { page: 1, pageSize: 1000 }, // Asumimos que no habrá más de 1000 tallas
        });
        const existing = existingPaginated.data;

        // Crear mapas para búsqueda rápida (case-insensitive)
        const byName = new Map(existing.map((s) => [s.name.toLowerCase().trim(), s]));
        const byAbbreviation = new Map(existing.map((s) => [s.abbreviation.toUpperCase().trim(), s]));

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const config of sizesConfig) {
            try {
                const normalizedName = config.name.toLowerCase().trim();
                const normalizedAbbreviation = config.abbreviation.toUpperCase().trim();

                // Verificar si ya existe una talla con el mismo nombre o abreviatura
                const existingByName = byName.get(normalizedName);
                const existingByAbbreviation = byAbbreviation.get(normalizedAbbreviation);

                if (existingByName || existingByAbbreviation) {
                    skipped++;
                    continue;
                }

                // Crear la nueva talla
                const size = new Size({
                    name: normalizedName,
                    abbreviation: normalizedAbbreviation,
                    isActive: true,
                });

                await this.sizeRepository.create(size);

                // Actualizar los mapas para evitar duplicados en el mismo batch
                byName.set(normalizedName, size);
                byAbbreviation.set(normalizedAbbreviation, size);

                created++;
                this.logger.log(`✅ Talla creada: ${normalizedName} (${normalizedAbbreviation})`);
            } catch (error) {
                errors++;
                this.logger.error(
                    `❌ Error al crear talla ${config.name} (${config.abbreviation})`,
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        }

        if (created > 0 || skipped > 0) {
            this.logger.log(`✅ Tallas seed: ${created} creadas, ${skipped} ya existían`);
        }
        if (errors > 0) {
            this.logger.error(`❌ Errores al crear tallas: ${errors}`);
        }
    }
}

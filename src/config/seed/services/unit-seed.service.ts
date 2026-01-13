import { Unit } from '@domain/entities/unit/unit.entity';
import type { IUnitRepository } from '@domain/repositories/unit/unit.repository.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UNIT_REPOSITORY } from '@shared/constants/tokens';
import { UNITS_SEED_CONFIG, UnitSeedConfig } from '../config/units.config';

/**
 * Servicio de Seed de Unidades de Medida
 *
 * Este servicio crea las unidades de medida estándar del sistema para el rubro textil
 * basándose en la configuración definida en units.config.ts.
 *
 * Características:
 * - Idempotente: No crea duplicados si la unidad ya existe (verifica por nombre y abreviatura)
 * - Optimizado: Carga todas las unidades existentes una sola vez para evitar queries repetidas
 * - Resiliente: Continúa aunque algunas unidades fallen al crearse
 *
 * Estrategia de identificación:
 * - Verifica si existe una unidad con el mismo nombre (case-insensitive)
 * - Verifica si existe una unidad con la misma abreviatura (case-insensitive)
 * - Si no existe ninguna, crea la nueva unidad
 */
@Injectable()
export class UnitSeedService {
    private readonly logger = new Logger(UnitSeedService.name);

    constructor(
        @Inject(UNIT_REPOSITORY)
        private readonly unitRepository: IUnitRepository,
    ) {}

    /**
     * Crea las unidades definidas en la configuración
     * @param unitsConfig Configuración de unidades a crear (opcional, usa UNITS_SEED_CONFIG por defecto)
     */
    async seedUnits(unitsConfig: UnitSeedConfig[] = UNITS_SEED_CONFIG): Promise<void> {
        this.logger.log('📐 Inicializando unidades de medida base del sistema (rubro textil)...');

        // Cargar todas las unidades existentes de una vez
        const existingPaginated = await this.unitRepository.findManyPaginated({
            pagination: { page: 1, pageSize: 1000 }, // Asumimos que no habrá más de 1000 unidades
        });
        const existing = existingPaginated.data;

        // Crear mapas para búsqueda rápida (case-insensitive)
        const byName = new Map(existing.map((u) => [u.name.toLowerCase().trim(), u]));
        const byAbbreviation = new Map(existing.map((u) => [u.abbreviation.toLowerCase().trim(), u]));

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const config of unitsConfig) {
            try {
                const normalizedName = config.name.trim();
                const normalizedAbbreviation = config.abbreviation.trim();

                // Verificar si ya existe una unidad con el mismo nombre o abreviatura
                const existingByName = byName.get(normalizedName.toLowerCase());
                const existingByAbbreviation = byAbbreviation.get(normalizedAbbreviation.toLowerCase());

                if (existingByName || existingByAbbreviation) {
                    skipped++;
                    continue;
                }

                // Crear la nueva unidad
                const unit = Unit.create({
                    name: normalizedName,
                    abbreviation: normalizedAbbreviation,
                    description: config.description,
                    isActive: true,
                });

                await this.unitRepository.create(unit);

                // Actualizar los mapas para evitar duplicados en el mismo batch
                byName.set(normalizedName.toLowerCase(), unit);
                byAbbreviation.set(normalizedAbbreviation.toLowerCase(), unit);

                created++;
                this.logger.log(`✅ Unidad creada: ${normalizedName} (${normalizedAbbreviation})`);
            } catch (error) {
                errors++;
                this.logger.error(
                    `❌ Error al crear unidad ${config.name} (${config.abbreviation})`,
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        }

        if (created > 0 || skipped > 0) {
            this.logger.log(`✅ Unidades seed: ${created} creadas, ${skipped} ya existían`);
        }
        if (errors > 0) {
            this.logger.error(`❌ Errores al crear unidades: ${errors}`);
        }
    }
}

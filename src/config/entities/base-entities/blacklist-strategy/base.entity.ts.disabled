//alternative strategy: blacklist, se asplica la documentacion de swagger directamente en la entidad y se excluyen las propiedades que no estan incluidas con @Exclude()
//Default: Strategia whitelist, los DTOS deben definirse explicitamente en la capa de presentacion
import { AuditDomainEvent } from '@app/audit/events/audit-domain.event';
import { AuditEventFactory } from '@app/audit/services/audit-event.factory';
import { EntityType } from '@app/audit/types/entity-type.type';
import { DomainEvent, IDomainEventsEntity } from '@config/ddd/base.domain-events.interface.ddd';
import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { SkipIfBlank } from '@presentation/decorators';
import { Exclude, instanceToPlain } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { BaseComposedEntityType, BaseEntityType } from '../base-entity.types';
import { BaseEntitiesMethods, ExtractNotUndefinedFieldsParams } from '../base-entity-methods.interface';

// ============================================================================
// AUDIT CONFIGURATION TYPES
// ============================================================================

/**
 * Configuración de auditoría para una entidad.
 * Define qué campos auditar y cómo identificar la entidad.
 *
 * @template T - Tipo de la entidad (opcional, para autocompletado de campos)
 */
export interface AuditConfig<T = Record<string, unknown>> {
    /** Tipo de entidad para auditoría (ej: 'Customer', 'Supplier') */
    entityType: EntityType | string;
    /** Nombre legible de la entidad en español (ej: 'Cliente', 'Proveedor') */
    entityDisplayName: string;
    /** Campo que contiene el nombre/identificador para mostrar (ej: 'name', 'email') */
    entityNameField?: keyof T | string;
    /** Campos a incluir en la auditoría de creación */
    createFields?: (keyof T | string)[];
    /** Campos a incluir en la auditoría de actualización */
    updateFields?: (keyof T | string)[];
    /** Campos a incluir en la auditoría de eliminación */
    deleteFields?: (keyof T | string)[];
    /** Si es true, audita todos los campos no-undefined en lugar de solo los especificados */
    auditAllFields?: boolean;
}

export abstract class BaseComposedIdEntity implements BaseComposedEntityType, BaseEntitiesMethods {
    @ApiProperty({
        description: 'Indicates whether the entity is active or not',
        example: true,
        required: true,
    })
    public isActive: boolean;

    @ApiProperty({
        description: 'Timestamp when the entity was created',
        example: new Date().toISOString(),
        required: true,
    })
    public readonly createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the entity was last updated',
        example: new Date().toISOString(),
        required: true,
    })
    public updatedAt: Date;

    @ApiProperty({
        description: 'Timestamp when the entity was deleted (for soft delete)',
        example: null,
        required: false,
    })
    public deletedAt?: Date;

    constructor(partial: Partial<BaseComposedEntityType>) {
        Object.assign(this, partial);
    }

    /** Verifica si la entidad ya fue persistida */
    @Exclude()
    get isPersisted(): boolean {
        return this.createdAt !== undefined && this.updatedAt !== undefined;
    }

    /** Marca intención de cambio; el repo puede rehidratar updatedAt con el valor real de DB. */
    touch() {
        this.updatedAt = new Date();
    }

    @Exclude()
    get isTouched(): boolean {
        return this.createdAt !== this.updatedAt;
    }

    softDelete(): void {
        this.isActive = false;
        this.deletedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.deletedAt = undefined;
    }

    toggleActive(): void {
        if (this.isActive && this.isActive === true) {
            this.softDelete();
        } else {
            this.activate();
        }
    }

    getNotUndefinedFields<T extends BaseComposedEntityType>({
        pick,
    }: ExtractNotUndefinedFieldsParams<T> = {}): Record<keyof T, unknown> {
        const result: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;
        (pick ?? (Object.keys(this) as Array<keyof T>)).forEach((key) => {
            const value = (this as unknown as T)[key];
            if (value !== undefined) {
                result[key] = value;
            }
        });
        return result;
    }

    /**
     * Convierte la entidad a un objeto plano (JSON) de manera recursiva siempre que se use @Type de class-transformer en las entidades anidadas.
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TCustomEntityDto extends BaseComposedIdEntity, TGroups extends string = string>(
        groups?: TGroups | TGroups[],
    ) {
        return instanceToPlain(this, {
            excludeExtraneousValues: false,
            // Si enviamos un grupo, class-transformer filtrará por ese grupo.
            // Si no enviamos nada, solo mostrará los @Expose() sin grupos.
            // Si es string lo volvemos array, si ya es array lo dejamos igual, si es undefined se queda undefined.
            groups: groups ? (Array.isArray(groups) ? groups : [groups]) : undefined,
        }) as TCustomEntityDto;
    }
}
export abstract class BaseEntity<TEntityDto extends object = object>
    extends BaseComposedIdEntity
    implements BaseEntityType, BaseEntitiesMethods
{
    @ApiProperty({
        description: 'Unique identifier for the entity',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true, //Required for openapi fetch
    })
    @SkipIfBlank()
    @IsUUID()
    public readonly id: string;

    constructor(partial: Partial<BaseEntityType>) {
        super(partial);
        Object.assign(this, partial);
    }
    /** Verifica si la entidad ya fue persistida */
    @Exclude()
    get isPersisted(): boolean {
        return this.id !== undefined && this.createdAt !== undefined && this.updatedAt !== undefined;
    }

    /** Marca intención de cambio; el repo puede rehidratar updatedAt con el valor real de DB. */
    touch() {
        this.updatedAt = new Date();
    }

    @Exclude()
    get isTouched(): boolean {
        return this.createdAt !== this.updatedAt;
    }

    softDelete(): void {
        this.isActive = false;
        this.deletedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.deletedAt = undefined;
    }

    toggleActive(): void {
        if (this.isActive && this.isActive === true) {
            this.softDelete();
        } else {
            this.activate();
        }
    }

    getNotUndefinedFields<T extends BaseComposedEntityType>({
        pick,
    }: ExtractNotUndefinedFieldsParams<T> = {}): Record<keyof T, unknown> {
        const result: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;
        (pick ?? (Object.keys(this) as Array<keyof T>)).forEach((key) => {
            const value = (this as unknown as T)[key];
            if (value !== undefined) {
                result[key] = value;
            }
        });
        return result;
    }

    /**
     * Convierte la entidad a un objeto plano (JSON) de manera recursiva siempre que se use @Type de class-transformer en las entidades anidadas.
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TGroups extends string = string, TCustomEntityDto extends object = TEntityDto>(groups?: TGroups | TGroups[]) {
        return instanceToPlain(this, {
            excludeExtraneousValues: false,
            // Si enviamos un grupo, class-transformer filtrará por ese grupo.
            // Si no enviamos nada, solo mostrará los @Expose() sin grupos.
            // Si es string lo volvemos array, si ya es array lo dejamos igual, si es undefined se queda undefined.
            groups: groups ? (Array.isArray(groups) ? groups : [groups]) : undefined,
        }) as TCustomEntityDto;
    }

    // ============================================================================
    // AUDIT METHODS - Métodos para automatizar la creación de eventos de auditoría
    // ============================================================================

    /**
     * Configuración de auditoría de la entidad.
     * Sobrescribir en cada entidad para definir campos específicos.
     *
     * @example
     * ```typescript
     * // En Contact entity:
     * protected override getAuditConfig(): AuditConfig<ContactType> {
     *     return {
     *         entityType: 'Contact',
     *         entityDisplayName: 'Contacto',
     *         entityNameField: 'name',
     *         createFields: ['name', 'email', 'phone'],
     *         updateFields: ['name', 'email', 'phone', 'position'],
     *     };
     * }
     * ```
     */
    protected getAuditConfig(): AuditConfig | undefined {
        return undefined;
    }

    /**
     * Obtiene el nombre para mostrar de la entidad basado en la configuración.
     */
    @Exclude()
    protected get auditEntityName(): string | undefined {
        const config = this.getAuditConfig();
        if (!config?.entityNameField) return undefined;
        return (this as unknown as Record<string, unknown>)[config.entityNameField as string] as string | undefined;
    }

    /**
     * Crea un evento de auditoría para CREACIÓN.
     * Usa la configuración de `getAuditConfig()` para determinar qué campos incluir.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     *
     * @example
     * ```typescript
     * const newContact = await this.contactRepository.create(contact);
     * const auditEvent = newContact.createAuditEvent();
     * this.domainEventsPublisher.publishEvent(auditEvent);
     * ```
     */
    public createAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const fields = config.createFields ?? (config.auditAllFields ? undefined : []);
        const newData = this.getNotUndefinedFields({
            pick: fields as (keyof BaseComposedEntityType)[] | undefined,
        });

        return AuditEventFactory.forCreate(
            config.entityType,
            this.id,
            newData,
            config.entityDisplayName,
            userId,
            customMessage,
        );
    }

    /**
     * Crea un evento de auditoría para ACTUALIZACIÓN.
     * Compara los datos originales con los actualizados para registrar los cambios.
     *
     * La lógica considera 3 instancias:
     * 1. `entityDto` - Los campos que llegaron del frontend (puede tener muchos undefined)
     * 2. `originalEntity` - La entidad existente en BD antes de actualizar (datos completos)
     * 3. `this` (updatedEntity) - La entidad después de persistir (valores reales actualizados)
     *
     * @param originalEntity - Entidad original antes de la actualización (del findById)
     * @param entityDto - DTO con los campos que se intentaron actualizar (opcional)
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     *
     * @example
     * ```typescript
     * const existingContact = await this.contactRepository.findById(id);
     * const updatedContact = await this.contactRepository.update({ id, entity });
     * const auditEvent = updatedContact.createUpdateAuditEvent(existingContact, entity);
     * this.domainEventsPublisher.publishEvent(auditEvent);
     * ```
     */
    public createUpdateAuditEvent<TEntity extends BaseEntity<TEntityDto>>(
        originalEntity: TEntity,
        entityDto?: Partial<TEntity>,
        userId?: string,
        customMessage?: string,
    ): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const dtoSource = entityDto ?? this;
        let fieldsToAudit: string[];

        if (entityDto) {
            const dtoFields =
                typeof (dtoSource as BaseEntity<TEntityDto>).getNotUndefinedFields === 'function'
                    ? (dtoSource as BaseEntity<TEntityDto>).getNotUndefinedFields()
                    : Object.fromEntries(Object.entries(dtoSource).filter(([_, v]) => v !== undefined));
            fieldsToAudit = Object.keys(dtoFields);

            if (config.updateFields && config.updateFields.length > 0) {
                const allowedFields = new Set(config.updateFields as string[]);
                fieldsToAudit = fieldsToAudit.filter((f) => allowedFields.has(f));
            }
        } else {
            fieldsToAudit = (config.updateFields as string[]) ?? [];
        }

        if (fieldsToAudit.length === 0) return undefined;

        const originalData = originalEntity.getNotUndefinedFields({
            pick: fieldsToAudit as (keyof BaseComposedEntityType)[],
        });

        const updatedData = this.getNotUndefinedFields({
            pick: fieldsToAudit as (keyof BaseComposedEntityType)[],
        });

        return AuditEventFactory.forUpdate(
            config.entityType,
            this.id,
            originalData,
            updatedData,
            config.entityDisplayName,
            userId,
            customMessage,
        );
    }

    /**
     * Crea un evento de auditoría para ELIMINACIÓN.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     */
    public createDeleteAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const fields = config.deleteFields ?? config.createFields ?? (config.auditAllFields ? undefined : []);
        const oldData = this.getNotUndefinedFields({
            pick: fields as (keyof BaseComposedEntityType)[] | undefined,
        });

        return AuditEventFactory.forDelete(
            config.entityType,
            this.id,
            oldData,
            config.entityDisplayName,
            userId,
            customMessage,
        );
    }

    /**
     * Crea un evento de auditoría para ACTIVACIÓN.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     */
    public createActivateAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        return AuditEventFactory.forActivate(
            config.entityType,
            this.id,
            config.entityDisplayName,
            userId,
            customMessage,
        );
    }

    /**
     * Crea un evento de auditoría para DESACTIVACIÓN.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     */
    public createDeactivateAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        return AuditEventFactory.forDeactivate(
            config.entityType,
            this.id,
            config.entityDisplayName,
            userId,
            customMessage,
        );
    }

    /**
     * Crea un evento de auditoría para TOGGLE (activar/desactivar).
     * Determina automáticamente si es activación o desactivación basado en isActive.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     */
    public createToggleAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        if (this.isActive) {
            return this.createActivateAuditEvent(userId, customMessage);
        } else {
            return this.createDeactivateAuditEvent(userId, customMessage);
        }
    }
}

/**
 * Para usar la serializacion por grupos se usa el siguiente decorador para que el interceptor pueda aplicar los grupos:
 * @SerializeOptions({ groups: ['admin'] }) // <--- Se usa este decorador para indicar la serializacion por grupos
 *
 * Los grupos se indican dinamicamente en los campos debidos: @Expose({ groups: ['admin'] }), tener en cuenta que en la documentacion se debe considerar como opcional el campo si se usa grupos.
 */
export abstract class BaseAggregateRootEntity<
        TEntityDto extends object = object,
        TDomainEvent extends DomainEvent = DomainEvent<string, object, string>,
        EventBase extends IEvent = IEvent,
    >
    extends AggregateRoot<EventBase>
    implements BaseEntityType, IDomainEventsEntity<TDomainEvent>, BaseEntitiesMethods
{
    @ApiProperty({
        description: 'Unique identifier for the entity',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true, //Required for openapi fetch
    })
    @SkipIfBlank()
    public readonly id: string;
    @ApiProperty({
        description: 'Indicates whether the entity is active or not',
        example: true,
        required: true,
    })
    public isActive: boolean;
    @ApiProperty({
        description: 'Timestamp when the entity was created',
        example: new Date().toISOString(),
        required: true,
    })
    public readonly createdAt: Date;
    @ApiProperty({
        description: 'Timestamp when the entity was last updated',
        example: new Date().toISOString(),
        required: true,
    })
    public updatedAt: Date;
    @ApiProperty({
        description: 'Timestamp when the entity was deleted (for soft delete)',
        example: null,
        required: false,
    })
    public deletedAt?: Date;
    /**
     * Lista de eventos de dominio (para publicar fuera de la transacción)
     */
    #domainEvents: TDomainEvent[] = [];

    /**
     * Agrega un evento de dominio a la lista interna.
     * @param event Evento de dominio a agregar
     */
    public addDomainEvent(event: TDomainEvent): void {
        this.domainEvents.push(event);
    }

    /**
     * Replaces the current list of domain events with the provided array of events.
     *
     * @param events - An array of domain events to set for this aggregate.
     */
    public set domainEvents(events: TDomainEvent[]) {
        this.#domainEvents = events;
    }

    /**
     * Obtiene y limpia los eventos de dominio acumulados.
     * @returns Array de eventos de dominio
     */
    public pullDomainEvents(): TDomainEvent[] {
        const events = [...this.domainEvents];
        this.domainEvents = [];
        return events;
    }

    /**
     * Obtiene los eventos de dominio actuales (sin limpiar).
     * @returns Array de eventos de dominio
     */
    @Exclude()
    public get domainEvents(): TDomainEvent[] {
        return this.#domainEvents;
    } //entity.domainEvents

    /**
     * Limpia todos los eventos de dominio acumulados.
     */
    public clearDomainEvents(): void {
        this.domainEvents = [];
    }

    doExistDomainEvent(eventType: Pick<TDomainEvent, 'eventType'>): boolean {
        return this.domainEvents.some((event) => event.eventType === eventType.eventType);
    }

    /** Verifica si la entidad ya fue persistida */
    @Exclude()
    get isPersisted(): boolean {
        return this.id !== undefined && this.createdAt !== undefined && this.updatedAt !== undefined;
    }

    touch(): void {
        this.updatedAt = new Date();
    }

    @Exclude()
    get isTouched(): boolean {
        return this.createdAt !== this.updatedAt;
    }

    softDelete(): void {
        this.isActive = false;
        this.deletedAt = new Date();
    }

    activate(): void {
        this.isActive = true;
        this.deletedAt = undefined;
    }

    toggleActive(): void {
        if (this.isActive && this.isActive === true) {
            this.softDelete();
        } else {
            this.activate();
        }
    }

    getNotUndefinedFields<T extends BaseComposedEntityType>({
        pick,
    }: ExtractNotUndefinedFieldsParams<T> = {}): Record<keyof T, unknown> {
        const result: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;
        (pick ?? (Object.keys(this) as Array<keyof T>)).forEach((key) => {
            const value = (this as unknown as T)[key];
            if (value !== undefined) {
                result[key] = value;
            }
        });
        return result;
    }

    constructor(partial: Partial<BaseAggregateRootEntity<TEntityDto, TDomainEvent, EventBase>>) {
        super();
        Object.assign(this, partial);
    }

    /**
     * Convierte la entidad a un objeto plano (JSON) de manera recursiva siempre que se use @Type de class-transformer en las entidades anidadas.
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TGroups extends string = string, TCustomEntityDto extends object = TEntityDto>(groups?: TGroups | TGroups[]) {
        return instanceToPlain(this, {
            excludeExtraneousValues: false,
            // Si enviamos un grupo, class-transformer filtrará por ese grupo.
            // Si no enviamos nada, solo mostrará los @Expose() sin grupos.
            // Si es string lo volvemos array, si ya es array lo dejamos igual, si es undefined se queda undefined.
            groups: groups ? (Array.isArray(groups) ? groups : [groups]) : undefined,
        }) as TCustomEntityDto;
    }

    // ============================================================================
    // AUDIT METHODS - Métodos para automatizar la creación de eventos de auditoría
    // ============================================================================

    /**
     * Configuración de auditoría de la entidad.
     * Sobrescribir en cada entidad para definir campos específicos.
     *
     * @example
     * ```typescript
     * // En Customer entity:
     * protected override getAuditConfig(): AuditConfig<CustomerType> {
     *     return {
     *         entityType: 'Customer',
     *         entityDisplayName: 'Cliente',
     *         entityNameField: 'name',
     *         createFields: ['name', 'email', 'idNumber', 'idDocumentType'],
     *         updateFields: ['name', 'email', 'idNumber', 'idDocumentType', 'address', 'phone'],
     *     };
     * }
     * ```
     */
    protected getAuditConfig(): AuditConfig | undefined {
        return undefined;
    }

    /**
     * Obtiene el nombre para mostrar de la entidad basado en la configuración.
     */
    @Exclude()
    protected get auditEntityName(): string | undefined {
        const config = this.getAuditConfig();
        if (!config?.entityNameField) return undefined;
        return (this as unknown as Record<string, unknown>)[config.entityNameField as string] as string | undefined;
    }

    /**
     * Crea y agrega un evento de auditoría para CREACIÓN.
     * Usa la configuración de `getAuditConfig()` para determinar qué campos incluir.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     *
     * @example
     * ```typescript
     * // En el command handler después de crear:
     * const newCustomer = await this.customerRepository.create(customer);
     * newCustomer.addCreateAuditEvent();
     * this.domainEventsPublisher.publishEventsForAggregate(newCustomer);
     * ```
     */
    public addCreateAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const fields = config.createFields ?? (config.auditAllFields ? undefined : []);
        const newData = this.getNotUndefinedFields({
            pick: fields as (keyof BaseComposedEntityType)[] | undefined,
        });

        const auditEvent = AuditEventFactory.forCreate(
            config.entityType,
            this.id,
            newData,
            config.entityDisplayName,
            userId,
            customMessage,
        );

        this.addDomainEvent(auditEvent as unknown as TDomainEvent);
        return auditEvent;
    }

    /**
     * Crea y agrega un evento de auditoría para ACTUALIZACIÓN.
     * Compara los datos originales con los actualizados para registrar los cambios.
     *
     * La lógica considera 3 instancias:
     * 1. `entityDto` (this o el parámetro) - Los campos que llegaron del frontend (puede tener muchos undefined)
     * 2. `originalEntity` - La entidad existente en BD antes de actualizar (datos completos)
     * 3. `updatedEntity` - La entidad después de persistir (valores reales actualizados) - debe llamarse sobre esta
     *
     * @param originalEntity - Entidad original antes de la actualización (del findById)
     * @param entityDto - DTO con los campos que se intentaron actualizar (opcional, usa this si no se provee)
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     *
     * @example
     * ```typescript
     * // En el command handler después de actualizar:
     * // 1. existingCustomer = findById(id) -> entidad original completa
     * // 2. entity = dto del comando -> campos que llegaron del frontend
     * // 3. updatedCustomer = update({ id, entity }) -> entidad actualizada persistida
     *
     * updatedCustomer.addUpdateAuditEvent(existingCustomer, entity);
     * this.domainEventsPublisher.publishEventsForAggregate(updatedCustomer);
     * ```
     */
    public addUpdateAuditEvent<TEntity extends BaseAggregateRootEntity<TEntityDto, TDomainEvent, EventBase>>(
        originalEntity: TEntity,
        entityDto?: Partial<TEntity>,
        userId?: string,
        customMessage?: string,
    ): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        // Usar entityDto si se provee, sino usar los campos configurados en updateFields
        const dtoSource = entityDto ?? this;

        // 1. Extraer los nombres de los campos que SÍ vinieron en el DTO (no undefined)
        //    Si no hay entityDto, usar los campos configurados en updateFields
        let fieldsToAudit: string[];

        if (entityDto) {
            // Obtener campos no-undefined del DTO que llegó del frontend
            const dtoFields = dtoSource.getNotUndefinedFields
                ? (dtoSource as BaseAggregateRootEntity<TEntityDto, TDomainEvent, EventBase>).getNotUndefinedFields()
                : Object.fromEntries(Object.entries(dtoSource).filter(([_, v]) => v !== undefined));
            fieldsToAudit = Object.keys(dtoFields);

            // Filtrar solo los campos permitidos en updateFields si está configurado
            if (config.updateFields && config.updateFields.length > 0) {
                const allowedFields = new Set(config.updateFields as string[]);
                fieldsToAudit = fieldsToAudit.filter((f) => allowedFields.has(f));
            }
        } else {
            // Sin DTO explícito, usar updateFields de la configuración
            fieldsToAudit = (config.updateFields as string[]) ?? [];
        }

        if (fieldsToAudit.length === 0) return undefined;

        // 2. Obtener esos campos de la entidad ORIGINAL (valores antes de actualizar)
        const originalData = originalEntity.getNotUndefinedFields({
            pick: fieldsToAudit as (keyof BaseComposedEntityType)[],
        });

        // 3. Obtener esos campos de la entidad ACTUALIZADA (this = valores persistidos)
        const updatedData = this.getNotUndefinedFields({
            pick: fieldsToAudit as (keyof BaseComposedEntityType)[],
        });

        const auditEvent = AuditEventFactory.forUpdate(
            config.entityType,
            this.id,
            originalData,
            updatedData,
            config.entityDisplayName,
            userId,
            customMessage,
        );

        this.addDomainEvent(auditEvent as unknown as TDomainEvent);
        return auditEvent;
    }

    /**
     * Crea y agrega un evento de auditoría para ELIMINACIÓN.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     *
     * @example
     * ```typescript
     * // En el command handler antes de eliminar:
     * const customer = await this.customerRepository.findById(id);
     * customer.addDeleteAuditEvent();
     * await this.customerRepository.delete(id);
     * this.domainEventsPublisher.publishEventsForAggregate(customer);
     * ```
     */
    public addDeleteAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const fields = config.deleteFields ?? config.createFields ?? (config.auditAllFields ? undefined : []);
        const oldData = this.getNotUndefinedFields({
            pick: fields as (keyof BaseComposedEntityType)[] | undefined,
        });

        const auditEvent = AuditEventFactory.forDelete(
            config.entityType,
            this.id,
            oldData,
            config.entityDisplayName,
            userId,
            customMessage,
        );

        this.addDomainEvent(auditEvent as unknown as TDomainEvent);
        return auditEvent;
    }

    /**
     * Crea y agrega un evento de auditoría para ACTIVACIÓN.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     */
    public addActivateAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const auditEvent = AuditEventFactory.forActivate(
            config.entityType,
            this.id,
            config.entityDisplayName,
            userId,
            customMessage,
        );

        this.addDomainEvent(auditEvent as unknown as TDomainEvent);
        return auditEvent;
    }

    /**
     * Crea y agrega un evento de auditoría para DESACTIVACIÓN.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     */
    public addDeactivateAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        const config = this.getAuditConfig();
        if (!config) return undefined;

        const auditEvent = AuditEventFactory.forDeactivate(
            config.entityType,
            this.id,
            config.entityDisplayName,
            userId,
            customMessage,
        );

        this.addDomainEvent(auditEvent as unknown as TDomainEvent);
        return auditEvent;
    }

    /**
     * Crea y agrega un evento de auditoría para TOGGLE (activar/desactivar).
     * Determina automáticamente si es activación o desactivación basado en isActive.
     *
     * @param userId - ID del usuario que realizó la acción (opcional)
     * @param customMessage - Mensaje personalizado (opcional)
     * @returns El evento creado o undefined si no hay configuración
     *
     * @example
     * ```typescript
     * // En el repository después del toggle:
     * const customer = await this.client.customer.update({ ... });
     * const customerEntity = CustomerMapper.toDomain(customer);
     * customerEntity.addToggleAuditEvent();
     * return customerEntity;
     * ```
     */
    public addToggleAuditEvent(userId?: string, customMessage?: string): AuditDomainEvent | undefined {
        if (this.isActive) {
            return this.addActivateAuditEvent(userId, customMessage);
        } else {
            return this.addDeactivateAuditEvent(userId, customMessage);
        }
    }
}

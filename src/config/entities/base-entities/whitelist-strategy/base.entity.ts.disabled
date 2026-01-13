//Default: Strategia whitelist, los DTOS deben definirse explicitamente en la capa de presentacion
import { DomainEvent, IDomainEventsEntity } from '@config/ddd/base.domain-events.interface.ddd';
import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import { SkipIfBlank } from '@presentation/decorators';
import { Expose, instanceToPlain } from 'class-transformer';
import { BaseComposedEntityType, BaseEntityType } from '../base-entity.types';
import { BaseEntitiesMethods, ExtractNotUndefinedFieldsParams } from '../base-entity-methods.interface';

interface BaseComposedIdMethods extends BaseEntitiesMethods {
    /**
     * Convierte la entidad a un objeto plano (JSON).
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TDataType extends BaseComposedEntityType, TGroups extends string>(groups?: TGroups | TGroups[]): TDataType;
}

interface BaseEntityMethods extends BaseEntitiesMethods {
    /**
     * Convierte la entidad a un objeto plano (JSON).
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TDataType extends BaseEntityType, TGroups extends string>(groups?: TGroups | TGroups[]): TDataType;
}

export abstract class BaseComposedIdEntity implements BaseComposedEntityType, BaseComposedIdMethods {
    @Expose()
    public isActive: boolean;

    @Expose()
    public readonly createdAt: Date;

    @Expose()
    public updatedAt: Date;

    @Expose()
    public deletedAt?: Date;

    constructor(partial: Partial<BaseComposedEntityType>) {
        Object.assign(this, partial);
    }

    /** Verifica si la entidad ya fue persistida */
    get isPersisted(): boolean {
        return this.createdAt !== undefined && this.updatedAt !== undefined;
    }

    /** Marca intención de cambio; el repo puede rehidratar updatedAt con el valor real de DB. */
    touch() {
        this.updatedAt = new Date();
    }

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
     * Convierte la entidad a un objeto plano (JSON).
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TDataType extends BaseComposedEntityType, TGroups extends string>(groups?: TGroups | TGroups[]) {
        return instanceToPlain(this, {
            excludeExtraneousValues: true,
            // Si enviamos un grupo, class-transformer filtrará por ese grupo.
            // Si no enviamos nada, solo mostrará los @Expose() sin grupos.
            // Si es string lo volvemos array, si ya es array lo dejamos igual, si es undefined se queda undefined.
            groups: groups ? (Array.isArray(groups) ? groups : [groups]) : undefined,
        }) as TDataType;
    }
}

export abstract class BaseEntity extends BaseComposedIdEntity implements BaseEntityType, BaseEntityMethods {
    @Expose()
    public readonly id: string;

    constructor(partial: Partial<BaseEntityType>) {
        super(partial);
        Object.assign(this, partial);
    }
    /** Verifica si la entidad ya fue persistida */
    get isPersisted(): boolean {
        return this.id !== undefined && this.createdAt !== undefined && this.updatedAt !== undefined;
    }

    /** Marca intención de cambio; el repo puede rehidratar updatedAt con el valor real de DB. */
    touch() {
        this.updatedAt = new Date();
    }

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

    /**
     * Convierte la entidad a un objeto plano (JSON).
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TDataType extends BaseComposedEntityType, TGroups extends string>(groups?: TGroups | TGroups[]) {
        return instanceToPlain(this, {
            excludeExtraneousValues: true,
            // Si enviamos un grupo, class-transformer filtrará por ese grupo.
            // Si no enviamos nada, solo mostrará los @Expose() sin grupos.
            // Si es string lo volvemos array, si ya es array lo dejamos igual, si es undefined se queda undefined.
            groups: groups ? (Array.isArray(groups) ? groups : [groups]) : undefined,
        }) as TDataType;
    }
}

export abstract class BaseAggregateRootEntity<
        TDomainEvent extends DomainEvent = DomainEvent<string, object, string>,
        EventBase extends IEvent = IEvent,
    >
    extends AggregateRoot<EventBase>
    implements BaseEntity, IDomainEventsEntity<TDomainEvent>, BaseEntityMethods
{
    @Expose()
    public readonly id: string;
    @Expose()
    public isActive: boolean;
    @Expose()
    public readonly createdAt: Date;
    @Expose()
    public updatedAt: Date;
    @Expose()
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
    public get domainEvents(): TDomainEvent[] {
        return this.#domainEvents;
    }

    /**
     * Limpia todos los eventos de dominio acumulados.
     */
    public clearDomainEvents(): void {
        this.domainEvents = [];
    }

    doExistDomainEvent(eventType: Pick<TDomainEvent, 'eventType'>): boolean {
        return this.domainEvents.some((event) => event.eventType === eventType.eventType);
    }

    get isPersisted(): boolean {
        return this.id !== undefined && this.createdAt !== undefined && this.updatedAt !== undefined;
    }
    touch(): void {
        this.updatedAt = new Date();
    }

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

    constructor(partial: Partial<BaseAggregateRootEntity<TDomainEvent, EventBase>>) {
        super();
        Object.assign(this, partial);
    }

    /**
     * Convierte la entidad a un objeto plano (JSON).
     * @param groups (Opcional) Un grupo o array de grupos para filtrar campos.
     * Ej: 'admin' o ['admin', 'reportes']
     */
    toDto<TDataType extends BaseComposedEntityType, TGroups extends string>(groups?: TGroups | TGroups[]) {
        return instanceToPlain(this, {
            excludeExtraneousValues: true,
            // Si enviamos un grupo, class-transformer filtrará por ese grupo.
            // Si no enviamos nada, solo mostrará los @Expose() sin grupos.
            // Si es string lo volvemos array, si ya es array lo dejamos igual, si es undefined se queda undefined.
            groups: groups ? (Array.isArray(groups) ? groups : [groups]) : undefined,
        }) as TDataType;
    }
}

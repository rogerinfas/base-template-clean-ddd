/**
 * Interfaz para gestión de eventos de dominio y eventos transaccionales en entidades/agregados DDD.
 * Compatible con NestJS CQRS (Commands, Events, Sagas, etc).
 */

/**
 * Representa un evento de dominio en el contexto DDD.
 * @template TType Tipo/nombre del evento (debe ser string).
 * @template TDate Fecha/hora en que ocurrió el evento (debe ser Date).
 * @template TAggregateId Identificador del agregado raíz relacionado (debe ser string).
 */
export type DomainEventProps<TType extends string, TData extends object, TAggregateId extends string> = {
    eventType: TType;
    data: TData;
    occurredOn: Date;
    aggregateId: TAggregateId;
    customMessage?: string;
    userId?: string; // Opcional, para identificar al usuario que emitió el evento
    referenceId?: string; // Opcional, para referencia cruzada o seguimiento de eventos en el front
    referenceCode?: string; // Opcional, para referencia cruzada o seguimiento de eventos en el front
    shouldPersist?: boolean; // Indica si el evento debe persistirse en la base de datos
};
export class DomainEvent<
    TType extends string = string,
    TData extends object = object,
    TAggregateId extends string = string,
> implements DomainEventProps<TType, TData, TAggregateId>
{
    eventType: TType;
    data: TData;
    occurredOn: Date;
    aggregateId: TAggregateId;
    customMessage?: string;
    userId?: string;
    referenceId?: string;
    referenceCode?: string;
    shouldPersist?: boolean;

    constructor(params: DomainEventProps<TType, TData, TAggregateId>) {
        this.eventType = params.eventType;
        this.data = params.data;
        this.occurredOn = params.occurredOn;
        this.aggregateId = params.aggregateId;
        this.userId = params.userId;
        this.referenceId = params.referenceId;
        this.referenceCode = params.referenceCode;
        this.customMessage = params.customMessage;
        this.shouldPersist = params.shouldPersist;
    }
}

/**
 * Representa un evento transaccional (por ejemplo, command/event de CQRS) que debe ejecutarse dentro de una transacción.
 * @template TType Tipo/nombre del evento (debe ser string).
 * @template TDate Fecha/hora en que se emitió el evento (debe ser Date).
 * @template TCorrelationId Identificador opcional para correlacionar procesos/sagas/transacciones (debe ser string).
 */
export class TransactionalEvent<
    TType extends string = string,
    TDate extends Date = Date,
    TCorrelationId extends string = string,
> {
    eventType: TType;
    issuedOn: TDate;
    correlationId?: TCorrelationId;

    constructor(params: {
        eventType: TType;
        issuedOn: TDate;
        correlationId?: TCorrelationId;
    }) {
        this.eventType = params.eventType;
        this.issuedOn = params.issuedOn;
        this.correlationId = params.correlationId;
    }
}

export interface IDomainEventsEntity<TDomainEvent extends DomainEvent = DomainEvent> {
    addDomainEvent(event: TDomainEvent): void;
    set domainEvents(events: TDomainEvent[]);

    pullDomainEvents(): TDomainEvent[];

    get domainEvents(): TDomainEvent[];

    clearDomainEvents(): void;

    doExistDomainEvent(eventType: Pick<TDomainEvent, 'eventType'>): boolean;
}

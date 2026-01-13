// import { AggregateRoot, IEvent } from '@nestjs/cqrs';
// import {
//   DomainEvent,
//   IDomainEventsEntity,
//   TransactionalEvent,
// } from './base.domain-events.interface.ddd';

// export class BaseAggregateEntity<
//     TTransactionalEvent extends TransactionalEvent = TransactionalEvent<
//       string,
//       Date,
//       string
//     >,
//     TDomainEvent extends DomainEvent = DomainEvent<string, Date, string>,
//     EventBase extends IEvent = IEvent,
//   >
//   extends AggregateRoot<EventBase>
//   implements IDomainEventsEntity<TDomainEvent, TTransactionalEvent>
// {
//   /**
//    * Lista de eventos de dominio (para publicar fuera de la transacción)
//    */
//   public domainEvents: TDomainEvent[] = [];

//   /**
//    * Lista de eventos transaccionales (commands/events que deben ejecutarse dentro de la transacción)
//    */
//   public transactionalEvents: TTransactionalEvent[] = [];

//   /**
//    * Agrega un evento de dominio a la lista interna.
//    * @param event Evento de dominio a agregar
//    */
//   public addDomainEvent(event: TDomainEvent): void {
//     this.domainEvents.push(event);
//   }

//   /**
//    * Agrega un evento transaccional a la lista interna.
//    * @param event Evento transaccional a agregar
//    */
//   public addTransactionalEvent(event: TTransactionalEvent): void {
//     this.transactionalEvents.push(event);
//   }

//   /**
//    * Replaces the current list of domain events with the provided array of events.
//    *
//    * @param events - An array of domain events to set for this aggregate.
//    */
//   public setDomainEvents(events: TDomainEvent[]): void {
//     this.domainEvents = events;
//   }

//   /**
//    * Obtiene y limpia los eventos de dominio acumulados.
//    * @returns Array de eventos de dominio
//    */
//   public pullDomainEvents(): TDomainEvent[] {
//     const events = [...this.domainEvents];
//     this.domainEvents = [];
//     return events;
//   }

//   /**
//    * Obtiene y limpia los eventos transaccionales acumulados.
//    * @returns Array de eventos transaccionales
//    */
//   public pullTransactionalEvents(): TTransactionalEvent[] {
//     const events = [...this.transactionalEvents];
//     this.transactionalEvents = [];
//     return events;
//   }

//   /**
//    * Obtiene los eventos de dominio actuales (sin limpiar).
//    * @returns Array de eventos de dominio
//    */
//   public getDomainEvents(): TDomainEvent[] {
//     return [...this.domainEvents];
//   }

//   /**
//    * Obtiene los eventos transaccionales actuales (sin limpiar).
//    * @returns Array de eventos transaccionales
//    */
//   public getTransactionalEvents(): TTransactionalEvent[] {
//     return [...this.transactionalEvents];
//   }

//   /**
//    * Limpia todos los eventos de dominio acumulados.
//    */
//   public clearDomainEvents(): void {
//     this.domainEvents = [];
//   }

//   /**
//    * Limpia todos los eventos transaccionales acumulados.
//    */
//   public clearTransactionalEvents(): void {
//     this.transactionalEvents = [];
//   }

//   doExistDomainEvent(eventType: Pick<TDomainEvent, 'eventType'>): boolean {
//     return this.domainEvents.some(
//       (event) => event.eventType === eventType.eventType,
//     );
//   }
//   doExistTransactionalEvent(
//     eventType: Pick<TTransactionalEvent, 'eventType'>,
//   ): boolean {
//     return this.transactionalEvents.some(
//       (event) => event.eventType === eventType.eventType,
//     );
//   }
// }

// // export type BaseAggregateEntityForMixin<TBase extends BaseAggregateEntity> = Pick<TBase, 'publish' | 'publishAll' | 'commit' | 'uncommit' | 'getUncommittedEvents' | 'loadFromHistory' | 'apply'>;

// // 1. Helper que elimina los symbols del tipo
// type StripSymbols<T> = {
//   [K in keyof T as K extends string ? K : never]: T[K];
// };

// // 2. Omitimos lo que queremos sobre las keys string
// export type BaseAggregateEntityForMixin<TBase extends BaseAggregateEntity> =
//   Omit<StripSymbols<TBase>, 'autoCommit' | 'getEventHandler' | 'getEventName'>;

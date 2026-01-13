
# Integración de CQRS de NestJS y Gestión de Eventos de Dominio en Entidades DDD

Este módulo define la infraestructura base para implementar el patrón DDD (Domain-Driven Design) y CQRS (Command Query Responsibility Segregation) usando NestJS. Aquí aprenderás cómo se integran los eventos de dominio y transaccionales en tus entidades agregadas, y cómo aprovechar la arquitectura de eventos de NestJS CQRS.



## ¿Cómo funciona la integración? (con ejemplos de código)


- **BaseAggregateEntity**: Es una clase base fundamental que extiende `AggregateRoot` de `@nestjs/cqrs`. Su objetivo es centralizar la gestión de eventos de dominio y transaccionales en cualquier agregado DDD de tu dominio. Implementa la interfaz `IDomainEventsEntity` y expone métodos públicos para agregar, obtener y limpiar eventos, facilitando la integración con el bus de eventos de NestJS.

**Ejemplo:**
```typescript
import { AggregateRoot } from '@nestjs/cqrs';
import { DomainEvent, TransactionalEvent, IDomainEventsEntity } from './base.domain-events.interface.ddd';

export class BaseAggregateEntity<
  TTransactionalEvent extends TransactionalEvent = TransactionalEvent<string, Date, string>,
  TDomainEvent extends DomainEvent = DomainEvent<string, Date, string>,
  EventBase extends IEvent = IEvent,
> extends AggregateRoot<EventBase> implements IDomainEventsEntity<TDomainEvent, TTransactionalEvent> {
  public domainEvents: TDomainEvent[] = [];
  public transactionalEvents: TTransactionalEvent[] = [];
  public addDomainEvent(event: TDomainEvent): void { this.domainEvents.push(event); }
  public addTransactionalEvent(event: TTransactionalEvent): void { this.transactionalEvents.push(event); }
  public pullDomainEvents(): TDomainEvent[] { const events = [...this.domainEvents]; this.domainEvents = []; return events; }
  public pullTransactionalEvents(): TTransactionalEvent[] { const events = [...this.transactionalEvents]; this.transactionalEvents = []; return events; }
  public getDomainEvents(): TDomainEvent[] { return [...this.domainEvents]; }
  public getTransactionalEvents(): TTransactionalEvent[] { return [...this.transactionalEvents]; }
  public clearDomainEvents(): void { this.domainEvents = []; }
  public clearTransactionalEvents(): void { this.transactionalEvents = []; }
}
```


- **¿Por qué se crea una clase base para componer después la clase con aggregate?**
  - En DDD, un "Aggregate" es la unidad de consistencia y transacción. Sin embargo, en aplicaciones reales, los agregados suelen requerir lógica transversal (validaciones, reglas de negocio, integración con otros sistemas, etc). Para mantener el código desacoplado y reutilizable, se utiliza una clase base (el agregado puro) y luego se compone con mixins que agregan funcionalidades específicas. Así, puedes tener un agregado limpio y componerlo dinámicamente según las necesidades del caso de uso.

**Ejemplo:**
```typescript
export class PurchaseRequestAggregate
  extends BaseAggregateEntity<PurchaseRequestTransactionalEvent>
  implements PurchaseRequestBase {
  constructor(partial: Partial<PurchaseRequest>) {
    super();
    Object.assign(this, partial);
  }
  // ...propiedades y métodos
}
```


- **¿Por qué extiende de AggregateRoot?**
  - `AggregateRoot` es una abstracción de NestJS CQRS que encapsula la lógica para manejar eventos de dominio, commit, publish y otras operaciones relacionadas con el ciclo de vida de los eventos. Al extender de `AggregateRoot`, la clase base hereda toda la infraestructura necesaria para trabajar con el bus de eventos de NestJS, permitiendo que los eventos sean publicados y gestionados de forma consistente en toda la aplicación. Además, esto habilita la integración con los patrones de CQRS y Event Sourcing si lo requieres en el futuro.

**Ejemplo:**
```typescript
// Métodos públicos heredados de AggregateRoot:
purchaseRequestAggregate.apply(event);
purchaseRequestAggregate.commit();
purchaseRequestAggregate.getUncommittedEvents();
// ...
```


- **Mixins**: Podemos componer lógica adicional sobre los aggregatedRoot usando mixins, manteniendo el código desacoplado y reutilizable. Los mixins permiten añadir comportamientos (como validaciones, lógica de inventario, generación de códigos, etc) sin acoplarlos directamente al agregado principal.

**Ejemplo:**
```typescript
export const PurchaseRequestMixin = ManyMixinG(
  PurchaseRequestAggregate,
  PurchaseRequestCodeMixin,
  PurchaseRequestCompletionMixin,
  PurchaseRequestInventoryMixin,
  PurchaseRequestPaymentMixin,
  PurchaseRequestStatusMixin,
  PurchaseRequestValidationMixin,
);
const purchaseRequest = new PurchaseRequestMixin({ ... });
```


- **Eventos de Dominio y Transaccionales**: Se definen tipos y utilidades para manejar ambos tipos de eventos, permitiendo disparar lógica dentro y fuera de la transacción. Los eventos de dominio suelen ser publicados después de la transacción, mientras que los transaccionales pueden ejecutarse dentro del contexto transaccional.

**Ejemplo:**
```typescript
purchaseRequest.addDomainEvent({
  eventType: 'purchase_request_created',
  occurredOn: new Date(),
  aggregateId: purchaseRequest.id,
});
purchaseRequest.addTransactionalEvent({
  eventType: 'create_purchase_request_item_created',
  issuedOn: new Date(),
});
console.log(purchaseRequest.pullDomainEvents());
console.log(purchaseRequest.pullTransactionalEvents());
```

## Ejemplo de implementación: PurchaseRequest

### 1. Definición del AggregateRoot

```typescript
export class PurchaseRequestAggregate
  extends BaseAggregateEntity<PurchaseRequestTransactionalEvent>
  implements PurchaseRequestBase {
  constructor(partial: Partial<PurchaseRequest>) {
    super();
    Object.assign(this, partial);
  }
  // ...propiedades y métodos
}
```

### 2. Composición con Mixins

```typescript
export const PurchaseRequestMixin = ManyMixinG(
  PurchaseRequestAggregate,
  PurchaseRequestCodeMixin,
  PurchaseRequestCompletionMixin,
  PurchaseRequestInventoryMixin,
  PurchaseRequestPaymentMixin,
  PurchaseRequestStatusMixin,
  PurchaseRequestValidationMixin,
);
```

### 3. Uso de eventos de dominio y transaccionales

En tu caso de uso (por ejemplo, en `create-purchase-request.command.use-case.ts`):

```typescript
const purchaseRequest = new PurchaseRequestMixin({ ... });
// ...lógica de negocio
purchaseRequest.addTransactionalEvent({
  eventType: 'create_purchase_request_item_created',
  issuedOn: new Date(),
});
// ...
console.log(purchaseRequest.pullTransactionalEvents());
```

- Usa `addDomainEvent` para eventos que deben ser publicados fuera de la transacción.
- Usa `addTransactionalEvent` para eventos que deben ejecutarse dentro de la transacción.
- Usa `pullDomainEvents` y `pullTransactionalEvents` para obtener y limpiar los eventos acumulados.

## Recomendaciones
- Define tus tipos de eventos en `/domain-events` para mantener el tipado fuerte y la trazabilidad.
- Usa los mixins para lógica transversal y reutilizable.
- Trabaja siempre con la API pública de los agregados y evita acceder a miembros privados/protegidos de clases externas.

---

**Ejemplo completo:** Consulta `purchase-request.entity.ts` y `create-purchase-request.command.use-case.ts` para ver la integración real en este proyecto.

# Mixins Genéricos en TypeScript

Este módulo provee utilidades para aplicar mixins a clases usando generics y tipado fuerte en TypeScript.

## ¿Qué es un Mixin?
Un mixin es una función o clase que añade funcionalidad a otra clase, permitiendo composición múltiple sin herencia directa. Esto es especialmente útil en arquitecturas orientadas a dominio (DDD), donde se busca separar responsabilidades y componer comportamientos reutilizables en las entidades del dominio.

## Tipos y Utilidades
- `GConstructor<T>`: Tipo genérico para constructores de clases.
- `Mixin<TBase, TReturn>`: Tipo para funciones mixin que extienden una clase base.
- `ManyMixinG`: Función que aplica múltiples mixins a una clase base, incluyendo por defecto `BaseRefHolderMixin`.
- `ComposeMixins`: Utilidad interna para el tipado de la composición de mixins.
- Los mixins ahora se aplican como funciones que extienden la clase base.
- El tipado es más estricto y permite composición múltiple segura.
- `ManyMixinG` agrega automáticamente el mixin `BaseRefHolderMixin` a la cadena de mixins.

## Ejemplo real: Uso en una Entidad DDD (`PurchaseRequest`)

Supongamos que tienes una entidad de dominio `PurchaseRequest` que requiere comportamientos adicionales como validación, manejo de pagos, inventario, etc. En vez de heredar de múltiples clases, puedes componer estos comportamientos usando mixins:

```ts
import { ManyMixinG } from 'src/config/mixin/base.mixin';
import {
  PurchaseRequestCodeMixin,
  PurchaseRequestCompletionMixin,
  PurchaseRequestInventoryMixin,
  PurchaseRequestPaymentMixin,
  PurchaseRequestStatusMixin,
  PurchaseRequestValidationMixin,
} from './mixin/purchase-request.mixin';

export class PurchaseRequest extends OmitType(BusinessTransaction, [
  'customerId',
  'customer',
  'termsAndConditionsTemplateId',
] as const) {
  // ...propiedades y constructor...
}

// Composición de mixins en la entidad de dominio
export const PurchaseRequestMixin = ManyMixinG(
  PurchaseRequest,
  PurchaseRequestCodeMixin,
  PurchaseRequestCompletionMixin,
  PurchaseRequestInventoryMixin,
  PurchaseRequestPaymentMixin,
  PurchaseRequestStatusMixin,
  PurchaseRequestValidationMixin,
);
```

### ¿Cómo se usa?

```ts
const pr = new PurchaseRequestMixin({ /* ...datos... */ });
pr.addPayment(payment); // Método de PurchaseRequestPaymentMixin
pr.validateRequest();   // Método de PurchaseRequestValidationMixin
// ...otros métodos de mixins
```

### Ventajas en DDD
- **Separación de responsabilidades:** Cada mixin encapsula un aspecto del dominio (pagos, validación, inventario, etc).
- **Composición flexible:** Puedes agregar o quitar comportamientos sin modificar la jerarquía de clases.
- **Tipado fuerte:** TypeScript reconoce todos los métodos y propiedades de los mixins aplicados.
- **Reutilización:** Los mixins pueden ser usados en otras entidades del dominio si comparten comportamientos.

## Ejemplo Práctico Genérico
```ts
class Base {
  baseProp = 'base';
}
const MixinA = (Base) => class extends Base { aProp = 'A'; };
const MixinB = (Base) => class extends Base { bProp = 'B'; };

const Mixed = ManyMixinG(Base, MixinA, MixinB);
const obj = new Mixed();
console.log(obj.baseProp); // 'base'
console.log(obj.aProp);    // 'A'
console.log(obj.bProp);    // 'B'
```

## Ejemplo de uso en un Caso de Uso real

A continuación se muestra cómo se utiliza la entidad con mixins en un caso de uso de aplicación siguiendo DDD. En este ejemplo, el caso de uso `CreateCompletePurchaseRequestUseCase` instancia la entidad `PurchaseRequest` usando el mixin y aprovecha sus métodos:

```ts
import { PurchaseRequestMixin } from 'src/domain/entities/suppliance-traits-entities/purchase-request.entity';
import { PurchaseRequestItem } from 'src/domain/entities/suppliance-traits-entities/purchase-request-item.entity';
import { Payment } from 'src/domain/entities/commercial-traits-entities/payment.entity';

// ...dentro del método execute del use case...

const purchaseRequestItems = (dto.purchaseRequestItems || []).map(
  (item) => new PurchaseRequestItem(item),
);
const payments = (dto.payments || []).map((payment) => new Payment(payment));

// Instanciar la entidad usando el mixin
const purchaseRequest = new PurchaseRequestMixin({
  ...dto.purchaseRequest,
  purchaseRequestItems,
  payments,
});

// Usar métodos agregados por los mixins
purchaseRequest.setPaymentType();
// purchaseRequest.validateRequest(); // si tienes validación

// Guardar la entidad usando el repositorio
const created = await purchaseRequestRepository.createComplete(
  purchaseRequest,
  purchaseRequest.code,
);
```

Este patrón permite que la lógica de dominio (como validaciones, reglas de negocio, etc.) esté encapsulada en la entidad y sus mixins, manteniendo el caso de uso limpio y enfocado en la orquestación.

## ¿Cómo crear un nuevo mixin?

Crear un mixin te permite encapsular lógica de dominio reutilizable y componerla en tus entidades. Un mixin es simplemente una función que recibe una clase base y retorna una nueva clase extendida con métodos o propiedades adicionales.

### Ejemplo: Mixin de Pagos (`PurchaseRequestPaymentMixin`)

Supón que quieres agregar lógica de manejo de pagos a una entidad. Puedes crear un mixin así:

```ts
import { CommercialOperation } from '@prisma/client';
import { GConstructor } from 'src/config/mixin/base.mixin';
import { Payment } from '../../commercial-traits-entities/payment.entity';
import { PurchaseRequest } from '../purchase-request.entity';

export function PurchaseRequestPaymentMixin<TBase extends GConstructor<PurchaseRequest>>(Base: TBase) {
    return class extends Base {
        addPayment(payment: Payment): void {
            if (!this.payments) this.payments = [];
            this.payments.push(payment);
        }
        setPaymentType() {
            const paymentType = CommercialOperation.PURCHASE_REQUEST;
            if (!this.payments || this.payments.length === 0) return;
            this.payments.forEach((payment) => {
                payment.type = paymentType;
            });
        }
    };
}
```

### Pasos para crear un mixin:
1. Define una función que reciba la clase base (`Base`) y retorne una nueva clase que extienda esa base.
2. Implementa los métodos o propiedades que quieras agregar.
3. Usa el mixin en tu entidad con `ManyMixinG` o `MixinG`.

### Recomendaciones
- El mixin debe ser lo más desacoplado posible y no depender de detalles internos de la entidad base.
- Si necesitas tipado fuerte, usa `GConstructor<T>` para asegurar compatibilidad.
- Puedes combinar varios mixins en una sola entidad para componer comportamientos complejos.

## Notas
- Los mixins deben ser funciones que extienden la clase base y devuelven una nueva clase.
- Si hay métodos o propiedades con el mismo nombre, el último mixin aplicado sobrescribirá los anteriores.
- `ManyMixinG` siempre agrega `BaseRefHolderMixin` como primer mixin para asegurar compatibilidad y utilidades comunes.

---

**Autor:** Equipo Acide para Team Innovation

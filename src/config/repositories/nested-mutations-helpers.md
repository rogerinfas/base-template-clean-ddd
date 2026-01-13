# Helpers genéricos para mutaciones anidadas (Prisma)

Este documento describe los helpers disponibles en `BasePrismaRepository` para construir mutaciones anidadas (create/update/delete) de forma tipada y reutilizable.

Ubicación del código: `src/config/repositories/base.prisma.repository.ts`

## Objetivos

- Reducir duplicación de lógica al manejar colecciones o relaciones 1-1 anidadas.
- Respetar el estándar de entidades con `id`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`.
- Permitir controlar cómo tratar ítems inactivos (`isActive: false`) mediante una estrategia configurable.

## buildWritablePayloadForNested

Limpia un objeto hijo removiendo campos no actualizables comunes y llaves extra, y normaliza el DTO.

Firma:

```typescript
protected buildWritablePayloadForNested<TOut>(obj: unknown, extraOmitKeys: string[] = []): TOut
```
# Helpers genéricos para mutaciones anidadas (Prisma)

Este documento describe los helpers disponibles en `BasePrismaRepository` para construir mutaciones anidadas (create/update/delete) de forma tipada y reutilizable.

Ubicación del código: `src/config/repositories/base.prisma.repository.ts`

## Objetivos

- Reducir duplicación de lógica al manejar colecciones o relaciones 1-1 anidadas.
- Respetar el estándar de entidades con `id`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`.
- Permitir controlar cómo tratar ítems inactivos (`isActive: false`) mediante una estrategia configurable.

## buildWritablePayloadForNested

Limpia un objeto hijo removiendo campos no actualizables comunes y llaves extra, y normaliza el DTO.

Firma:

```typescript
protected buildWritablePayloadForNested<TOut>(obj: unknown, extraOmitKeys: string[] = []): TOut
```

- `obj`: el hijo parcial (domain entity/DTO).
- `extraOmitKeys`: lista de llaves a omitir además de `id`, `createdAt`, `updatedAt`, `deletedAt`. Útil para FKs del padre.
- Retorna: payload listo para `Prisma.*CreateWithout*Input` o `Prisma.*UpdateWithout*Input`.

Ejemplo:

```ts
const toAddressCreate = (a: Partial<Address>): Prisma.AddressCreateWithoutCustomerInput =>
  this.buildWritablePayloadForNested<Prisma.AddressCreateWithoutCustomerInput>(a, ['customerId', 'supplierId']);
```

## buildMutationQueryForManyNestedChildren

Construye la sección nested para relaciones 1-N (arrays) con `create`, `delete`, `update`.

Firma:

```ts
protected buildMutationQueryForManyNestedChildren<
  TChild extends { id?: string; isActive?: boolean },
  TCreate,
  TUpdate,
  TNestedInput = unknown,
>(params: {
  items?: Array<Partial<TChild>>;
  mapCreate: (item: Partial<TChild>) => TCreate;
  mapUpdate: (item: Partial<TChild>) => TUpdate;
  options?: { inactiveStrategy?: 'delete' | 'update' };
}): TNestedInput | undefined
```

- `items`: lista de hijos anidados (parciales). Se usan las convenciones `id?` e `isActive?`.
- `mapCreate`: mapea un hijo parcial al input Prisma `CreateWithoutParentInput`.
- `mapUpdate`: mapea un hijo parcial al input Prisma `UpdateWithoutParentInput`.
- `options.inactiveStrategy`:
  - `'delete'` (default): los ítems con `isActive === false` se agregan a `delete`.
  - `'update'`: los ítems con `isActive === false` se agregan a `update`.
- Retorna el objeto nested con `{ create, delete, update }` o `undefined` si no hay cambios.

Uso en update (1-N):

```ts
const addressesOps = this.buildMutationQueryForManyNestedChildren<
  Address,
  Prisma.AddressCreateWithoutCustomerInput,
  Prisma.AddressUpdateWithoutCustomerInput,
  Prisma.AddressUpdateManyWithoutCustomerNestedInput
>({
  items: addresses,
  mapCreate: toAddressCreate,
  mapUpdate: toAddressUpdate,
  options: { inactiveStrategy: 'delete' },
});
if (addressesOps) data.addresses = addressesOps;
```

Uso en create (1-N):

```ts
const addressesOpsOnCreate = this.buildMutationQueryForManyNestedChildren<
  Address,
  Prisma.AddressCreateWithoutCustomerInput,
  never,
  { create?: Prisma.AddressCreateWithoutCustomerInput[] }
>({
  items: addresses,
  mapCreate: toAddressCreate,
  // mapUpdate no se usa en create, puede definirse pero no se llamará si no hay id
  mapUpdate: () => ({} as never),
});

const payload: Prisma.CustomerCreateInput = {
  // ...campos del padre
  ...(addressesOpsOnCreate?.create && {
    addresses: { create: addressesOpsOnCreate.create },
  }),
};
```

Notas para create:
- Para creaciones simples, si sólo necesitas `create`, también puedes mapear directamente:
  
  ```ts
  addresses && addresses.length > 0 && {
    addresses: { create: addresses.map(toAddressCreate) }
  }
  ```

## buildMutationQueryForNestedChild

Construye la sección nested para relaciones 1-1 con `create`, `update` o `delete` según el estado.

Firma:

```ts
protected buildMutationQueryForNestedChild<
  TChild extends { id?: string; isActive?: boolean },
  TCreate,
  TUpdate,
  TNestedInput = unknown,
>(params: {
  item?: Partial<TChild> | null;
  mapCreate: (item: Partial<TChild>) => TCreate;
  mapUpdate: (item: Partial<TChild>) => TUpdate;
  options?: { inactiveStrategy?: 'delete' | 'update' };
}): TNestedInput | undefined
```

- Sin `id`: devuelve `{ create }`.
- Con `id` y `isActive === false`:
  - `'delete'` (default): `{ delete: true }`.
  - `'update'`: `{ update }`.
- Con `id` y activo: `{ update }`.

Uso en update (1-1):

```ts
const legalEntityOps = this.buildMutationQueryForNestedChild<
  LegalEntity,
  Prisma.LegalEntityCreateWithoutCustomerInput,
  Prisma.LegalEntityUpdateWithoutCustomerInput,
  Prisma.LegalEntityUpdateOneWithoutCustomerNestedInput
>({
  item: customer.legalEntity,
  mapCreate: toLegalEntityCreate,
  mapUpdate: toLegalEntityUpdate,
  options: { inactiveStrategy: 'delete' },
});
if (legalEntityOps) data.legalEntity = legalEntityOps;
```

Uso en create (1-1):

```ts
const legalEntityOpsOnCreate = this.buildMutationQueryForNestedChild<
  LegalEntity,
  Prisma.LegalEntityCreateWithoutCustomerInput,
  never,
  { create?: Prisma.LegalEntityCreateWithoutCustomerInput }
>({
  item: legalEntity,
  mapCreate: toLegalEntityCreate,
  mapUpdate: () => ({} as never),
});

const payload: Prisma.CustomerCreateInput = {
  // ...
  ...(legalEntityOpsOnCreate?.create && { legalEntity: { create: legalEntityOpsOnCreate.create } }),
};
```

## Recomendaciones

- Define funciones `toChildCreate`/`toChildUpdate` usando `buildWritablePayloadForNested` y omite FKs del padre.
- En create, si sólo necesitas `create`, puedes usar directamente `mapCreate` o el helper para extraer `create`.
- Usa `inactiveStrategy` = 'update' si prefieres desactivar por flag en lugar de borrar (suave) en la mutación.

## Ejemplo rápido de extractores

```ts
const toContactCreate = (c: Partial<Contact>): Prisma.ContactCreateWithoutCustomerInput =>
  this.buildWritablePayloadForNested<Prisma.ContactCreateWithoutCustomerInput>(c, ['customerId', 'supplierId']);

const toContactUpdate = (c: Partial<Contact>): Prisma.ContactUpdateWithoutCustomerInput =>
  this.buildWritablePayloadForNested<Prisma.ContactUpdateWithoutCustomerInput>(c, ['customerId', 'supplierId']);
```

## Compatibilidad

- Los helpers están diseñados para funcionar con los tipos de Prisma que incluyen variantes `Unchecked*` en sus uniones.
- Los genéricos están relajados para permitir estas uniones sin choques de tipos.

## Cómo escoger los tipos genéricos de Prisma

Sigue estas reglas rápidas para cada helper:

1) Para 1-N (arrays) en update
- TChild: la entidad hija de dominio con `id?` e `isActive?` (p. ej. `Address`).
- TCreate: `Prisma.<Child>CreateWithout<Parent>Input` (p. ej. `Prisma.AddressCreateWithoutCustomerInput`).
- TUpdate: `Prisma.<Child>UpdateWithout<Parent>Input` (p. ej. `Prisma.AddressUpdateWithoutCustomerInput`).
- TNestedInput: `Prisma.<Child>UpdateManyWithout<Parent>NestedInput` (p. ej. `Prisma.AddressUpdateManyWithoutCustomerNestedInput`).

Ejemplo:

```ts
const addressesOps = this.buildMutationQueryForManyNestedChildren<
  Address,
  Prisma.AddressCreateWithoutCustomerInput,
  Prisma.AddressUpdateWithoutCustomerInput,
  Prisma.AddressUpdateManyWithoutCustomerNestedInput
>({ items: addresses, mapCreate: toAddressCreate, mapUpdate: toAddressUpdate });
```

2) Para 1-1 en update
- TChild: la entidad hija (p. ej. `LegalEntity`).
- TCreate: `Prisma.<Child>CreateWithout<Parent>Input`.
- TUpdate: `Prisma.<Child>UpdateWithout<Parent>Input`.
- TNestedInput: `Prisma.<Child>UpdateOneWithout<Parent>NestedInput` (o `UpdateOneRequired...` si la relación es requerida).

Ejemplo:

```ts
const legalEntityOps = this.buildMutationQueryForNestedChild<
  LegalEntity,
  Prisma.LegalEntityCreateWithoutCustomerInput,
  Prisma.LegalEntityUpdateWithoutCustomerInput,
  Prisma.LegalEntityUpdateOneWithoutCustomerNestedInput
>({ item: legalEntity, mapCreate: toLECreate, mapUpdate: toLEUpdate });
```

3) Para create (1-N)
- Puedes:
  - a) Usar el helper para obtener sólo `create` y construir `{ addresses: { create: ops.create } }`.
  - b) Mapear directamente: `{ addresses: { create: addresses.map(toAddressCreate) } }`.
- Si usas el helper, define TNestedInput minimalista: `{ create?: Prisma.<Child>CreateWithout<Parent>Input[] }`.

Ejemplo:

```ts
const ops = this.buildMutationQueryForManyNestedChildren<
  Address,
  Prisma.AddressCreateWithoutCustomerInput,
  never,
  { create?: Prisma.AddressCreateWithoutCustomerInput[] }
>({ items: addresses, mapCreate: toAddressCreate, mapUpdate: () => ({} as never) });

const payload: Prisma.CustomerCreateInput = {
  // ...
  ...(ops?.create && { addresses: { create: ops.create } }),
};
```

4) Para create (1-1)
- Similar al caso 1-1 update, pero sólo necesitas `create`.
- TNestedInput puede ser `{ create?: Prisma.<Child>CreateWithout<Parent>Input }`.

Ejemplo:

```ts
const ops = this.buildMutationQueryForNestedChild<
  LegalEntity,
  Prisma.LegalEntityCreateWithoutCustomerInput,
  never,
  { create?: Prisma.LegalEntityCreateWithoutCustomerInput }
>({ item: legalEntity, mapCreate: toLECreate, mapUpdate: () => ({} as never) });

const payload: Prisma.CustomerCreateInput = {
  ...(ops?.create && { legalEntity: { create: ops.create } }),
};
```

5) ¿Unchecked o Checked?
- Prefiere los tipos `CreateWithout`/`UpdateWithout` “checked”.
- Usa `Unchecked*` sólo si necesitas escribir FKs directamente y sabes lo que haces.

6) Nombres de tipos: cómo derivarlos
- Dado un modelo `Parent` con relación a `Child`:
  - CreateWithout: `Prisma.ChildCreateWithoutParentInput`
  - UpdateWithout: `Prisma.ChildUpdateWithoutParentInput`
  - UpdateManyNested (1-N): `Prisma.ChildUpdateManyWithoutParentNestedInput`
  - UpdateOneNested (1-1): `Prisma.ChildUpdateOneWithoutParentNestedInput` (o `UpdateOneRequired...`)
- Para create nested nativo de Prisma, también existen `Prisma.ChildCreateNestedManyWithoutParentInput` y `Prisma.ChildCreateNestedOneWithoutParentInput`, pero el helper retorna sólo las partes necesarias (`create`).

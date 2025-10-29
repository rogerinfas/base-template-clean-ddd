# 🧪 Guía de Testing

## Ejemplo de Test Unitario

Crea: `src/domain/entities/user.entity.spec.ts`

```typescript
import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';

describe('User Entity', () => {
  describe('create', () => {
    it('debe crear un usuario válido', () => {
      const user = User.create({
        email: new Email('test@example.com'),
        password: 'hashedPassword',
        name: 'John Doe',
      });

      expect(user.name).toBe('John Doe');
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.isActive).toBe(true);
    });

    it('debe lanzar error si el nombre es muy corto', () => {
      expect(() => {
        User.create({
          email: new Email('test@example.com'),
          password: 'hashedPassword',
          name: 'J',
        });
      }).toThrow('El nombre debe tener al menos 2 caracteres');
    });
  });

  describe('updateEmail', () => {
    it('debe actualizar el email correctamente', () => {
      const user = User.create({
        email: new Email('old@example.com'),
        password: 'hashedPassword',
        name: 'John Doe',
      });

      const newEmail = new Email('new@example.com');
      const updatedUser = user.updateEmail(newEmail);

      expect(updatedUser.email.getValue()).toBe('new@example.com');
      expect(user.email.getValue()).toBe('old@example.com'); // Inmutabilidad
    });
  });

  describe('activate/deactivate', () => {
    it('debe activar un usuario inactivo', () => {
      const user = User.create({
        email: new Email('test@example.com'),
        password: 'hashedPassword',
        name: 'John Doe',
      });

      const deactivated = user.deactivate();
      expect(deactivated.isActive).toBe(false);

      const activated = deactivated.activate();
      expect(activated.isActive).toBe(true);
    });
  });
});
```

## Ejemplo de Test de Value Object

Crea: `src/domain/value-objects/email.vo.spec.ts`

```typescript
import { Email } from './email.vo';
import { InvalidValueObjectException } from '../exceptions/domain.exceptions';

describe('Email Value Object', () => {
  it('debe crear un email válido', () => {
    const email = new Email('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('debe convertir a minúsculas', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('debe lanzar error si el formato es inválido', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidValueObjectException);
    expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
  });

  it('debe detectar emails iguales', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('TEST@EXAMPLE.COM');
    
    expect(email1.equals(email2)).toBe(true);
  });
});
```

## Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Con coverage
pnpm test:cov

# En watch mode
pnpm test:watch

# Un archivo específico
pnpm test user.entity.spec.ts
```

## Estructura de Tests

```
src/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── user.entity.spec.ts       ← Test de entidad
│   └── value-objects/
│       ├── email.vo.ts
│       └── email.vo.spec.ts          ← Test de value object
├── application/
│   └── use-cases/
│       └── user/
│           └── commands/
│               ├── create-user.command.ts
│               └── create-user.command.spec.ts  ← Test de comando
└── infrastructure/
    └── persistence/
        └── prisma/
            └── repositories/
                ├── user.repository.ts
                └── user.repository.spec.ts  ← Test de repositorio (con mock)
```


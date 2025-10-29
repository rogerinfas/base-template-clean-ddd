# 🏛️ Arquitectura del Template

## 📊 Diagrama de Capas

```
┌──────────────────────────────────────────────────────────┐
│                  HTTP REQUEST                            │
│                       ↓                                  │
├──────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                      │
│  ┌──────────────────────────────────────────────┐        │
│  │ UsersController                              │        │
│  │ - create(@Body dto)                          │        │
│  │ - findAll()                                  │        │
│  │ - findOne(@Param id)                         │        │
│  └──────────────────┬───────────────────────────┘        │
│                     ↓                                    │
│  ┌──────────────────────────────────────────────┐        │
│  │ CreateUserDto (Validation)                   │        │
│  │ - @IsEmail() email                           │        │
│  │ - @MinLength(6) password                     │        │
│  └──────────────────────────────────────────────┘        │
├──────────────────────────────────────────────────────────┤
│                     ↓                                    │
│  APPLICATION LAYER (Use Cases - CQRS)                    │
│  ┌──────────────────────────────────────────────┐        │
│  │ CreateUserCommand                            │        │
│  │ execute(dto) {                               │        │
│  │   1. Validate email doesn't exist            │        │
│  │   2. Hash password                           │        │
│  │   3. Create User entity                      │        │
│  │   4. Save via repository                     │        │
│  │ }                                            │        │
│  └──────────────────┬───────────────────────────┘        │
├──────────────────────────────────────────────────────────┤
│                     ↓                                    │
│  DOMAIN LAYER (Business Logic)                           │
│  ┌──────────────────────────────────────────────┐        │
│  │ User Entity                                  │        │
│  │ - id: string                                 │        │
│  │ - email: Email (Value Object)                │        │
│  │ - name: string                               │        │
│  │                                              │        │
│  │ Methods:                                     │        │
│  │ + create(props): User                        │        │
│  │ + updateEmail(email): User                   │        │
│  │ + activate(): User                           │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ Email Value Object                           │        │
│  │ - value: string                              │        │
│  │ - validate(email)                            │        │
│  │ - equals(other): boolean                     │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ IUserRepository (Interface)                  │        │
│  │ + findById(id): Promise<User>                │        │
│  │ + create(user): Promise<User>                │        │
│  └──────────────────┬───────────────────────────┘        │
├──────────────────────────────────────────────────────────┤
│                     ↓ (implements)                       │
│  INFRASTRUCTURE LAYER                                    │
│  ┌──────────────────────────────────────────────┐        │
│  │ UserRepository                               │        │
│  │ implements IUserRepository {                 │        │
│  │   findById(id) {                             │        │
│  │     const user = await prisma.user.find()    │        │
│  │     return UserMapper.toDomain(user)         │        │
│  │   }                                          │        │
│  │ }                                            │        │
│  └──────────────────┬───────────────────────────┘        │
│                     ↓                                    │
│  ┌──────────────────────────────────────────────┐        │
│  │ UserMapper                                   │        │
│  │ toDomain(prisma) → Domain Entity             │        │
│  │ toPrisma(domain) → Prisma Model              │        │
│  └──────────────────┬───────────────────────────┘        │
│                     ↓                                    │
│  ┌──────────────────────────────────────────────┐        │
│  │ PrismaService (Database)                     │        │
│  │ PostgreSQL                                   │        │
│  └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de una Request

### Ejemplo: Crear un Usuario

```
1. HTTP POST /api/users
   {
     "email": "user@example.com",
     "password": "SecurePass123",
     "name": "John Doe"
   }
   
2. UsersController.create()
   ↓
   Valida DTO con class-validator
   
3. CreateUserCommand.execute()
   ↓
   a) Verifica que el email no exista (repository.existsByEmail)
   b) Hashea el password (bcrypt)
   c) Crea Email Value Object (con validación)
   d) Crea User Entity (User.create())
   e) Persiste (repository.create())
   
4. UserRepository.create()
   ↓
   a) Convierte Domain → Prisma (UserMapper.toPrisma)
   b) Guarda en DB (prisma.user.create())
   c) Convierte Prisma → Domain (UserMapper.toDomain)
   
5. Return HTTP 201
   {
     "id": "uuid",
     "email": "user@example.com",
     "name": "John Doe",
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
```

## 🎯 Principios Aplicados

### 1. Inversión de Dependencias (DIP)

```
Domain Layer (interfaces)
    ↑
    │ depende de
    │
Infrastructure Layer (implementaciones)
```

**Ejemplo**:
```typescript
// ✅ Correcto: Domain define la interfaz
// domain/repositories/user.repository.interface.ts
export interface IUserRepository { ... }

// infrastructure/persistence/user.repository.ts
export class UserRepository implements IUserRepository { ... }
```

### 2. Separación de Responsabilidades (SRP)

Cada capa tiene UNA responsabilidad:

- **Presentation**: Manejar HTTP
- **Application**: Orquestar casos de uso
- **Domain**: Lógica de negocio
- **Infrastructure**: Detalles técnicos

### 3. Abierto/Cerrado (OCP)

Las entidades están cerradas para modificación pero abiertas para extensión:

```typescript
// No modificamos la entidad User
// Extendemos con nuevos métodos
class User {
  // ... métodos existentes
  
  // Nuevo: sin romper código existente
  updateProfile(profile: Profile): User { ... }
}
```

## 📦 Dependencias entre Módulos

```
PresentationModule
    ↓ imports
ApplicationModule
    ↓ imports
InfrastructureModule
    ↓ provides
Repositories (implementations)
```

**Configuración**:

```typescript
// presentation.module.ts
@Module({
  imports: [ApplicationModule],  // Solo importa lo que necesita
  controllers: [UsersController],
})

// application.module.ts
@Module({
  imports: [InfrastructureModule],  // Para acceder a repositorios
  providers: [CreateUserCommand, GetUserByIdQuery],
  exports: [CreateUserCommand, GetUserByIdQuery],
})

// infrastructure.module.ts
@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
  exports: [USER_REPOSITORY],
})
```

## 🔀 CQRS Pattern

```
┌─────────────────┐
│   Controllers   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ↓          ↓
┌────────┐ ┌────────┐
│Commands│ │Queries │
│(Write) │ │(Read)  │
└────┬───┘ └───┬────┘
     │         │
     ↓         ↓
┌──────────────────┐
│   Repositories   │
└──────────────────┘
```

**Ventajas**:
- Optimización independiente
- Escalado diferenciado
- Código más mantenible

## 🎨 Patrones de Diseño

### 1. Repository Pattern
Abstrae el acceso a datos

### 2. Factory Pattern
Creación controlada de entidades

### 3. Mapper Pattern
Conversión entre capas

### 4. Strategy Pattern
Diferentes implementaciones de repositorios

### 5. Dependency Injection
Inversión de control con NestJS

## 🧪 Testing Strategy

```
┌─────────────────────────────────┐
│   Unit Tests                     │
│   - Entities                     │
│   - Value Objects                │
│   - Use Cases (mocked repos)     │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│   Integration Tests              │
│   - Repositories (real DB)       │
│   - Use Cases (real repos)       │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│   E2E Tests                      │
│   - Full HTTP flow               │
│   - Real database                │
└─────────────────────────────────┘
```

## 📚 Comparación: DDD vs Anemic Model

### ❌ Anemic Model (Anti-pattern)

```typescript
// Solo datos, sin lógica
class User {
  id: string;
  email: string;
  password: string;
}

// Lógica en servicio
class UserService {
  createUser(data) {
    // Validación aquí
    // Hashing aquí
    // Negocio aquí
  }
}
```

### ✅ Rich Domain Model (DDD)

```typescript
// Datos + Lógica de negocio
class User {
  private constructor(props) { ... }
  
  static create(props): User {
    // Validación en la entidad
    // Lógica de negocio
  }
  
  updateEmail(email: Email): User {
    // Reglas de negocio
  }
}

// Use Case solo orquesta
class CreateUserCommand {
  execute(dto) {
    const user = User.create(dto);
    return this.repository.save(user);
  }
}
```

## 🎓 Conceptos Clave para Recordar

1. **Domain es el núcleo**: Todo gira alrededor del dominio
2. **Entidades ricas**: Contienen lógica, no solo datos
3. **Value Objects**: Validación encapsulada
4. **Interfaces en Domain**: Implementaciones en Infrastructure
5. **Use Cases orquestan**: No contienen lógica de negocio
6. **Inmutabilidad**: Retornar nuevas instancias
7. **CQRS**: Separar lectura y escritura

---

¿Preguntas sobre la arquitectura? Consulta [GUIDE.md](./GUIDE.md)


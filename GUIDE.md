# 📖 Guía de Uso - Template Clean DDD

## 🎯 Objetivo

Este template te enseña a construir aplicaciones con **Clean Architecture** y **Domain-Driven Design**.

---

## 📚 Conceptos Clave

### 1. **Capas de la Arquitectura**

```
┌─────────────────────────────────────────┐
│     Presentation (Controllers)          │  ← HTTP/API
├─────────────────────────────────────────┤
│     Application (Use Cases)             │  ← Lógica de aplicación
├─────────────────────────────────────────┤
│     Domain (Entities, Value Objects)    │  ← Lógica de negocio
├─────────────────────────────────────────┤
│     Infrastructure (DB, External APIs)  │  ← Detalles técnicos
└─────────────────────────────────────────┘
```

**Regla de oro**: Las dependencias apuntan hacia adentro (hacia el dominio).

### 2. **Domain Layer (Núcleo)**

#### **Entities** - Objetos con identidad

```typescript
// ✅ Entidad rica con lógica de negocio
class User {
  private constructor(props) { ... }
  
  // Factory methods
  static create(props): User { ... }
  static fromData(data): User { ... }
  
  // Métodos de negocio
  updateEmail(email: Email): User { ... }
  activate(): User { ... }
}
```

**Características**:
- Tienen ID único
- Son inmutables (retornan nuevas instancias)
- Contienen lógica de negocio
- Usan factory methods en lugar de new

#### **Value Objects** - Objetos sin identidad

```typescript
// ✅ Value Object para Email
class Email {
  constructor(email: string) {
    this.validate(email);  // Validación automática
    this.value = email.toLowerCase();
  }
  
  getValue(): string { return this.value; }
  equals(other: Email): boolean { ... }
}
```

**Características**:
- No tienen ID
- Son inmutables
- Se comparan por valor, no por referencia
- Encapsulan validación

#### **Repositories** - Interfaces (NO implementaciones)

```typescript
// ✅ Interface en el dominio
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

// La implementación está en Infrastructure
```

---

### 3. **Application Layer (Casos de Uso)**

#### **Commands** - Modifican estado

```typescript
@Injectable()
export class CreateUserCommand {
  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Validaciones
    // 2. Crear entidad
    // 3. Persistir
    // 4. Retornar resultado
  }
}
```

**Cuándo usar**:
- Crear (Create)
- Actualizar (Update)
- Eliminar (Delete)

#### **Queries** - Solo lectura

```typescript
@Injectable()
export class GetUserByIdQuery {
  async execute(id: string): Promise<User> {
    // Solo consulta, no modifica
    return await this.userRepository.findById(id);
  }
}
```

**Cuándo usar**:
- Listar datos
- Buscar por ID
- Filtrar y paginar

---

### 4. **Infrastructure Layer (Implementación)**

#### **Repositories** - Implementación concreta

```typescript
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }
}
```

#### **Mappers** - Conversión entre capas

```typescript
export class UserMapper {
  // Prisma → Domain
  static toDomain(prismaUser: PrismaUser): User {
    return User.fromData({
      id: prismaUser.id,
      email: new Email(prismaUser.email),
      // ...
    });
  }
  
  // Domain → Prisma
  static toPrisma(user: User): PrismaUser {
    return {
      email: user.email.getValue(),
      // ...
    };
  }
}
```

---

### 5. **Presentation Layer (API)**

#### **Controllers** - Delegan a casos de uso

```typescript
@Controller('users')
export class UsersController {
  constructor(
    private createUserCommand: CreateUserCommand,
    private getUserQuery: GetUserByIdQuery,
  ) {}
  
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.createUserCommand.execute(dto);
  }
}
```

#### **DTOs** - Validación de entrada

```typescript
export class CreateUserDto {
  @IsEmail()
  email!: string;
  
  @MinLength(6)
  password!: string;
}
```

---

## 🛠️ Cómo Agregar una Nueva Feature

### Ejemplo: Agregar módulo "Category"

#### 1. **Domain Layer**

```bash
# Crear archivos
src/domain/
├── entities/
│   └── category.entity.ts       # Entidad Category
├── value-objects/
│   └── category-name.vo.ts      # Value Object (opcional)
└── repositories/
    └── category.repository.interface.ts
```

```typescript
// category.entity.ts
export class Category {
  private constructor(props: CategoryProps) { ... }
  
  static create(props): Category { ... }
  static fromData(data): Category { ... }
  
  updateName(name: string): Category { ... }
}

// category.repository.interface.ts
export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  create(category: Category): Promise<Category>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
```

#### 2. **Application Layer**

```bash
src/application/use-cases/category/
├── commands/
│   ├── create-category.command.ts
│   └── update-category.command.ts
└── queries/
    ├── get-category-by-id.query.ts
    └── get-categories.query.ts
```

```typescript
// create-category.command.ts
@Injectable()
export class CreateCategoryCommand {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private categoryRepo: ICategoryRepository,
  ) {}
  
  async execute(dto: CreateCategoryDto): Promise<Category> {
    const category = Category.create({ name: dto.name });
    return await this.categoryRepo.create(category);
  }
}
```

#### 3. **Infrastructure Layer**

```bash
src/infrastructure/persistence/prisma/
├── mappers/
│   └── category.mapper.ts
└── repositories/
    └── category.repository.ts
```

```typescript
// category.repository.ts
@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return category ? CategoryMapper.toDomain(category) : null;
  }
}
```

#### 4. **Presentation Layer**

```bash
src/presentation/
├── controllers/
│   └── categories.controller.ts
└── dtos/
    └── create-category.dto.ts
```

```typescript
// categories.controller.ts
@Controller('categories')
export class CategoriesController {
  constructor(
    private createCommand: CreateCategoryCommand,
    private getByIdQuery: GetCategoryByIdQuery,
  ) {}
  
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return await this.createCommand.execute(dto);
  }
}
```

#### 5. **Módulos**

```typescript
// infrastructure.module.ts
providers: [
  {
    provide: CATEGORY_REPOSITORY,
    useClass: CategoryRepository,
  },
]

// application.module.ts
providers: [
  CreateCategoryCommand,
  GetCategoryByIdQuery,
]

// presentation.module.ts
controllers: [
  CategoriesController,
]
```

#### 6. **Prisma Schema**

```prisma
model Category {
  id        String   @id @default(uuid())
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("categories")
}
```

```bash
# Crear migración
pnpx prisma migrate dev --name add_category
```

---

## 🎨 Patrones de Diseño Usados

### 1. **Factory Pattern**
```typescript
// En lugar de: new User(...)
const user = User.create({ email, password, name });
```

### 2. **Repository Pattern**
```typescript
// Interface en Domain, implementación en Infrastructure
interface IUserRepository { ... }
class UserRepository implements IUserRepository { ... }
```

### 3. **Mapper Pattern**
```typescript
// Conversión entre capas
UserMapper.toDomain(prismaUser)
UserMapper.toPrisma(domainUser)
```

### 4. **CQRS Pattern**
```typescript
// Separar escritura y lectura
CreateUserCommand  // Write
GetUserByIdQuery   // Read
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué no usar `new User()`?

Porque los factory methods (`create()`, `fromData()`) hacen explícita la intención:
- `create()` = nuevo usuario
- `fromData()` = reconstruir desde DB

### ¿Por qué las entidades son inmutables?

Evita efectos secundarios inesperados. Cada cambio retorna una nueva instancia:

```typescript
// ❌ Mutable (peligroso)
user.email = newEmail;

// ✅ Inmutable (seguro)
const updatedUser = user.updateEmail(newEmail);
```

### ¿Cuándo usar Value Objects?

Cuando un concepto:
1. No necesita ID
2. Tiene validación compleja
3. Se compara por valor

Ejemplos: Email, Price, Address, PhoneNumber

### ¿Dónde va la validación?

- **DTOs**: Validación de formato (class-validator)
- **Value Objects**: Validación de reglas de negocio
- **Entities**: Validación de consistencia

---

## 🚀 Próximos Pasos

1. **Agrega autenticación completa** (JWT, Guards)
2. **Implementa tests** (unit, integration, e2e)
3. **Agrega Swagger** para documentación
4. **Implementa eventos** de dominio
5. **Agrega caché** (Redis)

---

## 📖 Recursos Recomendados

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [NestJS Documentation](https://docs.nestjs.com)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

¡Feliz coding! 🎉


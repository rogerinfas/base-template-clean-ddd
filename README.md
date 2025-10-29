# 🏗️ Template Base - Clean Architecture + DDD

Template educativa para proyectos NestJS con **Clean Architecture** y **Domain-Driven Design (DDD)**.

## 📚 ¿Qué aprenderás?

Este template demuestra:

- ✅ **Clean Architecture** con separación de capas
- ✅ **Domain-Driven Design (DDD)** - Entidades ricas con lógica de negocio
- ✅ **CQRS** - Separación de comandos y consultas
- ✅ **Value Objects** - Encapsulación de lógica de validación
- ✅ **Repository Pattern** - Inversión de dependencias
- ✅ **Prisma ORM** - Type-safe database access
- ✅ **Autenticación JWT** - Sistema de autenticación completo
- ✅ **Guards & Decorators** - Control de acceso
- ✅ **Tests Unitarios** - Ejemplos de testing

## 🏛️ Arquitectura

```
src/
├── domain/              # Capa de Dominio (núcleo del negocio)
│   ├── entities/        # Entidades con lógica de negocio
│   ├── value-objects/   # Objetos de valor inmutables
│   ├── repositories/    # Interfaces de repositorios
│   └── exceptions/      # Excepciones de dominio
│
├── application/         # Capa de Aplicación (casos de uso)
│   └── use-cases/       
│       ├── commands/    # Comandos (escritura)
│       ├── queries/     # Consultas (lectura)
│       └── dtos/        # Data Transfer Objects
│
├── infrastructure/      # Capa de Infraestructura (detalles técnicos)
│   ├── persistence/     # Implementación de repositorios
│   └── config/          # Configuración
│
├── presentation/        # Capa de Presentación (API)
│   ├── controllers/     # Controladores HTTP
│   ├── dtos/            # DTOs de request/response
│   ├── guards/          # Guards de autenticación/autorización
│   └── decorators/      # Decoradores personalizados
│
├── config/              # Configuración global
│   ├── database/        # Prisma setup
│   └── logger/          # Logger service
│
└── shared/              # Código compartido
    └── constants/       # Constantes
```

## 🎯 Principios Aplicados

### 1. **Inversión de Dependencias**
Las capas internas NO conocen las externas:
- ✅ Dominio define interfaces de repositorios
- ✅ Infraestructura implementa esas interfaces
- ✅ Aplicación solo usa las interfaces

### 2. **Entidades Ricas**
Las entidades no son simples DTOs:
```typescript
// ❌ Mal - Entidad anémica
class User {
  id: string;
  email: string;
  password: string;
}

// ✅ Bien - Entidad rica con lógica
class User {
  private constructor(props) { ... }
  
  static create(props): User { ... }
  updateEmail(email: Email): User { ... }
  isActive(): boolean { ... }
}
```

### 3. **CQRS**
Separación clara entre escritura y lectura:
- **Commands**: Cambian el estado (CreateUserCommand)
- **Queries**: Solo leen datos (GetUserByIdQuery)

### 4. **Value Objects**
Encapsulan validación y lógica:
```typescript
class Email {
  private constructor(private value: string) {
    this.validate(value);
  }
  // Validación centralizada
}
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

### 2. Base de Datos

```bash
# Generar cliente Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma:migrate

# (Opcional) Poblar base de datos
pnpm seed

# Ver base de datos
pnpm prisma:studio
```

### 3. Ejecutar

```bash
# Desarrollo
pnpm start:dev

# Producción
pnpm build
pnpm start:prod
```

## 📖 Ejemplos de Uso

### Crear un Usuario

```bash
POST /api/users
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### Listar Productos

```bash
GET /api/products?page=1&pageSize=10
```

### Crear Producto

```bash
POST /api/products
{
  "name": "Laptop HP",
  "description": "Laptop profesional",
  "price": 999.99,
  "stock": 10
}
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests con coverage
pnpm test:cov

# Tests en watch mode
pnpm test:watch
```

## 📁 Estructura de Cada Módulo

Ejemplo con módulo **Product**:

```
product/
├── domain/
│   ├── product.entity.ts          # Entidad con lógica
│   ├── product.repository.ts      # Interface del repositorio
│   └── value-objects/
│       └── price.vo.ts            # Value object para precio
│
├── application/
│   ├── commands/
│   │   ├── create-product.command.ts
│   │   └── update-product.command.ts
│   ├── queries/
│   │   ├── get-product.query.ts
│   │   └── get-products.query.ts
│   └── dtos/
│       └── product.dto.ts
│
├── infrastructure/
│   └── persistence/
│       └── product.repository.ts  # Implementación con Prisma
│
└── presentation/
    ├── controllers/
    │   └── product.controller.ts
    └── dtos/
        └── create-product.request.ts
```

## 🎓 Conceptos Clave

### Entity vs DTO vs Value Object

| Concepto | Identidad | Mutabilidad | Uso |
|----------|-----------|-------------|-----|
| **Entity** | Sí (ID único) | Inmutable (retorna nueva instancia) | Objetos del dominio |
| **DTO** | No | Mutable | Transferencia de datos |
| **Value Object** | No (igualdad por valor) | Inmutable | Conceptos del dominio sin identidad |

### Command vs Query

| Aspecto | Command | Query |
|---------|---------|-------|
| **Propósito** | Modificar estado | Leer datos |
| **Retorno** | void o entidad modificada | Datos solicitados |
| **Side effects** | Sí (persiste cambios) | No |
| **Ejemplo** | CreateUserCommand | GetUserByIdQuery |

## 🔒 Seguridad

- ✅ Passwords hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Guards para proteger rutas
- ✅ Validación de DTOs con class-validator
- ✅ Sanitización de inputs

## 📚 Recursos Adicionales

- [NestJS Documentation](https://docs.nestjs.com)
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Prisma Docs](https://www.prisma.io/docs)

## 🤝 Contribuir

Este es un proyecto educativo. Si encuentras mejoras o errores, ¡las pull requests son bienvenidas!

## 📝 Licencia

MIT

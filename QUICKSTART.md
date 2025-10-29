# ⚡ Quick Start - 5 minutos

## 1. Instalación

```bash
# Clonar o copiar el template
cd base-template-clean-ddd

# Instalar dependencias
pnpm install
```

## 2. Base de Datos

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d

# Crear archivo .env (copiar desde .env.example)
echo 'NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/template_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d' > .env

# Generar cliente Prisma
pnpx prisma generate

# Ejecutar migraciones
pnpx prisma migrate dev

# Poblar con datos de ejemplo
pnpm seed
```

## 3. Ejecutar

```bash
# Modo desarrollo
pnpm start:dev

# La API estará en: http://localhost:4000/api
```

## 4. Probar API

### Crear Usuario
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

### Listar Usuarios
```bash
curl http://localhost:4000/api/users
```

### Crear Producto
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop HP",
    "description": "Laptop profesional",
    "price": 999.99,
    "stock": 10
  }'
```

### Listar Productos (con paginación)
```bash
curl http://localhost:4000/api/products?page=1&pageSize=10
```

## 5. Ver Base de Datos

```bash
# Abrir Prisma Studio
pnpx prisma studio

# Se abrirá en: http://localhost:5555
```

## 6. Ejecutar Tests

```bash
pnpm test
```

---

## 📁 Estructura del Proyecto

```
src/
├── domain/              # ⭐ Núcleo - Lógica de negocio
│   ├── entities/        # User, Product
│   ├── value-objects/   # Email, Price
│   ├── repositories/    # Interfaces
│   └── exceptions/      # Excepciones de dominio
│
├── application/         # Casos de uso (CQRS)
│   └── use-cases/
│       ├── user/
│       │   ├── commands/    # CreateUser
│       │   └── queries/     # GetUserById, GetAllUsers
│       └── product/
│           ├── commands/    # CreateProduct, UpdateProduct
│           └── queries/     # GetProductsPaginated
│
├── infrastructure/      # Implementaciones técnicas
│   └── persistence/
│       └── prisma/
│           ├── mappers/      # Prisma ↔ Domain
│           └── repositories/ # Implementaciones
│
└── presentation/        # API HTTP
    ├── controllers/     # UsersController, ProductsController
    ├── dtos/            # Validación de entrada
    └── filters/         # Manejo de excepciones
```

---

## 🎯 Próximos Pasos

1. Lee **[GUIDE.md](./GUIDE.md)** para entender la arquitectura
2. Lee **[TESTS.md](./TESTS.md)** para aprender sobre testing
3. Agrega tu propia entidad siguiendo los ejemplos
4. Experimenta modificando User y Product

---

## 🆘 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar contenedor
docker-compose restart
```

### Prisma no encuentra la base de datos
```bash
# Regenerar cliente
pnpx prisma generate

# Resetear base de datos (⚠️ borra datos)
pnpx prisma migrate reset
```

### Puerto 4000 en uso
Edita `.env` y cambia `PORT=4000` a otro puerto.

---

¡Listo! 🚀 Ya tienes un backend con Clean Architecture funcionando.


# 📑 Índice de Documentación

## 🚀 Para Empezar

1. **[QUICKSTART.md](./QUICKSTART.md)** ⭐ **EMPIEZA AQUÍ**
   - Instalación en 5 minutos
   - Comandos básicos
   - Pruebas rápidas de API

2. **[README.md](./README.md)**
   - Introducción al template
   - Características principales
   - Arquitectura general

## 📚 Documentación Detallada

3. **[GUIDE.md](./GUIDE.md)** ⭐ **MÁS IMPORTANTE**
   - Conceptos clave explicados
   - Cómo agregar nuevas features
   - Patrones de diseño
   - Preguntas frecuentes

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Diagramas de capas
   - Flujo de una request
   - Principios SOLID aplicados
   - Comparación DDD vs Anemic Model

5. **[TESTS.md](./TESTS.md)**
   - Ejemplos de tests unitarios
   - Estructura de tests
   - Cómo ejecutar tests

6. **[SUMMARY.md](./SUMMARY.md)**
   - Resumen ejecutivo
   - Qué incluye el template
   - Estadísticas
   - Próximos pasos

## 🎯 Orden de Lectura Recomendado

### Para Principiantes
1. **QUICKSTART.md** - Ejecuta el proyecto
2. **README.md** - Entiende qué es
3. **GUIDE.md** - Aprende los conceptos
4. **TESTS.md** - Escribe tests

### Para Intermedios
1. **QUICKSTART.md** - Setup rápido
2. **ARCHITECTURE.md** - Entiende la arquitectura
3. **GUIDE.md** - Cómo agregar features
4. **SUMMARY.md** - Visión general

### Para Avanzados
1. **QUICKSTART.md** - Setup
2. Lee el código fuente directamente
3. **ARCHITECTURE.md** - Para refrescar conceptos
4. Modifica y experimenta

## 📁 Archivos del Proyecto

### Configuración
- `package.json` - Dependencias y scripts
- `tsconfig.json` - TypeScript en modo estricto
- `nest-cli.json` - Configuración de NestJS
- `docker-compose.yml` - Base de datos PostgreSQL
- `.gitignore` - Archivos ignorados

### Base de Datos
- `prisma/schema.prisma` - Schema con User y Product
- `prisma/seed.ts` - Datos de ejemplo

### Código Fuente
- `src/main.ts` - Entry point
- `src/app.module.ts` - Módulo raíz
- `src/domain/` - Entidades, Value Objects, Interfaces
- `src/application/` - Use Cases (Commands y Queries)
- `src/infrastructure/` - Implementaciones (Repositories)
- `src/presentation/` - Controllers y DTOs

## 🔍 Búsqueda Rápida

### ¿Necesitas saber cómo...?

**Crear una entidad**
→ Ver: `src/domain/entities/user.entity.ts`
→ Leer: GUIDE.md sección "Cómo Agregar una Nueva Feature"

**Crear un Value Object**
→ Ver: `src/domain/value-objects/email.vo.ts`
→ Leer: GUIDE.md sección "Value Objects"

**Crear un Command**
→ Ver: `src/application/use-cases/user/commands/create-user.command.ts`
→ Leer: GUIDE.md sección "Commands vs Queries"

**Crear un Query**
→ Ver: `src/application/use-cases/user/queries/get-user-by-id.query.ts`

**Crear un Repository**
→ Ver: `src/infrastructure/persistence/prisma/repositories/user.repository.ts`
→ Leer: GUIDE.md sección "Repository Pattern"

**Crear un Controller**
→ Ver: `src/presentation/controllers/users.controller.ts`

**Escribir tests**
→ Ver: `src/domain/value-objects/email.vo.spec.ts`
→ Leer: TESTS.md

## 🎓 Recursos Externos

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD - Martin Fowler](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## ❓ Soporte

Si tienes dudas:
1. Revisa los archivos de documentación
2. Lee los comentarios en el código
3. Experimenta modificando el código
4. Consulta la documentación oficial de NestJS/Prisma

---

**¡Comienza con [QUICKSTART.md](./QUICKSTART.md)!** 🚀


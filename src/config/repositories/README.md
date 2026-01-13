# Sistema de Filtrado Avanzado - BasePrismaRepository

## 📋 Descripción General

El `BasePrismaRepository` proporciona un sistema de filtrado flexible y potente para consultas Prisma. Permite construir dinámicamente cláusulas `WHERE` complejas con soporte para:

- ✅ Filtros básicos por campo
- ✅ Filtros relacionales anidados (recursivos)
- ✅ Filtros numéricos con operadores
- ✅ Filtros de fecha con rangos y operadores
- ✅ Lógica OR/AND
- ✅ Múltiples filtros del mismo tipo
- ✅ Campos enum y fecha con tratamiento especial

---

## 🏗️ Arquitectura

### Interfaces Principales

```typescript
// Filtro principal que engloba todos los tipos
interface FilterOptions<T> {
  searchByField?: BaseFilterOptions<T>;
  searchByFieldsRelational?: SearchByFieldsRelational<T>[];
  OR?: {
    searchByField?: BaseFilterOptions<T>;
    searchByFieldsRelational?: SearchByFieldsRelational<T>[];
  };
  fieldNumber?: FieldNumberOptions<T>;      // Un solo filtro numérico
  fieldNumbers?: FieldNumberOptions<T>[];   // Múltiples filtros numéricos
  fieldDate?: FieldDateOptions<T>;          // Un solo filtro de fecha
  fieldDates?: FieldDateOptions<T>[];       // Múltiples filtros de fecha
}

// Filtros numéricos con operadores
interface FieldNumberOptions<T> {
  field: keyof T;
  value: number;
  operator: 'equals' | 'in' | 'notIn' | 'lt' | 'lte' | 'gt' | 'gte' | 'not';
}

// Filtros de fecha con rangos y operadores
interface FieldDateOptions<T> {
  field: keyof T;
  value: string; // Formato: "2023-01-01 - 2023-12-31" o "2023-01-01"
  operator?: 'range' | 'equals' | 'gte' | 'lte' | 'gt' | 'lt';
}
```

---

## 🚀 Ejemplos de Uso

### 1. Filtros Básicos

```typescript
const filterOptions = {
  searchByField: {
    name: "Juan",           // ILIKE '%Juan%'
    status: "ACTIVE",       // = 'ACTIVE' (si es enum)
    email: "gmail"          // ILIKE '%gmail%'
  }
};
```

### 2. Filtros Relacionales

```typescript
const filterOptions = {
  searchByFieldsRelational: [
    {
      project: {
        name: "Innovación",           // project.name ILIKE '%Innovación%'
        warehouse: {
          location: "Madrid"          // project.warehouse.location ILIKE '%Madrid%'
        }
      }
    },
    {
      department: {
        name: "IT"                    // department.name ILIKE '%IT%'
      }
    }
  ]
};
```

### 3. Filtros Numéricos (Recursivos)

```typescript
const filterOptions = {
  // Un solo filtro
  fieldNumber: {
    field: "age",
    value: 18,
    operator: "gte"                   // age >= 18
  },
  
  // Múltiples filtros (incluyendo relaciones)
  fieldNumbers: [
    { field: "age", value: 18, operator: "gte" },
    { field: "salary", value: 50000, operator: "lt" },
    { field: "project.budget", value: 1000, operator: "gte" },
    { field: "warehouse.capacity", value: 100, operator: "gt" }
  ]
};
```

### 4. Filtros de Fecha (Rangos y Operadores)

```typescript
const filterOptions = {
  // Un solo filtro de fecha
  fieldDate: {
    field: "createdAt",
    value: "2023-01-01 - 2023-12-31"  // Rango automático
  },
  
  // Múltiples filtros de fecha
  fieldDates: [
    {
      field: "createdAt",
      value: "2023-01-01 - 2023-06-30"        // Rango: gte && lte
    },
    {
      field: "project.startDate",
      value: "2023-06-01",
      operator: "gte"                          // >= 2023-06-01
    },
    {
      field: "warehouse.lastInventory",
      value: "2023-05-01",
      operator: "lt"                           // < 2023-05-01
    }
  ]
};
```

### 5. Lógica OR

```typescript
const filterOptions = {
  // Condiciones AND principales
  searchByField: {
    status: "ACTIVE"
  },
  
  // Condiciones OR
  OR: {
    searchByField: {
      email: "gmail",       // email ILIKE '%gmail%'
      phone: "123"          // phone ILIKE '%123%'
    },
    searchByFieldsRelational: [
      {
        department: {
          name: "IT"        // department.name ILIKE '%IT%'
        }
      }
    ]
  }
};
```

### 6. Ejemplo Completo

```typescript
const filterOptions = {
  // Filtros básicos
  searchByField: {
    name: "Juan",
    status: "ACTIVE"
  },
  
  // Filtros relacionales
  searchByFieldsRelational: [
    {
      project: {
        name: "Backend",
        warehouse: {
          location: "Madrid"
        }
      }
    }
  ],
  
  // Filtros numéricos múltiples
  fieldNumbers: [
    { field: "age", value: 25, operator: "gte" },
    { field: "project.budget", value: 50000, operator: "lt" },
    { field: "warehouse.capacity", value: 1000, operator: "gte" }
  ],
  
  // Filtros de fecha múltiples
  fieldDates: [
    { field: "createdAt", value: "2023-01-01 - 2023-12-31" },
    { field: "project.startDate", value: "2023-06-01", operator: "gte" },
    { field: "lastLogin", value: "2023-11-01", operator: "gte" }
  ],
  
  // Lógica OR
  OR: {
    searchByField: {
      email: "company.com"
    },
    searchByFieldsRelational: [
      {
        role: {
          name: "admin"
        }
      }
    ]
  }
};
```

---

## 📝 Resultado SQL Generado

El ejemplo completo anterior generaría algo equivalente a:

```sql
SELECT * FROM users 
WHERE 
  name ILIKE '%Juan%' 
  AND status = 'ACTIVE'
  AND age >= 25
  AND createdAt >= '2023-01-01' AND createdAt <= '2023-12-31'
  AND lastLogin >= '2023-11-01'
  AND EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.userId = users.id 
      AND p.name ILIKE '%Backend%'
      AND p.budget < 50000
      AND p.startDate >= '2023-06-01'
      AND EXISTS (
        SELECT 1 FROM warehouses w 
        WHERE w.projectId = p.id 
          AND w.location ILIKE '%Madrid%'
          AND w.capacity >= 1000
      )
  )
  AND (
    email ILIKE '%company.com%'
    OR EXISTS (
      SELECT 1 FROM roles r 
      WHERE r.userId = users.id 
        AND r.name ILIKE '%admin%'
    )
  )
```

---

## ⚙️ Configuración en Repositorios

### Uso Básico

```typescript
export class UserRepository extends BasePrismaRepository<User, UserWhereInput, UserOrderByInput> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findManyPaginated(params: FindManyPaginatedParams<User>) {
    const client = this.getClient();
    
    const where = this.buildWhereClause(
      params.filterOptions,
      ['status', 'role'],      // Campos enum
      ['createdAt', 'updatedAt', 'lastLogin'] // Campos fecha
    );
    
    const orderBy = this.buildOrderByClause(params.sortOptions, true, true);
    
    return await client.user.findMany({
      where,
      orderBy,
      // ... resto de configuración
    });
  }
}
```

### Especificando Campos Especiales

```typescript
// Al llamar buildWhereClause, especifica:
const where = this.buildWhereClause(
  filterOptions,
  ['status', 'type', 'category'],           // Campos ENUM
  ['createdAt', 'updatedAt', 'birthDate']   // Campos FECHA
);
```

---

## 🔧 Características Técnicas

### Soporte Recursivo
- ✅ Campos anidados de cualquier profundidad: `project.warehouse.location.city`
- ✅ Filtros numéricos en relaciones: `project.budget >= 1000`
- ✅ Filtros de fecha en relaciones: `project.startDate >= '2023-01-01'`

### Tratamiento de Tipos
- **Strings**: `ILIKE '%valor%'` (case-insensitive)
- **Enums**: Coincidencia exacta `= 'valor'`
- **Fechas**: Conversión automática a `Date()` con operadores
- **Números**: Operadores matemáticos (`>=`, `<`, etc.)

### Rangos de Fecha
```typescript
// Formato de rango (automático)
value: "2023-01-01 - 2023-12-31"
// Genera: { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') }

// Fecha simple con operador
value: "2023-06-01", operator: "gte"
// Genera: { gte: new Date('2023-06-01') }
```

### Operadores Disponibles

**Numéricos:**
- `equals`, `in`, `notIn`, `lt`, `lte`, `gt`, `gte`, `not`

**Fechas:**
- `range` (automático para rangos), `equals`, `gte`, `lte`, `gt`, `lt`

---

## 🎯 Ventajas

1. **Flexibilidad Total**: Un solo sistema para todos los tipos de filtros
2. **Type Safety**: TypeScript completo con genéricos
3. **Recursión Profunda**: Soporta relaciones anidadas complejas  
4. **Retrocompatibilidad**: Los filtros existentes siguen funcionando
5. **Performance**: Genera consultas SQL optimizadas
6. **Mantenibilidad**: Código centralizado y reutilizable

---

## 🚨 Consideraciones

- Los campos enum deben especificarse en el array `enumFields`
- Los campos fecha deben especificarse en el array `dateFields`
- Los rangos de fecha usan formato: `"YYYY-MM-DD - YYYY-MM-DD"`
- Las fechas simples usan formato: `"YYYY-MM-DD"`
- Los filtros `fieldNumbers` y `fieldDates` son arrays para múltiples condiciones
- Los filtros `fieldNumber` y `fieldDate` son objetos únicos (retrocompatibilidad)

---

## 📚 Ejemplos Prácticos por Caso de Uso

### Buscar Usuarios por Rango de Edad y Proyecto
```typescript
{
  fieldNumbers: [
    { field: "age", value: 25, operator: "gte" },
    { field: "age", value: 65, operator: "lt" }
  ],
  searchByFieldsRelational: [
    { project: { status: "ACTIVE" } }
  ]
}
```

### Buscar Items Creados en el Último Mes
```typescript
{
  fieldDates: [
    { 
      field: "createdAt", 
      value: "2023-11-01", 
      operator: "gte" 
    }
  ]
}
```

### Buscar por Email O Teléfono
```typescript
{
  OR: {
    searchByField: {
      email: "gmail",
      phone: "123"
    }
  }
}
```

Este sistema proporciona una base sólida y escalable para manejar consultas complejas en toda la aplicación! 🚀 
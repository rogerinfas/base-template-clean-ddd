# Application Utilities

Este directorio contiene utilidades compartidas a nivel de capa de aplicación.

## Módulos Disponibles

### 📅 `quarter-utils.ts`

Utilidades para cálculos de trimestres (quarters) con soporte para zona horaria de Perú.

**Características principales:**
- Cálculo de trimestre actual/anterior/siguiente
- Conversión entre fechas y trimestres
- Rangos de fechas para queries de base de datos
- Cálculo de porcentaje de crecimiento
- Formateo en español para reportes

**Documentación completa**: [`/docs/quarter-utils-guide.md`](../../../docs/quarter-utils-guide.md)

**Integración con**: `@app/code-generator/application/utils/peru-datetime.ts`

**Casos de uso:**
- KPI Dashboards (clientes, ventas, etc.)
- Reportes trimestrales
- Consultas de base de datos con filtros de fecha
- Análisis de crecimiento período a período

**Ejemplo rápido:**
```typescript
import { getQuarterComparison, calculateGrowthPercentage } from './quarter-utils';

// Obtener trimestre actual y anterior
const { current, previous } = getQuarterComparison();

// Consultar datos
const [currentData, previousData] = await Promise.all([
    repo.getDataForQuarter(current.year, current.quarter),
    repo.getDataForQuarter(previous.year, previous.quarter),
]);

// Calcular crecimiento
const growth = calculateGrowthPercentage(currentData, previousData);
```

## Principios de Diseño

Estas utilidades siguen los principios de Clean Architecture:

1. **Independencia de Frameworks**: No dependen de NestJS, Prisma u otros frameworks
2. **Testabilidad**: Funciones puras fáciles de testear
3. **Reutilización**: Pueden usarse en cualquier capa de la aplicación
4. **Single Responsibility**: Cada función tiene una responsabilidad clara
5. **Type Safety**: Aprovechan TypeScript para prevenir errores

## Convenciones

- **Nomenclatura**: camelCase para funciones, PascalCase para tipos/interfaces
- **Documentación**: Cada función incluye JSDoc con descripción, parámetros y ejemplos
- **Testing**: Cada utilidad debe tener tests unitarios correspondientes
- **Exportación**: Usar named exports (no default exports)

## Agregar Nuevas Utilidades

Al agregar nuevas utilidades a este directorio:

1. ✅ Crear archivo con nombre descriptivo: `feature-utils.ts`
2. ✅ Documentar con JSDoc todas las funciones públicas
3. ✅ Crear tests unitarios: `feature-utils.spec.ts`
4. ✅ Actualizar este README con la nueva utilidad
5. ✅ Considerar crear guía detallada en `/docs/` si es complejo

## Referencias

- **Guía de Quarter Utils**: `/docs/quarter-utils-guide.md`
- **Peru DateTime**: `/libs/code-generator/src/application/utils/peru-datetime.ts`
- **Ejemplo de uso**: `/src/application/use-cases/business-intelligence/customers/get-customer-kpis.query.use-case.ts`

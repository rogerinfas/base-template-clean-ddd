# Sistema de Seeds e Inicialización

Este módulo maneja la inicialización automática del sistema cuando la aplicación arranca.

## 📁 Estructura

```
seed/
├── config/                    # Configuraciones de datos iniciales
│   ├── admin.config.ts        # Configuración del usuario administrador
│   ├── permissions.config.ts  # Lista de permisos a crear
│   └── roles.config.ts        # Lista de roles a crear con sus permisos
│
├── services/                  # Servicios que ejecutan los seeds
│   ├── admin-seed.service.ts       # Crea el usuario administrador
│   ├── permission-seed.service.ts  # Crea los permisos del sistema
│   └── role-seed.service.ts        # Crea los roles con sus permisos
│
├── system-initialization.service.ts  # Orquestador principal
├── seed.module.ts                    # Módulo NestJS
└── README.md                         # Esta documentación
```

## 🔄 Flujo de Inicialización

El sistema se inicializa automáticamente cuando la aplicación arranca, siguiendo este orden:

1. **Permisos** → Se crean todos los permisos definidos en `permissions.config.ts`
2. **Roles** → Se crean los roles con sus permisos asignados (definidos en `roles.config.ts`)
3. **Admin** → Se crea el usuario administrador (si está configurado en `.env`)

## 📝 Configuración

### Permisos (`config/permissions.config.ts`)

Define todos los permisos que se crearán en el sistema. Cada permiso tiene el formato `resource:action`.

**Ejemplo:**
```typescript
{
    resource: ResourceType.user,
    action: ActionType.read,
    description: 'Ver/leer usuarios',
}
```

**Permisos Wildcard:**
```typescript
{
    resource: ResourceType.user,
    action: ActionType.wildcard,  // Equivale a "user:*"
    description: 'Todos los permisos de usuarios',
}
```

### Roles (`config/roles.config.ts`)

Define los roles del sistema y los permisos que tienen asignados.

**Formato de permisos:**
- `"user:read"` → Permiso específico
- `"user:*"` → Todos los permisos de usuarios
- `"*:*"` → Todos los permisos de todos los recursos

**Ejemplo:**
```typescript
{
    name: 'admin',
    description: 'Administrador con acceso completo',
    isDefault: false,
    permissions: [
        'user:*',
        'role:*',
        'customer:read',
        'customer:create',
    ],
}
```

### Usuario Administrador (`config/admin.config.ts`)

Define los datos del usuario administrador. Las credenciales se obtienen de variables de entorno:

- `ADMIN_EMAIL` → Email del administrador
- `ADMIN_PASSWORD` → Contraseña del administrador

**Nota:** Si estas variables no están configuradas, el usuario admin no se creará.

## 🎯 Características

### Idempotencia
Todos los seeds son **idempotentes**, es decir:
- No crean duplicados si el recurso ya existe
- Si un permiso ya existe, se omite
- Si un rol ya existe, se actualiza con los nuevos permisos
- Si el usuario admin ya existe, se omite la creación

### Optimización
- Los permisos se procesan en **batches** para mejor rendimiento
- Los permisos se cargan una sola vez para evitar queries repetidas
- Los errores no detienen el proceso completo

### Resiliencia
- Si un seed falla, se registra el error pero la aplicación continúa
- Los errores se loguean con detalles para facilitar el debugging

## 🚀 Uso

El sistema se ejecuta automáticamente al iniciar la aplicación. No requiere intervención manual.

### Verificar la inicialización

Revisa los logs de la aplicación al iniciar. Deberías ver mensajes como:

```
🚀 Iniciando inicialización del sistema...
📋 Creando permisos del sistema...
✅ Permisos: 150 creados, 0 ya existían
👥 Creando roles del sistema...
✅ Roles: 2 creados, 0 ya existían
👤 Verificando usuario administrador...
✅ Usuario administrador creado correctamente
✅ Sistema inicializado correctamente
```

## 🔧 Agregar Nuevos Permisos

1. Abre `config/permissions.config.ts`
2. Agrega el nuevo permiso al array `PERMISSIONS_CONFIG`:

```typescript
{
    resource: ResourceType.nuevoRecurso,
    action: ActionType.read,
    description: 'Ver nuevo recurso',
}
```

3. Reinicia la aplicación → El permiso se creará automáticamente

## 🔧 Agregar Nuevos Roles

1. Abre `config/roles.config.ts`
2. Agrega el nuevo rol al array `ROLES_CONFIG`:

```typescript
{
    name: 'nuevo-rol',
    description: 'Descripción del nuevo rol',
    isDefault: false,
    permissions: [
        'user:read',
        'user:create',
    ],
}
```

3. Reinicia la aplicación → El rol se creará automáticamente

## 📚 Servicios

### PermissionSeedService
- Crea permisos basándose en `permissions.config.ts`
- Procesa en batches para mejor rendimiento
- Omite permisos que ya existen

### RoleSeedService
- Crea roles con sus permisos asignados
- Soporta wildcards (`*:*`, `resource:*`)
- Actualiza roles existentes con nuevos permisos

### AdminSeedService
- Crea el usuario administrador
- Usa datos de `admin.config.ts` + variables de entorno
- Asigna roles al usuario admin

## ➕ Agregar Nuevos Seeds

El sistema está diseñado para ser fácilmente extensible. Para agregar un nuevo seed (por ejemplo, datos de clientes, catálogos, etc.):

> 💡 **Tip:** Usa los archivos de ejemplo como plantilla:
> - `services/EXAMPLE-seed.service.ts.example` → Plantilla para el servicio
> - `config/EXAMPLE.config.ts.example` → Plantilla para la configuración

### Paso 1: Crear el archivo de configuración

Crea un nuevo archivo en `config/` con la configuración de datos:

**`config/customers.config.ts`** (ejemplo):
```typescript
export interface CustomerConfig {
    name: string;
    email: string;
    phone: string;
    // ... otros campos
}

export const CUSTOMERS_CONFIG: CustomerConfig[] = [
    {
        name: 'Cliente Ejemplo',
        email: 'cliente@ejemplo.com',
        phone: '123456789',
    },
    // ... más clientes
];
```

### Paso 2: Crear el servicio de seed

Crea un nuevo servicio en `services/` que ejecute el seed:

**`services/customer-seed.service.ts`** (ejemplo):
```typescript
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICustomerRepository } from 'src/domain/repositories/customer/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from 'src/shared/constants/tokens';
import { CustomerConfig } from '../config/customers.config';

/**
 * Servicio de Seed de Clientes
 *
 * Este servicio crea los clientes iniciales del sistema.
 * Características:
 * - Idempotente: No crea duplicados si el cliente ya existe
 * - Optimizado: Procesa en batches si hay muchos registros
 */
@Injectable()
export class CustomerSeedService {
    private readonly logger = new Logger(CustomerSeedService.name);

    constructor(
        @Inject(CUSTOMER_REPOSITORY)
        private readonly customerRepository: ICustomerRepository,
    ) {}

    async seedCustomers(customersConfig: CustomerConfig[]): Promise<void> {
        this.logger.log(`📝 Creando ${customersConfig.length} clientes...`);

        let created = 0;
        let skipped = 0;

        for (const config of customersConfig) {
            try {
                // Verificar si el cliente ya existe
                const existing = await this.customerRepository.findByEmail(config.email);
                
                if (existing) {
                    skipped++;
                    continue;
                }

                // Crear el cliente
                const customer = Customer.create({
                    name: config.name,
                    email: config.email,
                    phone: config.phone,
                });

                await this.customerRepository.create(customer);
                created++;
            } catch (error) {
                this.logger.error(`❌ Error al crear cliente ${config.email}`, error);
            }
        }

        this.logger.log(`✅ Clientes: ${created} creados, ${skipped} ya existían`);
    }
}
```

### Paso 3: Registrar el servicio en el módulo

Agrega el servicio a `seed.module.ts`:

```typescript
@Module({
    imports: [
        RepositoriesModule,
        UseCasesModule,
    ],
    providers: [
        SystemInitializationService,
        PermissionSeedService,
        RoleSeedService,
        AdminSeedService,
        CustomerSeedService, // ← Agregar aquí
    ],
})
export class SeedModule {}
```

### Paso 4: Agregar al servicio de inicialización

1. **Importar el servicio y la configuración** en `system-initialization.service.ts`:

```typescript
import { CUSTOMERS_CONFIG } from './config/customers.config';
import { CustomerSeedService } from './services/customer-seed.service';
```

2. **Inyectar en el constructor**:

```typescript
constructor(
    private readonly permissionSeedService: PermissionSeedService,
    private readonly roleSeedService: RoleSeedService,
    private readonly adminSeedService: AdminSeedService,
    private readonly customerSeedService: CustomerSeedService, // ← Agregar aquí
) {}
```

3. **Agregar la llamada en `onApplicationBootstrap()`**:

```typescript
async onApplicationBootstrap(): Promise<void> {
    this.logger.log("🚀 Iniciando inicialización del sistema...");

    try {
        // ... seeds existentes ...

        // Nuevo seed
        this.logger.log("🏢 Creando datos de clientes...");
        await this.customerSeedService.seedCustomers(CUSTOMERS_CONFIG);

        this.logger.log("✅ Sistema inicializado correctamente");
    } catch (error) {
        // ... manejo de errores ...
    }
}
```

### Buenas Prácticas

1. **Idempotencia**: Siempre verifica si el recurso ya existe antes de crearlo
2. **Logging**: Usa logs descriptivos con emojis para mejor visibilidad
3. **Manejo de errores**: Captura errores individuales sin detener todo el proceso
4. **Orden**: Considera el orden de ejecución si un seed depende de otro
5. **Configuración**: Mantén los datos de seed en archivos de configuración separados

### Ejemplo Completo

Ver los servicios existentes como referencia:
- `services/permission-seed.service.ts` → Ejemplo de seed con batches
- `services/role-seed.service.ts` → Ejemplo de seed con dependencias
- `services/admin-seed.service.ts` → Ejemplo de seed condicional

## ⚠️ Notas Importantes

1. **Orden de ejecución:** Los permisos deben crearse antes que los roles
2. **Variables de entorno:** El usuario admin solo se crea si `ADMIN_EMAIL` y `ADMIN_PASSWORD` están configurados
3. **Wildcards:** Los permisos wildcard (`resource:*`) deben estar definidos en `permissions.config.ts` para que los roles puedan usarlos
4. **Producción:** Asegúrate de cambiar la contraseña del admin después de la primera inicialización
5. **Nuevos seeds:** Sigue el patrón establecido para mantener la consistencia del código


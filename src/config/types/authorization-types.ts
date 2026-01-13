export type ResourceName =
    | 'users'
    | 'roles'
    | 'services'
    | 'customers'
    | 'suppliers'
    | 'items'
    | 'units'
    | 'projects'
    | 'warehouse-general'
    | 'warehouse-sales'
    | 'warehouse-projects'
    | 'transfers'
    | 'commercial'
    | 'supplies'
    | 'bi-dashboard'
    | 'business-config';

export type ActionName = 'create' | 'read' | 'update' | 'delete';

export type ResourceNameEnum = {
    [key in ResourceName]: ResourceName;
};

export const resourceNameEnum: ResourceNameEnum = {
    users: 'users',
    roles: 'roles',
    services: 'services',
    customers: 'customers',
    suppliers: 'suppliers',
    items: 'items',
    units: 'units',
    projects: 'projects',
    'warehouse-general': 'warehouse-general',
    'warehouse-sales': 'warehouse-sales',
    'warehouse-projects': 'warehouse-projects',
    transfers: 'transfers',
    commercial: 'commercial',
    supplies: 'supplies',
    'bi-dashboard': 'bi-dashboard',
    'business-config': 'business-config',
};

export type ActionNameEnum = {
    [key in ActionName]: ActionName;
};

export const actionNameEnum: ActionNameEnum = {
    create: 'create',
    read: 'read',
    update: 'update',
    delete: 'delete',
    // download: 'download',
    // configure: 'configure',
};

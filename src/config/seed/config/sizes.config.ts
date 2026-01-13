/**
 * Configuración de tallas del sistema
 * Define las tallas estándar que se crearán automáticamente al inicializar el sistema
 */
export interface SizeSeedConfig {
    name: string; // Nombre descriptivo de la talla (en minúsculas)
    abbreviation: string; // Abreviatura de la talla (en mayúsculas)
}

/**
 * Lista de tallas estándar a crear en el sistema
 * Las tallas se crean con name en minúsculas y abbreviation en mayúsculas
 */
export const SIZES_SEED_CONFIG: SizeSeedConfig[] = [
    {
        name: 'muy pequeño',
        abbreviation: 'J',
    },
    {
        name: 'extra pequeño',
        abbreviation: 'XS',
    },
    {
        name: 'pequeño',
        abbreviation: 'S',
    },
    {
        name: 'mediano',
        abbreviation: 'M',
    },
    {
        name: 'grande',
        abbreviation: 'L',
    },
    {
        name: 'extra grande',
        abbreviation: 'XL',
    },
    {
        name: 'doble extra grande',
        abbreviation: '2XL',
    },
    {
        name: 'triple extra grande',
        abbreviation: '3XL',
    },
    {
        name: 'cuádruple extra grande',
        abbreviation: '4XL',
    },
    {
        name: 'quíntuple extra grande',
        abbreviation: '5XL',
    },
    {
        name: 'sextuple extra grande',
        abbreviation: '6XL',
    },
    {
        name: 'séptuple extra grande',
        abbreviation: '7XL',
    },
];

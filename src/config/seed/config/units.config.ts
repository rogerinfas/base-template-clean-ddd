/**
 * Configuración de unidades de medida del sistema para el rubro textil
 * Define las unidades estándar que se crearán automáticamente al inicializar el sistema
 * Enfocadas en insumos textiles
 */
export interface UnitSeedConfig {
    name: string; // Nombre descriptivo de la unidad
    abbreviation: string; // Abreviatura de la unidad
    description?: string; // Descripción opcional de la unidad
}

/**
 * Lista de unidades de medida estándar para el rubro textil
 * Estas unidades son las más comunes para medir insumos textiles
 */
export const UNITS_SEED_CONFIG: UnitSeedConfig[] = [
    // Unidades de longitud
    {
        name: 'Metro',
        abbreviation: 'm',
        description: 'Unidad de longitud para medir telas, cintas y materiales textiles',
    },
    {
        name: 'Centímetro',
        abbreviation: 'cm',
        description: 'Unidad de longitud para medidas pequeñas de telas y accesorios',
    },
    {
        name: 'Yarda',
        abbreviation: 'yd',
        description: 'Unidad de longitud comúnmente usada en la industria textil',
    },
    {
        name: 'Pulgada',
        abbreviation: 'in',
        description: 'Unidad de longitud para medidas precisas en textiles',
    },
    // Unidades de masa/peso
    {
        name: 'Kilogramo',
        abbreviation: 'kg',
        description: 'Unidad de masa para hilos, algodón y materiales textiles a granel',
    },
    {
        name: 'Gramo',
        abbreviation: 'g',
        description: 'Unidad de masa para insumos textiles pequeños',
    },
    // Unidades de volumen
    {
        name: 'Litro',
        abbreviation: 'L',
        description: 'Unidad de volumen para tintes, químicos y líquidos textiles',
    },
    {
        name: 'Mililitro',
        abbreviation: 'mL',
        description: 'Unidad de volumen para tintes y químicos en pequeñas cantidades',
    },
    // Unidades de conteo
    {
        name: 'Unidad',
        abbreviation: 'un',
        description: 'Unidad de conteo para botones, cierres, etiquetas y accesorios',
    },
    {
        name: 'Par',
        abbreviation: 'par',
        description: 'Unidad de conteo para guantes, calcetines y prendas en pares',
    },
    {
        name: 'Rollo',
        abbreviation: 'rollo',
        description: 'Unidad de conteo para cintas, hilos y materiales en rollo',
    },
    {
        name: 'Bobina',
        abbreviation: 'bobina',
        description: 'Unidad de conteo para hilos y cintas en bobina',
    },
    {
        name: 'Cono',
        abbreviation: 'cono',
        description: 'Unidad de conteo para hilos en cono',
    },
    // Unidades de área
    {
        name: 'Metro cuadrado',
        abbreviation: 'm²',
        description: 'Unidad de área para medir superficies de tela',
    },
];

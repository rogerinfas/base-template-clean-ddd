/**
 * Configuración de empresa del sistema
 * Define la empresa principal que se creará automáticamente al inicializar el sistema
 */
export interface BusinessSeedConfig {
    prefix: string;
    name: string;
    ruc: string;
    address?: string;
    color?: string; // Color en formato hexadecimal
    bankAccount?: {
        accountNumber: string;
        accountCci: string;
        bankName: string;
        accountType: string;
        accountHolder?: string;
        currency: 'USD' | 'PEN';
    };
    selfContact?: {
        name: string;
        lastName?: string;
        email?: string;
        phone?: string;
        phone2?: string;
    };
}

/**
 * Configuración de la empresa principal del sistema
 */
export const BUSINESS_SEED_CONFIG: BusinessSeedConfig = {
    prefix: 'WWI',
    name: 'Work Wear Industrial E.I.R.L.',
    ruc: '20497746486',
    address: 'AV. JORGE CHÁVEZ 710 URB. IV CENTENARIO AREQUIPA - AREQUIPA',
    color: '#4A90E2', // Azul medio celeste
    bankAccount: {
        accountNumber: '2151119237040',
        accountCci: '002215111923704028',
        bankName: 'BCP',
        accountType: 'Corriente',
        accountHolder: 'Work Wear Industrial E.I.R.L.',
        currency: 'PEN',
    },
    selfContact: {
        name: 'Jesús',
        lastName: 'De La Gala',
        email: 'vseguridad7@gmail.com',
        phone: '+51990038099',
        phone2: '054 201160',
    },
};

/**
 * Configuración de IMC S.R.L.
 */
export const IMC_BUSINESS_SEED_CONFIG: BusinessSeedConfig = {
    prefix: 'IMC',
    name: 'IMC S.R.L. - INDUSTRIA DE LA MODA Y LA CONFECCIÓN S.R.L.',
    ruc: '20371326082',
    address: 'CALLE LOS NARANJOS 101-B URB. OBANDO AREQUIPA - AREQUIPA',
    color: '#bcb893', // Amarillo beige
    bankAccount: {
        accountNumber: '0011 0226 0100022892 82',
        accountCci: '011 226 000100022892 82',
        bankName: 'BBVA',
        accountType: 'Corriente',
        accountHolder: 'IMC S.R.L. - INDUSTRIA DE LA MODA Y LA CONFECCIÓN S.R.L.',
        currency: 'PEN',
    },
    selfContact: {
        name: 'Jesús',
        lastName: 'De La Gala',
        email: 'vseguridad7@gmail.com',
        phone: '+51990038099',
        phone2: '054 201160',
    },
};

import { IdDocumentTypeEnum } from '@domain/types/id-document-types.type';

export interface WorkshopSeedConfig {
    idNumber: string;
    idDocumentType: IdDocumentTypeEnum;
    name: string;
    address: string;
    phone: string;
}

function getRandomDateBetween(startYear: number, endYear: number): Date {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31, 23, 59, 59).getTime();
    const ts = start + Math.random() * (end - start);
    return new Date(ts);
}

export const WORKSHOP_SEED_CONFIG: WorkshopSeedConfig[] = [
    {
        idNumber: '20123456789',
        idDocumentType: IdDocumentTypeEnum.RUC,
        name: 'Taller Textil Arequipa - Cerro Colorado',
        address: 'Av. Aviación 2450, Cerro Colorado, Arequipa',
        phone: '981111222',
    },
    {
        idNumber: '20234567890',
        idDocumentType: IdDocumentTypeEnum.RUC,
        name: 'Taller Gamarra Arequipa',
        address: 'Galería La Libertad, Av. Ejército 1200, Cayma, Arequipa',
        phone: '981222333',
    },
    {
        idNumber: '20345678901',
        idDocumentType: IdDocumentTypeEnum.RUC,
        name: 'Taller Industrial Paucarpata',
        address: 'Av. Kennedy 905, Paucarpata, Arequipa',
        phone: '981333444',
    },
    {
        idNumber: '20456789012',
        idDocumentType: IdDocumentTypeEnum.RUC,
        name: 'Taller Textil Miguel Grau',
        address: 'Urb. Miguel Grau Mz. C Lote 12, Paucarpata, Arequipa',
        phone: '981442356',
    },
    {
        idNumber: '20567890123',
        idDocumentType: IdDocumentTypeEnum.RUC,
        name: 'Taller Umacollo',
        address: 'Av. San Martín 450, Umacollo, Yanahuara, Arequipa',
        phone: '981555666',
    },
    {
        idNumber: '20678901234',
        idDocumentType: IdDocumentTypeEnum.RUC,
        name: 'Taller Central Arequipa Cercado',
        address: 'Calle San Juan de Dios 325, Cercado, Arequipa',
        phone: '981666777',
    },
];

export function getRandomCreatedAtForWorkshop(): Date {
    return getRandomDateBetween(2024, 2025);
}

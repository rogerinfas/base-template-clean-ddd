/** biome-ignore-all lint/suspicious/noExplicitAny: migration */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function normalizeSimpleDto<T extends object>(dto: T) {
    const normalizedDto: any = {};

    for (const [key, value] of Object.entries(dto)) {
        // Preservar false y 0; eliminar solo undefined, null y strings vacíos
        if (value === undefined || value === null) continue;
        if (typeof value === 'function') continue;
        if (typeof value === 'string') {
            if (value.trim().length === 0) continue;
            normalizedDto[key] = value;
            continue;
        }
        normalizedDto[key] = value;
    }

    return normalizedDto;
}
export function normalizeMapperToPrisma<T extends object>(dto: T) {
    const normalizedDto: any = {};

    for (const [key, value] of Object.entries(dto)) {
        // Preservar false y 0; eliminar solo undefined, null y strings vacíos
        if (value === undefined) continue;
        if (typeof value === 'function') continue;
        if (typeof value === 'string') {
            if (value.trim().length === 0) continue;
            normalizedDto[key] = value;
            continue;
        }
        normalizedDto[key] = value;
    }

    return normalizedDto;
}

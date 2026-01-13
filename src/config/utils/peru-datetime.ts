/**
 * Utilities for handling Peru timezone (UTC-5) date operations
 */

const PERU_UTC_OFFSET = -5; // Peru is UTC-5

/**
 * Converts a date to Peru timezone
 * @param date - The date to convert
 * @returns Date object adjusted to Peru time
 */
export function toPeruTime(date: Date): Date {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + PERU_UTC_OFFSET * 3600000);
}

/**
 * Converts a Peru time to UTC
 * @param peruDate - Date in Peru timezone
 * @returns Date object in UTC
 */
export function peruTimeToUTC(peruDate: Date): Date {
    return new Date(peruDate.getTime() - PERU_UTC_OFFSET * 3600000);
}

/**
 * Gets current time in Peru timezone
 * @returns Current date/time in Peru
 */
export function nowInPeru(): Date {
    return toPeruTime(new Date());
}

/**
 * Parses a date string assuming it's in Peru timezone
 * @param dateString - Date string to parse
 * @returns Date object adjusted from Peru time to local time
 */
export function parsePeruDateTime(dateString: string): Date {
    const date = new Date(dateString);
    return peruTimeToUTC(date);
}

export function formatPeruDateHour(date: string | Date, alreadyConverted?: boolean): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatConfig: Intl.DateTimeFormatOptions = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
    };
    if (alreadyConverted) {
        return dateObj.toLocaleDateString('es-PE', formatConfig);
    }
    const peruDate = toPeruTime(dateObj);
    return peruDate.toLocaleDateString('es-PE', formatConfig);
}

export function formatPeruDate(date: string | Date, alreadyConverted?: boolean): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatConfig: Intl.DateTimeFormatOptions = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    };
    if (alreadyConverted) {
        return dateObj.toLocaleDateString('es-PE', formatConfig);
    }
    const peruDate = toPeruTime(dateObj);
    return peruDate.toLocaleDateString('es-PE', formatConfig);
}
export function formatPeruTime(date: string | Date, alreadyConverted?: boolean): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatConfig: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    if (alreadyConverted) {
        return dateObj.toLocaleTimeString('es-PE', formatConfig);
    }
    const peruDate = toPeruTime(dateObj);
    return peruDate.toLocaleTimeString('es-PE', formatConfig);
}

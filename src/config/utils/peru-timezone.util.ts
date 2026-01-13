/**
 * Utilities for handling Peru timezone (UTC-5) date operations.
 * Useful for extracting year/month from UTC dates in Peru local time.
 */

const PERU_UTC_OFFSET_HOURS = -5;

/**
 * Converts a UTC date to Peru timezone by adjusting the timestamp.
 * The resulting Date object's UTC methods will return Peru local time values.
 *
 * @param date - Date in UTC (typically from ISO string)
 * @returns Date with timestamp adjusted so UTC methods return Peru local time
 *
 * @example
 * // UTC: 2025-01-01T04:59:59.999Z -> Peru: 2024-12-31T23:59:59.999
 * toPeruTime(new Date('2025-01-01T04:59:59.999Z'))
 *
 * // UTC: 2025-01-01T06:00:00.000Z -> Peru: 2025-01-01T01:00:00.000
 * toPeruTime(new Date('2025-01-01T06:00:00.000Z'))
 */
export function toPeruTime(date: Date): Date {
    // Subtract 5 hours because Peru is UTC-5
    // We adjust the timestamp so that getUTC* methods return Peru local time
    return new Date(date.getTime() + PERU_UTC_OFFSET_HOURS * 60 * 60 * 1000);
}

/**
 * Gets the year of a date in Peru timezone.
 * @param date - Date in UTC
 * @returns Year number in Peru timezone
 *
 * @example
 * // UTC: 2025-01-01T04:59:59.999Z -> Year in Peru: 2024
 * getPeruYear(new Date('2025-01-01T04:59:59.999Z')) // Returns 2024
 *
 * // UTC: 2025-01-01T06:00:00.000Z -> Year in Peru: 2025
 * getPeruYear(new Date('2025-01-01T06:00:00.000Z')) // Returns 2025
 */
export function getPeruYear(date: Date): number {
    // Use getUTCFullYear on the adjusted date to avoid server timezone interference
    return toPeruTime(date).getUTCFullYear();
}

/**
 * Gets the month of a date in Peru timezone (1-12).
 * @param date - Date in UTC
 * @returns Month number 1-12 in Peru timezone
 *
 * @example
 * // UTC: 2025-01-01T04:59:59.999Z -> Month in Peru: 12 (December)
 * getPeruMonth(new Date('2025-01-01T04:59:59.999Z')) // Returns 12
 *
 * // UTC: 2025-01-01T06:00:00.000Z -> Month in Peru: 1 (January)
 * getPeruMonth(new Date('2025-01-01T06:00:00.000Z')) // Returns 1
 */
export function getPeruMonth(date: Date): number {
    // Use getUTCMonth on the adjusted date to avoid server timezone interference
    return toPeruTime(date).getUTCMonth() + 1; // getUTCMonth() returns 0-11, we need 1-12
}

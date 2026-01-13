/**
 * Utilities for handling quarterly date calculations
 * Works in conjunction with Peru timezone utilities
 */

import { nowInPeru } from '@config/utils/peru-datetime';

export type QuarterNumber = 1 | 2 | 3 | 4;
export const QUARTERS: QuarterNumber[] = [1, 2, 3, 4];

/**
 * Represents a quarter period
 */
export interface Quarter {
    year: number;
    quarter: QuarterNumber;
    label: string;
}

/**
 * Represents a quarter date range
 */
export interface QuarterRange {
    startDate: Date;
    endDate: Date;
    quarter: Quarter;
}

/**
 * Gets the current quarter based on Peru timezone
 * @returns Current quarter information
 */
export function getCurrentQuarter(): Quarter {
    const now = nowInPeru();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentQuarter = Math.ceil(currentMonth / 3) as QuarterNumber;

    return {
        year: currentYear,
        quarter: currentQuarter,
        label: `Q${currentQuarter} ${currentYear}`,
    };
}

/**
 * Gets the previous quarter based on a given quarter
 * Handles year rollover correctly
 * @param quarter - The reference quarter
 * @returns Previous quarter information
 */
export function getPreviousQuarter(quarter: Quarter): Quarter {
    let previousQuarter: QuarterNumber;
    let previousYear = quarter.year;

    if (quarter.quarter === 1) {
        previousQuarter = 4;
        previousYear = quarter.year - 1;
    } else {
        previousQuarter = (quarter.quarter - 1) as QuarterNumber;
    }

    return {
        year: previousYear,
        quarter: previousQuarter,
        label: `Q${previousQuarter} ${previousYear}`,
    };
}

/**
 * Gets the next quarter based on a given quarter
 * Handles year rollover correctly
 * @param quarter - The reference quarter
 * @returns Next quarter information
 */
export function getNextQuarter(quarter: Quarter): Quarter {
    let nextQuarter: QuarterNumber;
    let nextYear = quarter.year;

    if (quarter.quarter === 4) {
        nextQuarter = 1;
        nextYear = quarter.year + 1;
    } else {
        nextQuarter = (quarter.quarter + 1) as QuarterNumber;
    }

    return {
        year: nextYear,
        quarter: nextQuarter,
        label: `Q${nextQuarter} ${nextYear}`,
    };
}

/**
 * Gets the date range for a specific quarter
 * Uses Peru timezone for calculations
 * @param year - The year
 * @param quarter - The quarter number (1-4)
 * @returns Start and end dates for the quarter
 */
export function getQuarterDateRange(year: number, quarter: QuarterNumber): QuarterRange {
    // Calculate start and end months for the quarter
    const startMonth = (quarter - 1) * 3; // 0-indexed: Q1=0, Q2=3, Q3=6, Q4=9
    const endMonth = startMonth + 3;

    // Create dates in Peru timezone
    const startDate = new Date(year, startMonth, 1, 0, 0, 0, 0);
    const endDate = new Date(year, endMonth, 0, 23, 59, 59, 999);

    return {
        startDate,
        endDate,
        quarter: {
            year,
            quarter,
            label: `Q${quarter} ${year}`,
        },
    };
}

/**
 * Gets the quarter for a specific date
 * @param date - The date to check
 * @returns Quarter information for the given date
 */
export function getQuarterFromDate(date: Date): Quarter {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter = Math.ceil(month / 3) as QuarterNumber;

    return {
        year,
        quarter,
        label: `Q${quarter} ${year}`,
    };
}

/**
 * Calculates the growth percentage between two values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Growth percentage (rounded to nearest integer)
 */
export function calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
}

/**
 * Gets quarter comparison data (current vs previous)
 * Useful for KPI dashboards
 */
export function getQuarterComparison(): {
    current: Quarter;
    previous: Quarter;
} {
    const current = getCurrentQuarter();
    const previous = getPreviousQuarter(current);

    return { current, previous };
}

/**
 * Checks if a date falls within a specific quarter
 * @param date - The date to check
 * @param year - The quarter year
 * @param quarter - The quarter number (1-4)
 * @returns True if the date is within the quarter
 */
export function isDateInQuarter(date: Date, year: number, quarter: QuarterNumber): boolean {
    const { startDate, endDate } = getQuarterDateRange(year, quarter);
    return date >= startDate && date <= endDate;
}

/**
 * Gets all quarters for a specific year
 * @param year - The year
 * @returns Array of quarters for the year
 */
export function getYearQuarters(year: number): Quarter[] {
    return QUARTERS.map((q) => ({
        year,
        quarter: q,
        label: `Q${q} ${year}`,
    }));
}

/**
 * Gets quarters between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of quarters between the dates
 */
export function getQuartersBetweenDates(startDate: Date, endDate: Date): Quarter[] {
    const quarters: Quarter[] = [];
    let current = getQuarterFromDate(startDate);
    const end = getQuarterFromDate(endDate);

    // Add starting quarter
    quarters.push(current);

    // Add quarters until we reach the end
    while (current.year < end.year || (current.year === end.year && current.quarter < end.quarter)) {
        current = getNextQuarter(current);
        quarters.push(current);
    }

    return quarters;
}

/**
 * Formats a quarter for display
 * @param quarter - The quarter to format
 * @param format - Format style ('short' | 'long' | 'numeric')
 * @returns Formatted quarter string
 */
export function formatQuarter(quarter: Quarter, format: 'short' | 'long' | 'numeric' = 'short'): string {
    switch (format) {
        case 'short':
            return quarter.label; // e.g., "Q1 2025"
        case 'long':
            return `${getQuarterName(quarter.quarter)} ${quarter.year}`; // e.g., "Primer Trimestre 2025"
        case 'numeric':
            return `${quarter.year}-Q${quarter.quarter}`; // e.g., "2025-Q1"
        default:
            return quarter.label;
    }
}

/**
 * Gets the Spanish name for a quarter
 * @param quarter - Quarter number (1-4)
 * @returns Spanish name of the quarter
 */
function getQuarterName(quarter: QuarterNumber): string {
    const names: Record<QuarterNumber, string> = {
        1: 'Primer Trimestre',
        2: 'Segundo Trimestre',
        3: 'Tercer Trimestre',
        4: 'Cuarto Trimestre',
    };
    return names[quarter];
}

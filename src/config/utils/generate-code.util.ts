import { v4 as uuidv4 } from 'uuid';

export function generateCode(prefix: string): string {
    // Use the provided prefix
    // Get last 3 digits of timestamp (milliseconds)
    const timestamp = Date.now().toString().slice(-3);

    // Generate a UUID and take first 4 characters (uppercase, no dashes)
    const uuid = uuidv4();
    const uuidShort = uuid.replace(/-/g, '').substring(0, 4).toUpperCase();

    // Concatenate all parts
    return `${prefix}${timestamp}${uuidShort}`;
}

export const joinUrlPath = (...parts: string[]) => {
    if (parts.length === 0) return '';

    const [base, ...rest] = parts;
    let result = base;

    for (const part of rest) {
        // Remove trailing '/' from current result
        if (result.endsWith('/')) {
            result = result.slice(0, -1);
        }

        // Remove leading '/' from current part
        const cleanPart = part.startsWith('/') ? part.slice(1) : part;

        // Join with '/'
        result += `/${cleanPart}`;
    }

    return result;
};

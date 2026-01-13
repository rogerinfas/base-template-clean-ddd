/**
 * Redondea a 2 decimales evitando -0.
 */
export const round2 = (n: number) => {
    const r = Number(n.toFixed(2));
    return Object.is(r, -0) ? 0 : r;
};

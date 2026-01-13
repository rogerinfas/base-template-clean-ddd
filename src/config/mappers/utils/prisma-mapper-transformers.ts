//IMPORTANTE, para persistir datos que son blank y se actualizan como strings vacios
export const toPrismaNull = (value: string | undefined | null): string | null => {
    // Si es vacío o undefined, devuelve null. Si no, devuelve el valor.
    // (Ojo: Ajusta si necesitas que undefined se mantenga undefined para no hacer update)
    return !value || value.trim() === '' ? null : value;
};

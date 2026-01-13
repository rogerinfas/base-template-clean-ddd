export function classifyByCrudState<T extends { id?: string; isActive?: boolean }>(items?: T[]) {
    const list = items ?? [];
    return {
        newItems: list.filter((i) => !i.id),
        updatedItems: list.filter((i) => !!i.id),
        eliminatedItems: list.filter((i) => i.isActive === false),
    } as const;
}

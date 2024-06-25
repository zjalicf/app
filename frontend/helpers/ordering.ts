export const calculateOrder = (before: number, after: number): number => {
    const variation = 0.2;
    const base = 0.5 - variation / 2;
    const rangeModifier = base + Math.random() * variation;
    return before + rangeModifier * (after - before);
};

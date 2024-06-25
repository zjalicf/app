import { murmurHash } from '~/helpers/murmur';

const COLORS: string[] = [
    '#4F92FF',
    '#C786DD',
    '#D99737',
    '#49A47C',
    '#926837',
];

type Color = {
    r: number;
    g: number;
    b: number;
};

export const hexToRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
        r: parseInt(result![1], 16),
        g: parseInt(result![2], 16),
        b: parseInt(result![3], 16),
    };
};

export const rgbaToSolid = (
    mainColor: Color,
    backgroundColor: Color,
    alpha: number,
) => {
    return {
        r: (1 - alpha) * backgroundColor.r + alpha * mainColor.r,
        g: (1 - alpha) * backgroundColor.g + alpha * mainColor.g,
        b: (1 - alpha) * backgroundColor.b + alpha * mainColor.b,
    };
};

export const calcDefaultVaultColor = (name: string) => {
    const hash = murmurHash(name);
    const color = COLORS[hash % COLORS.length];
    return color;
};

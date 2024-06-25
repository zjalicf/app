export const initialsBackgroundColor = (input: string) => {
    return linearColorPalette[
        computeLinearHash(input) % linearColorPalette.length
    ];
};

export const computeLinearHash = (input: string) => {
    let hash = 5381;
    let index = input.length;
    while (index) {
        hash = (hash * 33) ^ input.charCodeAt(--index);
    }
    return hash >>> 0;
};

const linearColorPalette = [
    '#dc4d86',
    '#de4e75',
    '#dd5163',
    '#d95753',
    '#d35e43',
    '#ca6534',
    '#c06d25',
    '#b47416',
    '#a67b06',
    '#978200',
    '#868700',
    '#748c07',
    '#619019',
    '#4a9429',
    '#2b963a',
    '#00984b',
    '#009a5d',
    '#009b6f',
    '#009c81',
    '#009c93',
    '#009ba5',
    '#009ab6',
    '#0099c5',
    '#0097d2',
    '#0094dd',
    '#0091e5',
    '#008cea',
    '#2087ec',
    '#5581eb',
    '#767ae6',
    '#8f72de',
    '#a56ad4',
    '#b662c7',
    '#c55bb9',
    '#d054a9',
    '#d84f98',
];

const allowedLabelSpecialChars = String.raw`\-_:\/\.`;
const latinCharset = String.raw`a-zA-Z0-9`;
const cyrillicCharset = String.raw`\u0430-\u044F`;
const greekCharset = String.raw`ά-ωΑ-ώ`;
const CJKCharset = String.raw`\u2E80-\u2FD5\u3190-\u319F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF65-\uFFDC\u2000-\u2EBE\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u31A0-\u31BF\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\uAC00-\uD7AF\uD840-\uD868\uDB40-\uDB7F\uDC00-\uDFFF`;
const frenchCharset = String.raw`\u00B5-\u00FF`;

export const combinedRegexpCharsets = [
    CJKCharset,
    greekCharset,
    cyrillicCharset,
    latinCharset,
    frenchCharset,
].join('');

export const labelRegexpBase = `[${[
    combinedRegexpCharsets,
    allowedLabelSpecialChars,
].join('')}]`;

export const negativeLabelRegexpBase = new RegExp(
    `[^(${combinedRegexpCharsets}${allowedLabelSpecialChars})]`,
    'g',
);

export const labelRegexp = new RegExp(`(?:>|\\s|^)(#${labelRegexpBase}+)`, 'g');
export const spacedLabelRegexp = new RegExp(
    `(?:\\s|^)(#${labelRegexpBase}+)`,
    'g',
);

export const imagesRegex = /image-component id=['"]([A-Za-z0-9-./:_]+)['"]/g;

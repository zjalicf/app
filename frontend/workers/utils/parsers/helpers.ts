export const normalizeDocumentLink = (
    vaultPath: string,
    filepath: string,
    sep: string = '\\',
) => {
    return filepath
        ?.replace(vaultPath, '')
        ?.replace('.md', '')
        ?.replaceAll(sep, '/');
};

export const join = (path1: string, path2: string, sep = '/') => {
    const parts = [...path1.split(sep), ...path2.split(sep)];
    const newParts: string[] = [];
    parts.forEach(part => {
        if (!part || part === '.') return;
        if (part === '..') {
            newParts.pop();
            return;
        }
        newParts.push(part);
    });

    const path = newParts.join(sep);
    if (path.startsWith(sep)) return path;
    return sep + path;
};

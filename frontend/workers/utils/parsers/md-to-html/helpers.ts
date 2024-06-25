export const parseAsWikiLink = (rawLink: string, config: any) => {
    const trimmedMatch = rawLink.trim();
    const ocMatch = trimmedMatch.match(/[#|]/);
    const splitIndex = ocMatch?.index ?? -1;
    let link =
        splitIndex > -1
            ? trimmedMatch.slice(0, splitIndex).trim()
            : trimmedMatch;
    const oc = splitIndex > -1 ? rawLink.slice(splitIndex).trim() : undefined;
    if (!link && oc) {
        link = oc.slice(1);
    }
    if (!link) return null;
    if (!link.endsWith('.md')) {
        link += '.md';
    }
    if (!link.startsWith('/')) {
        link = '/' + link;
    }

    return { link, oc };
};

export const getMostCommonPath = (
    link: string,
    docPath: string,
    paths: { filepath: string }[],
) => {
    const commonPaths = paths.filter(p => p.filepath.endsWith(link));
    const linkParts = link.split('/');
    const root = docPath
        .split('/')
        .slice(0, -1 * linkParts.length)
        .join('/');
    const path = [root, link].join('/');
    const exactMatch = paths.find(p => path === p.filepath);
    if (exactMatch) {
        return exactMatch;
    }
    return commonPaths.reduce((acc: null | { filepath: string }, p) => {
        if (!acc) return p;
        if (
            p.filepath.endsWith(link) &&
            acc.filepath.length > p.filepath.length
        ) {
            return p;
        }
        return acc;
    }, null);
};

export const extractWikilinks = (text: string): string[] => {
    const stack = [];
    const links = [];
    let currentLink = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '[' && text[i + 1] === '[') {
            stack.push('[[');
            currentLink += '[[';
            i++; // Skip the next bracket
            continue;
        }

        if (char === ']' && text[i + 1] === ']') {
            if (stack.length) {
                stack.pop();
                currentLink += ']]';
                if (stack.length === 0) {
                    links.push(currentLink);
                    currentLink = '';
                }
            }
            i++; // Skip the next bracket
            continue;
        }

        if (stack.length) {
            currentLink += char;
        }
    }

    return links;
};

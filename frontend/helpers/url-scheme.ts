const URL_SCHEME_REGEXP = /^((?:f|ht)tps?:)?\/\//;
const DEFAULT_SCHEME = 'https';

export const addScheme = (url: string, options: any = {}) => {
    const scheme = options.scheme ? options.scheme : DEFAULT_SCHEME;

    if (!URL_SCHEME_REGEXP.test(url)) {
        url = scheme ? scheme + '://' + url : '//' + url;
    }

    return url;
};

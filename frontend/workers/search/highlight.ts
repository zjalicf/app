// @ts-ignore
import { distance } from 'fastest-levenshtein';
import { format, parse } from 'date-fns';
import { IDocument } from '~/components/document/model';

export const getResultHighlights = (
    text: string,
    result: any,
    field: string,
) => {
    if (!result[field]) return [];
    const matches = Object.keys(result.match);
    const titleTerms = matches.filter((match: string) => {
        return result.match[match].includes(field);
    });

    if (!titleTerms.length) return [];
    const prefix = field === 'labels' ? '#' : '';

    const termsIndexes = getTermIndexes(text, result.query, titleTerms, prefix);

    const intervals = termsIndexes.map(termIndex => {
        return getHighlightIntervals(text, termIndex.term, termIndex.index);
    });

    return highlightText(text, intervals);
};

export const getResultContentHighlight = (result: any) => {
    if (!result.content) return '';
    const matches = Object.keys(result.match);
    const contentTerms = matches.filter((match: string) => {
        return result.match[match].includes('content');
    });

    if (!contentTerms.length) return [];
    const termsIndexes = getTermIndexes(
        result.content,
        result.query,
        contentTerms,
        '',
    );
    let previousIndex = 0;
    const contentFragment = termsIndexes.reduce((acc, val) => {
        const isPartialMatch = previousIndex > val.index - 35;
        const start = Math.max(previousIndex, val.index - 35);
        const end = val.index + 35;
        const fragment = result.content.slice(start, end);
        if (previousIndex === end) return acc;
        previousIndex = end;
        if (isPartialMatch) {
            return `${acc}${fragment}`;
        }
        return `${acc} ${fragment}`;
    }, '');

    const intervals = termsIndexes.map(termIndex => {
        return getHighlightIntervals(
            contentFragment,
            termIndex.term,
            termIndex.index,
            termIndex.originalTerm,
        );
    });

    return highlightText(contentFragment, intervals);
};

export const formatDailyDoc = (document: IDocument) => {
    if (!document.dailyDoc) return document.title;
    return format(
        parse(document.dailyDoc, 'yyyy-MM-dd', new Date()),
        'EEEE, LLL d, yyyy',
    );
};

const getTermIndexes = (
    text: string,
    query: string,
    terms: string[],
    prefix: string = '',
): any[] => {
    const lowercaseText = text.toLowerCase().trim();
    const queryPartsUsed = new Set();
    return terms
        .map(term => {
            const lowercaseTerm = term.toLowerCase().trim();
            const prefixedTerm = `${prefix}${lowercaseTerm}`;
            const similarPart = getMostSimilarPart(
                query,
                lowercaseTerm,
                prefix,
            );
            if (queryPartsUsed.has(similarPart.queryIndex)) {
                return null;
            }
            queryPartsUsed.add(similarPart.queryIndex);
            const index = lowercaseText.indexOf(prefixedTerm);
            return {
                originalTerm: prefixedTerm,
                term: similarPart.queryPart,
                index,
            };
        })
        .filter(v => !!v && v.term.length > 0)
        .sort((a, b) => a!.index - b!.index);
};

const getMostSimilarPart = (
    query: string,
    term: string,
    prefix: string = '',
) => {
    const splitQuery = query
        .trim()
        .split(' ')
        .filter(v => v.trim().length > 0);
    return splitQuery.reduce(
        (acc: any, queryPart: string, queryIndex: number) => {
            const lowercaseQueryPart = queryPart.toLowerCase();
            const indexTrimmed = distance(
                lowercaseQueryPart,
                term.slice(0, lowercaseQueryPart.length),
            );
            const index = distance(lowercaseQueryPart, `${prefix}${term}`);

            if (indexTrimmed === 0) {
                return {
                    index: 0,
                    term: `${prefix}${term}`,
                    queryPart: lowercaseQueryPart,
                    queryIndex,
                };
            }
            if (!acc) {
                return {
                    index,
                    term: `${prefix}${term}`,
                    queryPart: lowercaseQueryPart,
                    queryIndex,
                };
            }
            if (index < acc.index) {
                return {
                    index,
                    term: `${prefix}${term}`,
                    queryPart: lowercaseQueryPart,
                    queryIndex,
                };
            }
            return acc;
        },
        null,
    );
};

const getHighlightIntervals = (
    text: string,
    term: string,
    _index: number,
    originalTerm?: string,
) => {
    const lowercaseText = text.toLowerCase();
    const output = [];
    let lastIndex = Math.max(
        originalTerm
            ? lowercaseText.indexOf(originalTerm.toLowerCase())
            : _index,
        0,
    );
    const lastValidIndex = originalTerm
        ? lastIndex + originalTerm.length
        : text.length;
    let range = [-1, -1];
    const splitTerm = term.split('');
    for (const char of splitTerm) {
        const index = lowercaseText.indexOf(char, lastIndex);
        if (index === -1) {
            if (range[0] > -1 && range[1] === -1) {
                range[1] = range[0];
                output.push(range);
                range = [-1, -1];
                continue;
            }
            if (range[0] > -1) {
                output.push(range);
                range = [-1, -1];
                continue;
            }
            continue;
        }
        if (index > lastValidIndex) continue;

        lastIndex = index + 1;
        if (range[0] === -1) {
            range[0] = index;
            continue;
        }
        if (range[1] === index - 1) {
            range[1] = index;
            continue;
        }
        if (range[1] === -1) {
            range[1] = index;
            continue;
        }

        output.push(range);
        range = [index, -1];
    }
    if (range[0] > -1) {
        if (range[1] === -1) {
            range[1] = range[0];
        }
        output.push(range);
    }
    return output;
};

export const highlightText = (
    sourceString: string,
    intervalsArr: number[][][],
) => {
    const output = [];
    let previousIndex = 0;

    let highestInterval = 0;
    const sortedIntervals = intervalsArr
        .reduce((acc, val) => {
            return [...acc, ...val];
        }, [])
        .sort((a, b) => a[0] - b[0])
        .map(interval => {
            const start = Math.max(highestInterval, interval[0]);
            highestInterval = interval[1];
            return [start, interval[1]];
        });

    for (const interval of sortedIntervals) {
        output.push({
            highlight: false,
            text: sourceString.substring(previousIndex, interval[0]),
        });

        output.push({
            highlight: true,
            text: sourceString.substring(interval[0], interval[1] + 1),
        });
        previousIndex = interval[1] + 1;
    }

    output.push({
        highlight: false,
        text: sourceString.substring(previousIndex, sourceString.length),
    });

    return output;
};

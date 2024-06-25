import { defaultsDeep } from 'lodash';
import { Config, MarkObj } from './types';

const defaultMarks = {
    italic: '*',
    bold: '**',
    strike: '~~',
    highlight: '==',
    code: '`',
} as Record<string, string>;

export const createMarksParser = () => {
    return (
        markArray: MarkObj[] | undefined,
        config: Config,
    ): { open: string; close: string } => {
        const marksDefinition = defaultsDeep(config.marks ?? {}, defaultMarks);

        const openMDMarks = [];
        const closeMDMarks = [];
        if (!markArray) return { open: '', close: '' };
        for (const mark of markArray) {
            if (marksDefinition[mark.type]) {
                openMDMarks.push(marksDefinition[mark.type]);
                closeMDMarks.unshift(marksDefinition[mark.type]);
            } else {
                const { open, close } = processMarkWithAttrs(mark, config);
                openMDMarks.push(open);
                closeMDMarks.unshift(close);
            }
        }

        return { open: openMDMarks.join(''), close: closeMDMarks.join('') };
    };
};

const processMarkWithAttrs = (
    mark: MarkObj,
    config: Config,
): { open: string; close: string } => {
    switch (mark.type) {
        case 'kbd':
            return {
                open: '<kbd>',
                close: '</kbd>',
            };
        case 'link':
            return { open: '[', close: `](${mark.attrs?.href || ''})` };
        case 'image':
            return {
                open: '![',
                close: `](${mark.attrs?.src || mark.attrs?.href || ''})`,
            };
    }
    return { open: '', close: '' };
};

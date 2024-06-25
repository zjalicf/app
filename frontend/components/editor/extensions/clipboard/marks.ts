import { Mark } from '@tiptap/pm/model';

export const applyMarks = (marks: readonly Mark[], text: string) => {
    if (marks.length === 0) {
        return text;
    }
    const marksWithoutLink = marks.filter(mark => mark.type.name !== 'link');
    const orderedMarks = [
        ...marksWithoutLink,
        ...marks.filter(mark => mark.type.name === 'link'),
    ];

    return orderedMarks.reduce((acc, mark) => {
        const markType = mark.type.name;
        if (markType === 'link') {
            return `[${acc}](${mark.attrs.href})`;
        }
        if (markType === 'bold') {
            return `**${acc}**`;
        }
        if (markType === 'italic') {
            return `*${acc}*`;
        }
        if (markType === 'code') {
            return `\`${acc}\``;
        }
        if (markType === 'strike') {
            return `~~${acc}~~`;
        }
        if (markType === 'highlight') {
            return `==${acc}==`;
        }
        return acc;
    }, text);
};

import { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

export const wrappingCharacters = ["'", '"', '`', '(', '[', '{', '<', '/'];
export const wrappingCharacterPairings = {
    "'": "'",
    '"': '"',
    '`': '`',
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
    '/': '/',
} as Record<string, string>;
export const wrapSelection = (
    editor: Editor,
    character: string,
    from: number,
    to: number,
) => {
    editor.commands.command(({ tr }) => {
        tr.insertText(wrappingCharacterPairings[character] ?? character, to);
        tr.insertText(character, from);
        tr.setSelection(TextSelection.create(tr.doc, from + 1, to + 1));
        return true;
    });
};

export const indentRight = (text: string, indent: string) => {
    const splitText = text.split('\n').map(line => indent + line);

    return splitText.join('\n');
};

export const indentLeft = (text: string, indent: string) => {
    let moveFrom = false;
    const splitText = text.split('\n').map((line, index) => {
        const match = line.match(/^(\s+)/);
        if (!match) return line;
        if (index === 0) {
            moveFrom = true;
        }
        return line.slice(Math.min(match[1].length, indent.length));
    });
    return { text: splitText.join('\n'), moveFrom };
};

export const getIndentationIndexes = (text: string) => {
    const indentationIndexes = [0];
    do {
        const index = text.indexOf(
            '\n',
            indentationIndexes[indentationIndexes.length - 1],
        );
        if (index === -1) break;
        indentationIndexes.push(index + 1);
    } while (true);
    return indentationIndexes;
};

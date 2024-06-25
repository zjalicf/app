import {
    PasteRule,
    PasteRuleFinder,
    callOrReturn,
    ExtendedRegExpMatchArray,
    Range,
    ChainedCommands,
} from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';

export function blockNodePasteRule(config: {
    find: PasteRuleFinder;
    execute: (
        match: ExtendedRegExpMatchArray,
        range: Range & { blockFrom: number; blockTo: number },
        attrs: Record<string, any>,
        chain: () => ChainedCommands,
        state: EditorState,
    ) => void;
    getAttributes?:
        | Record<string, any>
        | ((
              match: ExtendedRegExpMatchArray,
              event: ClipboardEvent,
          ) => Record<string, any>)
        | false
        | null;
}) {
    return new PasteRule({
        find: config.find,
        handler({ match, chain, range, pasteEvent, state }) {
            const attributes = callOrReturn(
                config.getAttributes,
                undefined,
                match,
                pasteEvent,
            );

            if (attributes === false || attributes === null) {
                return null;
            }

            if (match.input) {
                config.execute(match, range as any, attributes!, chain, state);
            }
        },
    });
}

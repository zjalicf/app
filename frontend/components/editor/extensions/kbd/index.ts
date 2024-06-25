import { Command, Mark, markInputRule, markPasteRule } from '@tiptap/core';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';

export const kbdInputRegex = /(?:^|\s)(<kbd>(.+?)<\/kbd>)$/;
export const kbdPasteRegex = /(?:^|\s?)(<kbd>(.+?)<\/kbd>)/g;

declare module '@tiptap/core' {
    interface Commands {
        kbd: {
            setKbd: () => Command;
            toggleKbd: () => Command;
            unsetKbd: () => Command;
        };
    }
}

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance: (ctx: EditorContext) => {
        return Mark.create({
            name: 'kbd',
            excludes: '_',
            inclusive: false,
            parseHTML() {
                return [
                    {
                        tag: 'kbd',
                    },
                ];
            },

            renderHTML() {
                return ['kbd'];
            },

            addCommands() {
                return {
                    setKbd:
                        () =>
                        ({ commands }) => {
                            return commands.setMark('kbd');
                        },
                    toggleKbd:
                        () =>
                        ({ commands }) => {
                            return commands.toggleMark('kbd');
                        },
                    unsetKbd:
                        () =>
                        ({ commands }) => {
                            return commands.unsetMark('kbd');
                        },
                };
            },

            addKeyboardShortcuts() {
                return {
                    'Mod-^': () => this.editor.commands.toggleKbd() as any,
                };
            },

            addInputRules() {
                return [
                    markInputRule({
                        find: kbdInputRegex,
                        type: this.type,
                    }),
                ];
            },

            addPasteRules() {
                return [
                    markPasteRule({
                        find: kbdPasteRegex,
                        type: this.type,
                    }),
                ];
            },
        });
    },
});

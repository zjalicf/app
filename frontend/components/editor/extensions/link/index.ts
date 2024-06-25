import Link from '@tiptap/extension-link';
import { markInputRule, markPasteRule } from '@tiptap/vue-2';
import { find } from 'linkifyjs';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';
import { pasteHandler } from '~/components/editor/extensions/link-paste-handler';
import { EditorContext } from '~/@types/app';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx: EditorContext) {
        const linkExtension = Link.extend({
            priority: 50,
            addInputRules() {
                return [
                    ...(this.parent?.() ?? []),
                    markInputRule({
                        // regexp that matches markdown link syntax
                        find: (text: string) => {
                            const mdLinkRegexp = /\[(.+?)\]\((.+?)\)/g;
                            const match = mdLinkRegexp.exec(text);
                            if (!match) return null;

                            const link = find(match[2])
                                .filter(link => link.isLink)
                                .map(link => ({
                                    text: match[0],
                                    index: link.start,
                                    data: { ...link, text: match[1] },
                                    match,
                                    replaceWith: match[1],
                                }));
                            return link[0];
                        },
                        type: this.type,
                        // getAttributes is a function that returns the attributes for the mark
                        getAttributes: (match: any) => {
                            return {
                                href: match.data.href,
                                target: '_blank',
                                text: match.data.text,
                            };
                        },
                    }),
                ];
            },

            addPasteRules() {
                return [
                    ...(this.parent?.() ?? []),
                    markPasteRule({
                        find: (text: string) => {
                            const mdLinkRegexp = /\[(.+?)\]\((.+?)\)/g;
                            const match = mdLinkRegexp.exec(text);
                            if (!match) return null;

                            const links = find(match[2])
                                .filter(link => link.isLink)
                                .map(link => ({
                                    text,
                                    index: link.start,
                                    data: { ...link, text: match[1] },
                                    match,
                                    replaceWith: match[1],
                                }));

                            return links;
                        },
                        type: this.type,
                        // getAttributes is a function that returns the attributes for the mark
                        getAttributes: (match: any) => {
                            return {
                                href: match.data.href,
                                target: '_blank',
                                text: match.data.text,
                            };
                        },
                    }),
                ];
            },

            // TODO: pasting github links
            addProseMirrorPlugins() {
                return [
                    ...(this.parent?.() ?? []),
                    pasteHandler(ctx, {
                        editor: this.editor,
                        type: this.type,
                        linkOnPaste: this.options.linkOnPaste,
                    }),
                ];
            },
        });

        return linkExtension.configure({
            HTMLAttributes: {
                spellcheck: 'false',
            },
        });
    },
});

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { labelRegexp } from '~/constants/regexp';

export default Extension.create({
    name: 'label-decoration',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('label-decoration'),
                props: {
                    decorations: ({ doc }) => {
                        const decorations: Decoration[] = [];
                        const content = doc.content;

                        content.nodesBetween(0, content.size, (node, pos) => {
                            if (node.isText) {
                                const text = node.text || '';
                                let match;
                                while ((match = labelRegexp.exec(text))) {
                                    const from = pos + match.index;
                                    const to = from + match[0].length;
                                    const decoration = Decoration.inline(
                                        from,
                                        to,
                                        {
                                            class: 'label', // You can specify a CSS class for styling
                                        },
                                    );
                                    decorations.push(decoration);
                                }
                            }
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});

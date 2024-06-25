import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes, TabType, ViewType } from '~/constants';
import { labelRegexp } from '~/constants/regexp';
import { EditorContext } from '~/@types/app';

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        const regexPattern = labelRegexp;
        const DATA_ATTR_NAME = 'data-label';

        const isNotLabelNode = (nodeName: string) => {
            const notLabelNodeNames = ['codeBlock'];

            return notLabelNodeNames.includes(nodeName);
        };

        return Extension.create({
            name: 'label-decoration',
            addProseMirrorPlugins() {
                return [
                    new Plugin({
                        key: new PluginKey('label-decoration'),
                        props: {
                            handleClick: (_view, _pos, event) => {
                                const modClick = event.ctrlKey || event.metaKey;
                                if (!modClick) return false;
                                const target = event.target as HTMLElement;

                                if (
                                    !target ||
                                    !target.getAttribute(DATA_ATTR_NAME)
                                )
                                    return false;

                                const label =
                                    target.getAttribute(DATA_ATTR_NAME);
                                const allPagesView =
                                    ctx.nuxt.$entities.view.getViewByType(
                                        ViewType.ALL_PAGES,
                                    );
                                const tab = ctx.nuxt.$tabs.createNewTabObject(
                                    allPagesView.id,
                                    TabType.VIEW,
                                    {
                                        filterDefinition: [
                                            {
                                                property: 'labels',
                                                operation: 'overlap',
                                                value: [label],
                                            },
                                        ],
                                    },
                                );
                                if (event.altKey) {
                                    ctx.nuxt.$tabs.openTabWithEvent(tab, event);
                                } else {
                                    ctx.nuxt.$tabs.openTab(tab);
                                }
                                return true;
                            },
                            decorations: ({ doc }) => {
                                const decorations: Decoration[] = [];
                                const content = doc.content;

                                content.nodesBetween(
                                    0,
                                    content.size,
                                    (node, pos) => {
                                        if (isNotLabelNode(node.type.name)) {
                                            return false;
                                        }
                                        if (node.isText) {
                                            const codeMarkup = node.marks.find(
                                                mark =>
                                                    mark.type.name === 'code',
                                            );
                                            if (codeMarkup) return false;
                                            const text = node.text || '';
                                            let match;
                                            while (
                                                (match =
                                                    regexPattern.exec(text))
                                            ) {
                                                let offset = 0;
                                                if (match[0].startsWith(' ')) {
                                                    offset = 1;
                                                }

                                                const from =
                                                    pos + match.index + offset;
                                                const to =
                                                    from + match[1].length;
                                                const decoration =
                                                    Decoration.inline(
                                                        from,
                                                        to,
                                                        {
                                                            class: 'label',
                                                            spellcheck: 'false',
                                                            [DATA_ATTR_NAME]:
                                                                match[1],
                                                        },
                                                    );
                                                decorations.push(decoration);
                                            }
                                        }
                                    },
                                );

                                return DecorationSet.create(doc, decorations);
                            },
                        },
                    }),
                ];
            },
        });
    },
});

import { Node } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { VueRenderer } from '@tiptap/vue-2';
import { createPopper, Instance } from '@popperjs/core';
import LabelSuggestions from './LabelSuggestions.vue';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';
import { ILabel } from '~/@types';

export type MentionOptions = {
    suggestion: Omit<SuggestionOptions, 'editor'>;
};

const labelPluginKey = new PluginKey('label');

const createPopup = (
    parent: Element,
    component: HTMLElement,
    width: number,
) => {
    return createPopper(parent, component, {
        placement: 'bottom-start',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [width, 0],
                },
            },
        ],
    });
};

const ignoreKeys = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Shift',
    'Meta',
    'Alt',
    'Control',
    'Enter',
    'Escape',
];

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        const isMobile = ctx.nuxt.$utils.isMobile;
        return Node.create<MentionOptions>({
            name: 'label',
            addOptions() {
                return {
                    suggestion: {
                        char: '#',
                        pluginKey: labelPluginKey,
                        items: ({ query }: { query: string }) => {
                            return (ctx.store.getters['label/list'] as ILabel[])
                                .filter(item =>
                                    item
                                        .toLowerCase()
                                        .startsWith(`#${query.toLowerCase()}`),
                                )
                                .slice(0, isMobile ? 3 : 10);
                        },

                        render: () => {
                            let component: VueRenderer;
                            let popup: Instance | null = null;
                            let decorationId: string | null = null;
                            let shouldShow: boolean = true;

                            return {
                                onStart: props => {
                                    component = new VueRenderer(
                                        LabelSuggestions,
                                        {
                                            propsData: props,
                                        },
                                    );

                                    const parent =
                                        document.getElementById(
                                            'popper-container',
                                        );

                                    if (!parent || !props.decorationNode)
                                        return;

                                    parent.appendChild(component.element);

                                    const text = props.text;
                                    const isLabel =
                                        props.decorationNode.classList.contains(
                                            'label',
                                        );

                                    decorationId =
                                        props.decorationNode.getAttribute(
                                            'data-decoration-id',
                                        );

                                    if (
                                        (text === '#' && isLabel) ||
                                        text.length > 1
                                    ) {
                                        shouldShow = false;
                                        (
                                            component.ref as LabelSuggestions
                                        )?.onHide();
                                        return;
                                    }

                                    const width =
                                        props.decorationNode.getBoundingClientRect()
                                            .width;

                                    (
                                        component.ref as LabelSuggestions
                                    )?.onShow();

                                    popup = createPopup(
                                        props.decorationNode,
                                        component.element as HTMLElement,
                                        width,
                                    );
                                },

                                onUpdate(props) {
                                    component.updateProps(props);

                                    if (!shouldShow) return;

                                    popup?.destroy();

                                    if (!props.decorationNode) {
                                        return;
                                    }

                                    const el = document.querySelector(
                                        `[data-decoration-id="${decorationId}"]`,
                                    ) as HTMLElement;

                                    const width =
                                        props.decorationNode.getBoundingClientRect()
                                            .width;

                                    popup = createPopup(
                                        el,
                                        component.element as HTMLElement,
                                        width,
                                    );
                                },

                                onKeyDown(props) {
                                    const key = props.event.key;

                                    if (!ignoreKeys.includes(key)) {
                                        shouldShow = true;
                                    }

                                    if (!shouldShow) return false;

                                    if (props.event.key === 'Escape') {
                                        popup?.destroy();
                                        (
                                            component.ref as LabelSuggestions
                                        )?.onHide();
                                        shouldShow = false;

                                        return true;
                                    }

                                    (
                                        component?.ref as LabelSuggestions
                                    )?.onShow();
                                    return (
                                        component.ref as LabelSuggestions
                                    )?.onKeyDown(props);
                                },

                                onExit() {
                                    popup?.destroy();

                                    const parent =
                                        document.getElementById(
                                            'popper-container',
                                        );

                                    if (
                                        component?.element &&
                                        parent?.contains(component.element)
                                    ) {
                                        parent.removeChild(component.element);
                                    }

                                    component?.destroy();
                                },
                            };
                        },
                        command: ({ editor, range, props }) => {
                            // increase range.to by one when the next node is of type "text"
                            // and starts with a space character
                            const nodeAfter =
                                editor.view.state.selection.$to.nodeAfter;
                            const overrideSpace =
                                nodeAfter?.text?.startsWith(' ');

                            if (overrideSpace) {
                                range.to += 1;
                            }

                            editor
                                .chain()
                                .focus()
                                .insertContentAt(range, [
                                    {
                                        type: 'text',
                                        text: `${props} `,
                                    },
                                ])
                                .run();

                            window.getSelection()?.collapseToEnd();
                        },
                        allow: ({ state, range }) => {
                            const $from = state.doc.resolve(range.from);
                            const type = state.schema.nodes[this.name];
                            const hasCodeMark = $from
                                .marks()
                                .some(mark => mark.type.name === 'code');
                            if (hasCodeMark) {
                                return false;
                            }
                            return !!$from.parent.type.contentMatch.matchType(
                                type,
                            );
                        },
                    },
                };
            },

            group: 'inline',

            inline: true,

            selectable: true,

            atom: true,

            addProseMirrorPlugins() {
                return [
                    Suggestion({
                        editor: this.editor,
                        ...this.options.suggestion,
                    }),
                ];
            },
        });
    },
});

import { Command, mergeAttributes, Node } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { VueRenderer } from '@tiptap/vue-2';
import { PluginKey } from '@tiptap/pm/state';
import AutocompleteComponent from './AutocompleteComponent.vue';
import options from './options';
import { ImagesService } from '~/plugins/storage-service/cloud/images';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';
import { LocalImageService } from '~/components/editor/extensions/image/local-image-service';
import { INLINE_TASK_CONTENT_NAME } from '~/components/editor/extensions/task-item';

export type AutocompleteOptions = {
    Images: ImagesService | LocalImageService | null;
    HTMLAttributes: {
        [key: string]: any;
    };
    suggestion: Omit<SuggestionOptions, 'editor'>;
    documentId: string;
};

declare module '@tiptap/core' {
    interface Commands {
        autocomplete: {
            setAutocompleteDocumentId: (id: string | null) => Command;
        };
    }
}

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx: EditorContext) {
        const isLocalVault = ctx.store.getters['vault/isActiveLocal'];
        const imageService = isLocalVault
            ? new LocalImageService(ctx.serviceRegistry)
            : ctx.cloudService.Images;

        const isMobile = process.env.platform === 'mobile';

        const editingTemplate = (id: string) =>
            ctx.store.getters['document/byId'](id)?.template;

        const shouldShowJira =
            !isLocalVault && ctx.nuxt.$accessControl.hasProAccess;

        const shouldShowGithub =
            !isLocalVault && ctx.nuxt.$accessControl.hasProAccess;

        return Node.create<AutocompleteOptions>({
            name: 'autocomplete',
            addOptions() {
                return {
                    ...this.parent?.(),
                    Images: imageService,
                    documentId: ctx.config.autocomplete?.documentId || '',
                    HTMLAttributes: {},
                    suggestion: {
                        allowSpaces: false,
                        char: '/',
                        items: ({ query }) => {
                            return options
                                .map(({ name }) => name)
                                .filter(name => {
                                    if (
                                        name === 'Jira Issue' &&
                                        !shouldShowJira
                                    ) {
                                        return false;
                                    }
                                    if (
                                        name === 'Github Link' &&
                                        !shouldShowGithub
                                    ) {
                                        return false;
                                    }
                                    if (
                                        isMobile &&
                                        [
                                            'Image',
                                            'Template',
                                            'Mermaid',
                                            'Code',
                                            'Jira Issue',
                                            'Github Link',
                                        ].includes(name)
                                    ) {
                                        return false;
                                    }
                                    return true;
                                })
                                .filter((item: any) =>
                                    item
                                        .toLowerCase()
                                        .startsWith(query.toLowerCase()),
                                );
                        },
                        render: () => {
                            let component: any;
                            let popup: any;
                            if (ctx.editor()) {
                                ctx.editor()!.storage.autocomplete.value = {
                                    isActive: false,
                                };
                            }
                            const destroyAutcomplete = () => {
                                if (ctx.editor()) {
                                    ctx.editor()!.storage.autocomplete.value = {
                                        isActive: false,
                                    };
                                }
                                if (
                                    popup &&
                                    popup.length > 0 &&
                                    !popup[0]?.state?.isDestroyed
                                ) {
                                    popup[0].hide();
                                    if (component) {
                                        component.destroy();
                                    }
                                    if (popup && Array.isArray(popup)) {
                                        popup.forEach(p => {
                                            if (!p.state.isDestroyed) {
                                                p.destroy();
                                            }
                                        });
                                    }
                                }
                            };

                            return {
                                onStart: async props => {
                                    if (ctx.editor()) {
                                        ctx.editor()!.storage.autocomplete.value =
                                            {
                                                isActive: true,
                                            };
                                    }
                                    component = new VueRenderer(
                                        AutocompleteComponent,
                                        {
                                            propsData: props,
                                        },
                                    );

                                    const { default: tippy } = await import(
                                        'tippy.js'
                                    );

                                    popup = tippy('body', {
                                        getReferenceClientRect:
                                            props.clientRect,
                                        appendTo: () => document.body,
                                        content: component.element,
                                        showOnCreate: true,
                                        interactive: true,
                                        trigger: 'manual',
                                        placement: 'bottom-start',
                                        animation: false,
                                        onHide: () => {
                                            if (props.editor) {
                                                const state = {
                                                    active: false,
                                                    key: null,
                                                    range: {},
                                                    query: null,
                                                    text: null,
                                                    composing: false,
                                                };
                                                props.editor.view.dispatch(
                                                    props.editor.view.state.tr.setMeta(
                                                        'autocomplete',
                                                        state,
                                                    ),
                                                );
                                            }
                                        },
                                    });
                                },
                                onUpdate(props) {
                                    if (component) {
                                        component.updateProps(props);
                                    }

                                    if (
                                        popup.length > 0 &&
                                        !popup[0].state.isDestroyed
                                    ) {
                                        popup[0].setProps({
                                            getReferenceClientRect:
                                                props.clientRect,
                                        });
                                    }
                                },
                                onKeyDown(props) {
                                    if (props.event.key === 'Escape') {
                                        props.event.stopImmediatePropagation();
                                        destroyAutcomplete();
                                        return true;
                                    }
                                    if (
                                        component.ref &&
                                        !popup[0].state.isDestroyed
                                    ) {
                                        return component.ref.onKeyDown(props);
                                    }
                                },
                                onExit() {
                                    if (component) {
                                        component.destroy();
                                    }
                                    if (ctx.editor()) {
                                        ctx.editor()!.storage.autocomplete.value =
                                            {
                                                isActive: false,
                                            };
                                    }
                                    if (popup && Array.isArray(popup)) {
                                        popup.forEach(p => {
                                            if (!p.state.isDestroyed) {
                                                p.destroy();
                                            }
                                        });
                                    }
                                },
                            };
                        },
                    },
                };
            },

            group: 'inline',

            inline: true,

            selectable: false,

            atom: true,

            addAttributes() {
                return {
                    id: {
                        default: null,
                        parseHTML: element => {
                            return {
                                id: element.getAttribute('data-autocomplete'),
                            };
                        },
                        renderHTML: attributes => {
                            if (!attributes.id) {
                                return {};
                            }

                            return {
                                'data-autocomplete': attributes.id,
                            };
                        },
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'span[data-autocomplete]',
                    },
                ];
            },

            renderHTML({ node, HTMLAttributes }) {
                return [
                    'span',
                    mergeAttributes(
                        this.options.HTMLAttributes,
                        HTMLAttributes,
                    ),
                    `/${node.attrs.id}`,
                ];
            },

            addCommands() {
                return {
                    setAutocompleteDocumentId: (id: string | null) => () => {
                        this.options.documentId = id ?? '';
                        return true;
                    },
                };
            },

            renderText({ node }) {
                return `/${node.attrs.id}`;
            },

            addProseMirrorPlugins() {
                return [
                    Suggestion({
                        pluginKey: new PluginKey('autocomplete'),
                        editor: this.editor,
                        ...this.options.suggestion,
                        items: ({ query }) => {
                            return options
                                .map(({ name }) => name)
                                .filter(name => {
                                    if (
                                        name === 'Jira Issue' &&
                                        !shouldShowJira
                                    ) {
                                        return false;
                                    }
                                    if (
                                        name === 'Github Link' &&
                                        !shouldShowGithub
                                    ) {
                                        return false;
                                    }
                                    return (
                                        !isMobile ||
                                        (isMobile &&
                                            ![
                                                'Image',
                                                'Template',
                                                'Mermaid',
                                                'Code',
                                                'Jira Issue',
                                                'Github Link',
                                            ].includes(name))
                                    );
                                })
                                .filter(name => {
                                    return !(
                                        editingTemplate(
                                            this.options.documentId,
                                        ) && name === 'Template'
                                    );
                                })
                                .filter((item: any) =>
                                    item
                                        .toLowerCase()
                                        .startsWith(query.toLowerCase()),
                                );
                        },
                        command: cmd => {
                            const validOption = options.find(
                                (option: any) => option.name === cmd.props.id,
                            );
                            validOption?.handler(cmd, this.options as any, ctx); // TODO: not all commands need options only image
                        },
                        allow: ({ editor, range }) => {
                            let selectionBefore = '';

                            try {
                                const cutBefore = editor.view.state.doc.cut(
                                    range.from - 1,
                                    range.to - 1,
                                );
                                if (cutBefore && cutBefore.textContent) {
                                    selectionBefore = cutBefore.textContent;
                                }
                            } catch (e) {}

                            return (
                                !isMobile &&
                                (['', ' '].includes(selectionBefore) ||
                                    selectionBefore.trim().startsWith('/')) &&
                                !editor.isActive('codeBlock') &&
                                !editor.isActive('code') &&
                                !editor.isActive(INLINE_TASK_CONTENT_NAME) &&
                                editor.can().insertContentAt(range, {
                                    type: 'autocomplete',
                                }) &&
                                ![13, 27, 35, 37, 38, 39, 40, 46].includes(
                                    // @ts-ignore
                                    editor.view.input.lastKeyCode,
                                ) &&
                                // @ts-ignore
                                editor.view.input.lastSelectionOrigin !==
                                    'pointer'
                            );
                        },
                    }),
                ];
            },
        });
    },
});

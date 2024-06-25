import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(_ctx) {
        return [
            Extension.create({
                priority: 1,
                name: 'clickUtils',
                addProseMirrorPlugins() {
                    return [
                        new Plugin({
                            key: new PluginKey<any>('clickUtils'),
                            props: {
                                handleDOMEvents: {
                                    click: (_view, event) => {
                                        window.$nuxt.$emit(
                                            'editor:focus-mobile',
                                            event,
                                        );
                                        window.$nuxt.$emit(
                                            'editor:scroll-mobile',
                                            event,
                                        );
                                        return false;
                                    },
                                },
                            },
                        }),
                    ];
                },
            }),
        ];
    },
});

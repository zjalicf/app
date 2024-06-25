import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state';
import { EditorTypes } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';

const keyDownHandler = (view: any, event: KeyboardEvent, emit: Function) => {
    if (event.key !== 'ArrowUp') return false;
    const { selection } = view.state;
    const selectionAtStart = Selection.atStart(view.state.doc);
    if (
        !(
            !selectionAtStart ||
            selectionAtStart.anchor !== selection.anchor ||
            selectionAtStart.anchor !== selection.head
        )
    ) {
        event.preventDefault();
        event.stopPropagation();
        emit('keyUp');
        return true;
    }
    return false;
};

registerEditorExtension({
    type: EditorTypes.BASIC,
    createInstance(ctx) {
        return Extension.create({
            priority: 999999999,
            name: 'keyUpHandler',
            addProseMirrorPlugins() {
                return [
                    new Plugin({
                        key: new PluginKey('key-handler'),
                        props: {
                            handleKeyDown(view, event) {
                                keyDownHandler(view, event, ctx.emit);
                            },
                        },
                    }),
                ];
            },
        });
    },
});

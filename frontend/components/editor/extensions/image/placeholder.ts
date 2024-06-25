import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const ImagePlaceholderPlugin = new Plugin({
    state: {
        init() {
            return DecorationSet.empty;
        },
        apply(tr, set) {
            set = set.map(tr.mapping, tr.doc);
            const action = tr.getMeta(ImagePlaceholderPlugin);

            if (action && action.add) {
                const widget = document.createElement('div');
                widget.classList.add('skeleton-loader');
                const deco = Decoration.widget(action.add.pos, widget, {
                    id: action.add.id,
                });
                set = set.add(tr.doc, [deco]);
            } else if (action && action.remove) {
                set = set.remove(
                    set.find(
                        null,
                        null,
                        (spec: any) => spec.id === action.remove.id,
                    ),
                );
            }
            return set;
        },
    },
    props: {
        decorations(state) {
            return this.getState(state);
        },
    },
});

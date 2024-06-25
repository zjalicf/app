import { Youtube } from '@tiptap/extension-youtube';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';
import { EditorContext } from '~/@types/app';
import YoutubeComponent from '~/components/editor/extensions/youtube/YoutubeComponent.vue';

export const YOUTUBE_REGEX =
    /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)\/(?!channel\/)(?!@)(.+)?$/;
export const YOUTUBE_REGEX_GLOBAL =
    /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)\/(?!channel\/)(?!@)(.+)?$/g;

export const isYoutubeLink = (url: string) => {
    return url.match(YOUTUBE_REGEX);
};

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        ctx.bubbleMenuExceptions.add(Youtube.name);
        return Youtube.extend({
            addKeyboardShortcuts() {
                return {
                    ...(this.parent?.() ?? {}),
                    Space: () =>
                        ctx.utils!.executeOnFocusedNodeOfType(
                            this.type.name,
                            node => {
                                this.editor.view.dispatch(
                                    this.editor.state.tr.setNodeMarkup(
                                        this.editor.state.selection.$from.pos,
                                        undefined,
                                        {
                                            ...node.attrs,
                                            open: !node.attrs.open,
                                        },
                                    ),
                                );
                            },
                        ),
                };
            },
            addAttributes() {
                return {
                    ...(this.parent?.() ?? {}),
                    src: {
                        default: '',
                    },
                    open: {
                        default: true,
                    },
                };
            },
            addNodeView() {
                return VueNodeViewRenderer(YoutubeComponent);
            },
        }).configure({
            inline: false,
        });
    },
});

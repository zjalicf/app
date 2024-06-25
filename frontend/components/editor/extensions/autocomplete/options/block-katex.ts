import { Range, Editor as TipTapEditor } from '@tiptap/core';
import { BLOCK_KATEX_NODE_NAME } from '~/components/editor/extensions/katex';
import { EditorContext } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';

const insertBlockKatex = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: any,
    ctx: EditorContext,
) => {
    const focusIndex = cmd.range.from === 1 ? 0 : cmd.range.from - 1;
    const node = cmd.editor.state.schema.nodes[BLOCK_KATEX_NODE_NAME].create({
        expression: '',
        new: true,
    });

    cmd.editor
        .chain()
        .deleteRange(cmd.range)
        .insertContentAt(focusIndex, node.toJSON())
        .run();

    const { content } = cmd.editor.view.state.selection.content();
    const name = content.firstChild?.type.name;
    if (name === 'paragraph' && content.firstChild?.text === '') {
        cmd.editor.commands.deleteSelection();
    }
    const activeTab = ctx.nuxt.$tabs.activeTab();
    if (!activeTab) return;
    ctx.nuxt.$tracking.trackEventV2(TrackingType.EDITOR, {
        action: TrackingAction.INSERT_EQUATION,
        source: TrackingActionSource.AUTOCOMPLETE,
        sourceMeta:
            activeTab.type === TabType.MY_DAY
                ? TrackingActionSourceMeta.MY_DAY
                : TrackingActionSourceMeta.PAGE,
    });
};

export default {
    name: 'Equation',
    handler: insertBlockKatex,
};

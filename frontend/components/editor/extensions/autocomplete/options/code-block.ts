import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { EditorContext } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';

const insertCodeBlock = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: any,
    ctx: EditorContext,
) => {
    // @ts-ignore
    cmd.editor.chain().deleteRange(cmd.range).focus().toggleCodeBlock().run();
    const activeTab = ctx.nuxt.$tabs.activeTab();
    if (!activeTab) return;
    ctx.nuxt.$tracking.trackEventV2(TrackingType.EDITOR, {
        action: TrackingAction.INSERT_CODE_BLOCK,
        source: TrackingActionSource.AUTOCOMPLETE,
        sourceMeta:
            activeTab.type === TabType.MY_DAY
                ? TrackingActionSourceMeta.MY_DAY
                : TrackingActionSourceMeta.PAGE,
    });
};

export default {
    name: 'Code Block',
    handler: insertCodeBlock,
};

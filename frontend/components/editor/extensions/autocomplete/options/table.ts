import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { EditorContext } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';

const insertTable = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: any,
    ctx: EditorContext,
) => {
    cmd.editor
        .chain()
        .deleteRange(cmd.range)
        .focus()
        // @ts-ignore
        .insertTable({
            rows: 2,
            cols: 2,
            withHeaderRow: true,
        })
        .run();

    ctx.nuxt.$tracking.trackEvent('editor', {
        action: 'insert table',
    });
    const activeTab = ctx.nuxt.$tabs.activeTab();
    if (!activeTab) return;
    ctx.nuxt.$tracking.trackEventV2(TrackingType.EDITOR, {
        action: TrackingAction.INSERT_TABLE,
        source: TrackingActionSource.AUTOCOMPLETE,
        sourceMeta:
            activeTab.type === TabType.MY_DAY
                ? TrackingActionSourceMeta.MY_DAY
                : TrackingActionSourceMeta.PAGE,
    });
};

export default {
    name: 'Table',
    handler: insertTable,
};

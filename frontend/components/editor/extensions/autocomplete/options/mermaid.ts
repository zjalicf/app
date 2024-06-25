import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { EditorContext } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';

const insertMermaid = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _: any,
    ctx: EditorContext,
) => {
    cmd.editor
        .chain()
        .deleteRange(cmd.range)
        .focus()
        .insertContent({
            type: 'mermaid-component',
            attrs: {
                new: true,
            },
        })
        .selectNodeBackward()
        .run();

    ctx.nuxt.$tracking.trackEvent('editor', {
        action: 'insert mermaid',
    });
    const activeTab = ctx.nuxt.$tabs.activeTab();
    if (!activeTab) return;
    ctx.nuxt.$tracking.trackEventV2(TrackingType.EDITOR, {
        action: TrackingAction.INSERT_MERMAID,
        source: TrackingActionSource.AUTOCOMPLETE,
        sourceMeta:
            activeTab.type === TabType.MY_DAY
                ? TrackingActionSourceMeta.MY_DAY
                : TrackingActionSourceMeta.PAGE,
    });
};

export default {
    name: 'Mermaid',
    handler: insertMermaid,
};

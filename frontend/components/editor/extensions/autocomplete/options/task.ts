import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { v4 } from 'uuid';
import { EditorContext } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';

const insertTodo = (
    cmd: { editor: TipTapEditor; range: Range; props: any },
    _options: any,
    ctx: EditorContext,
) => {
    const startPos = cmd.editor.state.doc.resolve(cmd.range.from);
    const blockRange = startPos.blockRange();
    const blockParentType = blockRange?.parent.type.name;
    const isAtStart = startPos.parentOffset === 0;
    const isEmpty =
        cmd.range.to - cmd.range.from + 2 === startPos.parent.nodeSize;

    let chain = cmd.editor.chain().deleteRange(cmd.range);

    if (isAtStart && blockParentType === 'listItem') {
        chain = chain.setNode('taskItemContent', {});
    } else if (isAtStart && isEmpty) {
        const task = ctx.nuxt.$entities.task.createFromProperties({
            id: v4(),
            completed: false,
            text: '',
        });
        chain = chain.insertContentAt(cmd.range.from, `<ul>${task}</ul>`);
    } else if (isAtStart && !isEmpty) {
        chain = chain.setNode('taskItemContent', {}).wrapInList('bulletList');
    } else if (blockParentType === 'listItem') {
        chain = chain.splitListItem('listItem').setNode('taskItemContent', {});
    } else {
        chain = chain
            .splitBlock()
            .setNode('taskItemContent', {})
            .wrapInList('bulletList');
    }
    chain.run();
    ctx.nuxt.$tracking.trackEvent('task', { action: 'create' });
    const activeTab = ctx.nuxt.$tabs.activeTab();
    if (!activeTab) return;
    ctx.nuxt.$tracking.trackEventV2(TrackingType.EDITOR, {
        action: TrackingAction.INSERT_TASK,
        source: TrackingActionSource.AUTOCOMPLETE,
        sourceMeta:
            activeTab.type === TabType.MY_DAY
                ? TrackingActionSourceMeta.MY_DAY
                : TrackingActionSourceMeta.PAGE,
    });
    ctx.nuxt.$tracking.trackEventV2(TrackingType.TASK, {
        action: TrackingAction.CREATE,
        source: TrackingActionSource.AUTOCOMPLETE,
        sourceMeta:
            activeTab.type === TabType.MY_DAY
                ? TrackingActionSourceMeta.MY_DAY
                : TrackingActionSourceMeta.PAGE,
    });
};

export default {
    name: 'Task',
    handler: insertTodo,
};

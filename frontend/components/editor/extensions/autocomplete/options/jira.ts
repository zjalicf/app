import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { IntegrationType } from '~/constants';
import { EditorContext } from '~/@types/app';
import { TrackingActionSource } from '~/@types/tracking';

const insertJira = (
    cmd: { editor: TipTapEditor; range: Range; props: any },
    _options: any,
    ctx: EditorContext,
) => {
    const jiraIntegration = ctx.store.getters['integration/byType'](
        IntegrationType.JIRA,
    );
    if (!jiraIntegration.length) {
        ctx.nuxt.$utils.navigation.openSettings(
            'jira-integration',
            TrackingActionSource.EDITOR_AUTOCOMPLETE,
        );
        return;
    }
    cmd.editor.commands.command(({ tr, state }: any) => {
        const node = state.schema.nodes['jira-search'].create({
            type: 'inline',
        });

        tr.replaceWith(cmd.range.from, cmd.range.to, node);

        return true;
    });
};

export default {
    name: 'Jira Issue',
    handler: insertJira,
};

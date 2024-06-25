import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { EditorContext } from '~/@types/app';
import { IntegrationType } from '~/constants';
import { TrackingActionSource } from '~/@types/tracking';

const insertGithubSearch = (
    cmd: {
        editor: TipTapEditor;
        range: Range;
        props: any;
    },
    _options: any,
    ctx: EditorContext,
) => {
    const githubIntegration = ctx.store.getters['integration/byType'](
        IntegrationType.GITHUB,
    );
    if (!githubIntegration.length) {
        ctx.nuxt.$utils.navigation.openSettings(
            'github-integration',
            TrackingActionSource.EDITOR_AUTOCOMPLETE,
        );
        return;
    }
    cmd.editor.commands.command(({ tr, state }: any) => {
        const node = state.schema.nodes['github-search'].create({
            type: 'inline',
        });

        tr.replaceWith(cmd.range.from, cmd.range.to, node);

        return true;
    });
};

export default {
    name: 'Github Link',
    handler: insertGithubSearch,
};

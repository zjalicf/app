import { Editor as TipTapEditor, Range } from '@tiptap/core';
import { IntegrationType } from '~/constants';
import { EditorContext } from '~/@types/app';
import { LINEAR_SEARCH_NODE_NAME } from '~/components/editor/extensions/linear-search/linear';

const insertLinear = (
    cmd: { editor: TipTapEditor; range: Range; props: any },
    _options: any,
    ctx: EditorContext,
) => {
    const jiraIntegration = ctx.nuxt.$entities.linear.getIntegration();
    if (!jiraIntegration) {
        ctx.nuxt.$vfm.show({
            component: () => import('@/components/modal/SettingsModal.vue'),
            bind: {
                openTab: 'linear-integration',
            },
        });
        return;
    }
    cmd.editor.commands.command(({ tr, state }: any) => {
        const node = state.schema.nodes[LINEAR_SEARCH_NODE_NAME].create({
            type: 'inline',
        });

        tr.replaceWith(cmd.range.from, cmd.range.to, node);

        return true;
    });
};

export default {
    name: 'Linear Issue',
    handler: insertLinear,
};

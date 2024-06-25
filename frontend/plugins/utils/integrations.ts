import { Context } from '@nuxt/types';
import { IDocument } from '~/components/document/model';
import { isGithubEntity } from '~/plugins/entities/github';
import { isJiraEntity } from '~/plugins/entities/jira';
import GithubClipPill from '~/components/github/GithubClipPill.vue';
import URLClipPill from '~/components/integrations/clip/URLClipPill.vue';
import JiraClipPill from '~/components/jira/JiraClipPill.vue';
import { isLinearEntity } from '~/plugins/entities/linear';
import LinearClipPill from '~/components/linear/row/LinearClipPill.vue';

export class IntegrationsUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    isJiraClip(clip: string) {
        return isJiraEntity(clip);
    }

    isGithubClip(clip: string) {
        return isGithubEntity(clip);
    }

    isLinearClip(clip: string) {
        return isLinearEntity(clip);
    }

    getClipComponent(page: IDocument) {
        const clip = page.clip;
        if (!clip) return null;
        if (this.isGithubClip(clip)) {
            return GithubClipPill;
        }
        if (this.isJiraClip(clip)) {
            return JiraClipPill;
        }
        if (this.isLinearClip(clip)) {
            return LinearClipPill;
        }

        return URLClipPill;
    }
}

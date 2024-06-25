<template>
    <div class="entity-clip-modal-content">
        <div class="entity-clip-modal-content__header">
            <div class="entity-clip-modal-content__header__title">
                Select Issue or PR to clip
            </div>
        </div>
        <EntityClipModalControl>
            <template #title> Select Issue or PR from list: </template>
            <template #controls>
                <ASelect
                    :items="items"
                    :value="selected"
                    :width="400"
                    :dropdown-width="400"
                    :search="true"
                    check-placement="end"
                    placeholder="Github Issue or PR"
                    search-placeholder="Select Issue or PR"
                    @change="onSelectedFromPicker"
                />
            </template>
        </EntityClipModalControl>
        <EntityClipModalControl>
            <template #title> Paste an URL: </template>
            <template #controls>
                <CInput
                    :value="url"
                    type="text"
                    placeholder="Github URL"
                    class="input"
                    @input="onURLPasted"
                />
            </template>
            <template v-if="errorMessage" #error>
                {{ errorMessage }}
            </template>
        </EntityClipModalControl>
        <EntityClipModalFooter
            :issue-fetching="issueFetching"
            :error-message="errorMessage"
            :selected="selected"
            @accept="modalAccept"
            @cancel="modalCancel"
        />
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import CInput from '~/components/CInput.vue';
import ClipModalContentMixin from '~/components/integrations/clip/modal/content/ClipModalContentMixin.vue';
import EntityClipModalFooter from '~/components/integrations/clip/modal/EntityClipModalFooter.vue';
import EntityClipModalControl from '~/components/integrations/clip/modal/EntityClipModalControl.vue';
import { GithubIntegrationDataType } from '~/components/github/github';
import GithubIssueIcon from '~/components/github/GithubIssueIcon.vue';
import GithubPullRequestIcon from '~/components/github/GithubPullRequestIcon.vue';
import { GITHUB_ISSUE_REGEX, GITHUB_PR_REGEX } from '~/plugins/entities/github';
@Component({
    name: 'GithubClipModalContent',
    components: {
        EntityClipModalControl,
        EntityClipModalFooter,
        CInput,
        ASelect,
    },
})
export default class GithubClipModalContent extends ClipModalContentMixin {
    get items() {
        const githubIssues = this.$store.getters['integrationData/byType'](
            GithubIntegrationDataType.ISSUE,
        );
        const githubPRs = this.$store.getters['integrationData/byType'](
            GithubIntegrationDataType.PR,
        );
        return [...githubIssues, ...githubPRs].map((issue: any) => ({
            ...issue,
            label: `${
                issue.repository?.full_name ??
                issue.base?.repo?.full_name ??
                'Unknown'
            } #${issue.number} ${issue.title}`,
            icon: {
                icon:
                    issue.type === GithubIntegrationDataType.ISSUE
                        ? GithubIssueIcon
                        : GithubPullRequestIcon,
                bind: {
                    entity: issue,
                },
            },
        }));
    }

    async onGithubEntityPasted(url: string) {
        const entityId = this.$entities.github.parseUrl(url);
        const errorMessage = 'Could not fetch Issue or PR';

        if (!entityId) {
            this.onError(errorMessage);
            return;
        }

        const isLoaded = this.$entities.github.getById(entityId);

        if (isLoaded) this.onSelected(entityId);

        this.issueFetching = true;
        try {
            const entity = await this.$entities.github.fetchEntityById(
                entityId,
            );

            if (!entity) {
                this.onError(errorMessage);
                return;
            }
            this.onSelected(entity.id);
        } catch (e) {
            console.log(e);
            this.onError(errorMessage);
        }
    }

    onURLPasted(url: string) {
        this.url = url;
        this.errorMessage = null;
        if (this.url === '') return;

        const isGithubIssueLink = url.match(GITHUB_ISSUE_REGEX);
        const isGithubPRLink = url.match(GITHUB_PR_REGEX);
        if (!isGithubIssueLink && !isGithubPRLink) {
            this.onError('Please enter valid Issue or PR link');
            return;
        }
        if (!isGithubIssueLink && !isGithubPRLink) return;
        this.onGithubEntityPasted(url);
    }
}
</script>

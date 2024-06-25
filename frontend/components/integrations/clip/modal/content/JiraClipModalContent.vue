<template>
    <div class="entity-clip-modal-content">
        <div class="entity-clip-modal-content__header">
            <div class="entity-clip-modal-content__header__title">
                Select Issue to clip
            </div>
        </div>
        <EntityClipModalControl>
            <template #title> Select Issue from list: </template>
            <template #controls>
                <ASelect
                    :items="items"
                    :value="selected"
                    :width="400"
                    :dropdown-width="400"
                    :search="true"
                    check-placement="end"
                    placeholder="Jira Issue"
                    search-placeholder="Select Issue"
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
                    placeholder="Jira Issue URL"
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
import { JiraIntegrationDataType } from '~/constants/jira';
import ClipModalContentMixin from '~/components/integrations/clip/modal/content/ClipModalContentMixin.vue';
import EntityClipModalFooter from '~/components/integrations/clip/modal/EntityClipModalFooter.vue';
import EntityClipModalControl from '~/components/integrations/clip/modal/EntityClipModalControl.vue';
@Component({
    name: 'JiraClipModalContent',
    components: {
        EntityClipModalControl,
        EntityClipModalFooter,
        CInput,
        ASelect,
    },
})
export default class JiraClipModalContent extends ClipModalContentMixin {
    get items() {
        const jiraIssues = this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.ISSUE,
        );
        return jiraIssues.map((issue: any) => ({
            ...issue,
            label: `${issue.key} ${issue.text}`,
        }));
    }

    async onURLPasted(url: string) {
        this.url = url;
        this.errorMessage = null;
        if (this.url === '') return;

        const integration = this.$entities.jira.getIntegration();
        if (!integration) {
            this.onError('Jira integration not found');
            return;
        }
        const isJiraLink = this.$entities.jira.isJiraLink(url, integration);
        if (!isJiraLink) {
            this.onError('Please enter valid Jira issue link');
            return;
        }

        const matches = this.$entities.jira.getJiraMatch(url);
        const match = [...matches][0];
        const key = match[1];
        const issueCloud = integration.data.clouds.find((cloud: any) =>
            match[0].startsWith(cloud.url),
        );

        if (!key || !integration || !issueCloud) {
            this.onError('Please enter valid Jira issue link');
            return;
        }

        const [projectKey] = key.split('-');
        const project = this.$entities.jira.getProjectByKey(projectKey);

        if (!project) {
            this.onError('Project not found');
            return;
        }

        const isInStore = this.$entities.jira.getByKey(key);
        if (isInStore) {
            this.onSelected(isInStore.id);
            return;
        }

        this.issueFetching = true;
        try {
            const issue = (await this.$entities.jira.fetchIssue(
                integration,
                project,
                key,
            )) as any;
            if (!issue || !issue.id) {
                this.onError('Issue not found');
                return;
            }
            this.onSelected(issue.id);
        } catch (e) {
            console.log(e);
            this.onError('Issue not found');
        }
    }
}
</script>

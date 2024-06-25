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
                    placeholder="Linear Issue"
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
                    placeholder="Linear Issue URL"
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
import { LinearIntegrationDataType } from '~/constants/linear';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import { LINEAR_ISSUE_LINK_REGEXP } from '~/plugins/entities/linear';
@Component({
    name: 'LinearClipModalContent',
    components: {
        EntityClipModalControl,
        EntityClipModalFooter,
        CInput,
        ASelect,
    },
})
export default class LinearClipModalContent extends ClipModalContentMixin {
    get items() {
        const linearIssues = this.$store.getters['integrationData/byType'](
            LinearIntegrationDataType.ISSUE,
        );
        return [...linearIssues].map((issue: any) => {
            const deserializedIssue = this.$entities.linear.deserializeIssue(
                this.$entities.linear.getById(issue.id),
            );
            return {
                ...issue,
                label: `${issue.identifier ?? issue.key ?? 'Unknown'} ${
                    issue.title
                }`,
                icon: {
                    icon: LinearStateIcon,
                    bind: { state: deserializedIssue.state },
                },
            };
        });
    }

    async onLinearEntityPasted(url: string) {
        const key = this.$entities.linear.parseUrl(url);
        const errorMessage = 'Could not fetch Issue or PR';

        if (!key) {
            this.onError(errorMessage);
            return;
        }

        const isLoaded = this.$entities.linear.getByIdentifier(key);

        if (isLoaded) {
            this.onSelected(isLoaded.id);
            return;
        }

        this.issueFetching = true;
        try {
            const entity = await this.$entities.linear.fetchIssueByIdentifier(
                key,
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

        const isLinearIssueLink = url.match(LINEAR_ISSUE_LINK_REGEXP);
        if (!isLinearIssueLink) {
            this.onError('Please enter valid Issue link');
            return;
        }
        this.onLinearEntityPasted(url);
    }
}
</script>

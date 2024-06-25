<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :styles="{
            paddingTop: `30px`,
            paddingBottom: `30px`,
        }"
        :content-style="{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
        @closed="handleModalClose"
    >
        <div class="entity-modal" :class="[viewContext]">
            <LinearIssueView v-if="type === IntegrationType.LINEAR" :id="id" />
            <GithubIssueView
                v-if="type === IntegrationType.GITHUB"
                :id="id"
                @activity="activitySeen = true"
                @close="close"
            />
        </div>
    </vue-final-modal>
</template>
<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import GithubPullRequestView from '~/components/github/GithubPullRequestView.vue';
import GithubIssueView from '~/components/github/GithubIssueView.vue';
import {
    GithubIntegrationDataType,
    GithubSymbols,
} from '~/components/github/github';
import { IntegrationType } from '~/constants';
import { JiraIntegrationDataType } from '~/constants/jira';
import { LinearIntegrationDataType } from '~/constants/linear';
import LinearIssueView from '~/components/linear/modal/LinearIssueView.vue';

@Component({
    name: 'EntityModal',
    components: { GithubIssueView, GithubPullRequestView, LinearIssueView },
})
export default class EntityModal extends Vue {
    @Prop({ required: true })
    id!: string;

    IntegrationType = IntegrationType;

    get type() {
        const [type] = this.id.split('/');
        if (
            GithubIntegrationDataType.ISSUE === type ||
            GithubIntegrationDataType.PR === type
        ) {
            return IntegrationType.GITHUB;
        }
        if (type === LinearIntegrationDataType.ISSUE) {
            return IntegrationType.LINEAR;
        }
        if (type === JiraIntegrationDataType.ISSUE) {
            return IntegrationType.JIRA;
        }
        return type as IntegrationType;
    }

    @Provide(GithubSymbols.VIEW_CONTEXT)
    viewContext: string = 'modal';

    activitySeen: boolean = true;

    handleModalClose() {
        if (!this.activitySeen) return;
    }
}
</script>
<style lang="scss" scoped>
.entity-modal {
    @include scrollbar(69px, 10px);
    @include modal;
    overflow-y: auto;
    max-height: calc(100vh - 60px);
}
</style>

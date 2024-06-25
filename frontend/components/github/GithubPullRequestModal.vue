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
        <div class="github-pull-request-modal" :class="[viewContext]">
            <GithubPullRequestView
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
import { GithubSymbols } from '~/components/github/github';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'GithubPullRequestModal',
    components: { GithubPullRequestView },
})
export default class GithubPullRequestModal extends Vue {
    @Prop({ required: true })
    id!: string;

    activitySeen: boolean = true;

    @Provide(GithubSymbols.VIEW_CONTEXT)
    viewContext: string = 'modal';

    @Provide(GithubSymbols.TRACKING_ACTION_SOURCE)
    trackingSource: string = TrackingActionSource.GITHUB_PULL_REQUEST_MODAL;

    handleModalClose() {
        if (!this.activitySeen) return;

        this.$entities.github.updateAcreomMeta(this.id, {
            lastActivitySeenTimestamp: new Date().toISOString(),
            notification: false,
        });
    }
}
</script>
<style lang="scss" scoped>
.github-pull-request-modal {
    @include modal;
    @include scrollbar(69px, 10px);
    overflow-y: auto;
    max-height: calc(100vh - 60px);
}
</style>

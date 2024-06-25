<template>
    <div class="github-view-branch" @click="copyToClipboard">
        <div
            class="github-view-branch__wrapper has-tippy"
            :data-tippy-content="
                $utils.tooltip.createTooltip('Copy Branch Name to Clipboard')
            "
        >
            {{ entity.head?.ref }}
            <InterfaceFileClipboard v-if="!success" size="12" class="icon" />
            <InterfaceValidationCheck v-else size="12" class="icon" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { GithubPullRequest, GithubSymbols } from '~/components/github/github';
import InterfaceFileClipboard from '~/components/streamline/InterfaceFileClipboard.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubViewBranch',
    components: { InterfaceValidationCheck, InterfaceFileClipboard },
})
export default class GithubViewBranch extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest;

    @Inject(GithubSymbols.TRACKING_ACTION_SOURCE)
    trackingSource!: TrackingActionSource;

    success: boolean = false;

    copyToClipboard() {
        if (this.success) return;

        this.$utils.copyToClipboard(this.entity.head?.ref || '');

        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.COPY_PULL_REQUEST_BRANCH_NAME,
            source: this.trackingSource,
        });

        this.success = true;

        setTimeout(() => {
            this.success = false;
        }, 4000);
    }
}
</script>
<style lang="scss" scoped>
.github-view-branch {
    @include font12-500;
    cursor: default;
    display: flex;
    align-items: center;

    &__wrapper {
        padding: 4px 8px;
        border-radius: 6px;
        color: var(--github-property-text-color);
        transform: translateX(-8px);
        display: flex;
        align-items: center;
        gap: 6px;

        &:hover {
            background: var(
                --github-property-external-redirect-background__hover
            );
        }

        .icon {
            color: var(--github-properties-icon-color);
        }
    }
}
</style>

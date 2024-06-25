<template>
    <div class="github-view-repository" @click="openExternal">
        <div
            class="github-view-repository__wrapper has-tippy"
            :data-tippy-content="$utils.tooltip.createTooltip('Open on GitHub')"
        >
            <img v-if="image" :src="image" />
            {{ $entities.github.getRepositoryName(entity) }}
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
    name: 'GithubViewRepository',
    components: { InterfaceValidationCheck, InterfaceFileClipboard },
})
export default class GithubViewRepository extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest;

    @Inject(GithubSymbols.TRACKING_ACTION_SOURCE)
    trackingSource!: TrackingActionSource;

    get image() {
        return (
            this.entity?.repository?.owner?.avatar_url ||
            this.entity?.base?.repo?.owner?.avatar_url
        );
    }

    openExternal() {
        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.OPEN_REPOSITORY_IN_BROWSER,
            source: this.trackingSource,
        });

        this.$entities.github.openRepositoryInBrowser(this.entity);
    }
}
</script>
<style lang="scss" scoped>
.github-view-repository {
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

        img {
            display: block;
            width: 16px;
            height: 16px;
            border-radius: 4px;
        }

        &:hover {
            background: var(
                --github-property-external-redirect-background__hover
            );
        }
    }
}
</style>

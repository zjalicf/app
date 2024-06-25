<template>
    <div class="github-context-menu">
        <DropdownButton
            class="my-day-context-menu--option"
            @click="copyToClipboard"
        >
            <InterfaceLink class="icon" />
            Copy link
        </DropdownButton>
        <DropdownButton
            class="my-day-context-menu--option"
            @click="openInBrowser"
        >
            <InterfaceLinkSquare class="icon" />
            Open in browser
        </DropdownButton>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    GithubIntegrationDataType,
    GithubIssue,
    GithubPullRequest,
} from '~/components/github/github';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import InterfaceFileClipboard from '~/components/streamline/InterfaceFileClipboard.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubContextMenu',
    components: {
        InterfaceLink,
        InterfaceFileClipboard,
        InterfaceLinkSquare,
        DropdownButton,
        InterfaceAlertInformationCircle,
    },
})
export default class GithubContextMenu extends Vue {
    @Prop({ required: true })
    entity!: GithubIssue | GithubPullRequest;

    openInBrowser() {
        if (this.entity.type === GithubIntegrationDataType.PR) {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.OPEN_GITHUB_PULL_REQUEST_IN_BROWSER,
                source: TrackingActionSource.GITHUB_TAB_PULL_REQUEST_CONTEXT_MENU,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.OPEN_GITHUB_ISSUE_IN_BROWSER,
                source: TrackingActionSource.GITHUB_TAB_ISSUE_CONTEXT_MENU,
            });
        }

        this.$entities.github.openInBrowser(this.entity);
        this.$emit('close');
    }

    copyToClipboard() {
        const url = this.entity.html_url;

        this.$utils.copyToClipboard(url, 'Copied to clipboard');
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.github-context-menu {
    @include frostedGlassBackground;
    @include contextMenu;
}
</style>

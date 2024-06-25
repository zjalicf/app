<template>
    <div class="jira-context-menu">
        <div v-if="!pickingPage">
            <JiraIssueControls
                :entity-data="entityData"
                @close="$emit('close')"
            />
            <hr />
            <DropdownButton
                class="jira-context-menu--button"
                @click="copyToClipboard"
            >
                <div class="jira-context-menu--left">
                    <InterfaceLink class="icon" size="14" />
                    Copy link
                </div>
                <div class="jira-context-menu--right"></div>
            </DropdownButton>
            <DropdownButton
                class="jira-context-menu--button"
                @click="openInBrowser"
            >
                <div class="jira-context-menu--left">
                    <InterfaceLinkSquare class="icon" size="14" />
                    Open in Browser
                </div>
                <div class="jira-context-menu--right"></div>
            </DropdownButton>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import {
    CheckIcon,
    DocumentIcon,
    LinkIcon,
    TrashIcon,
} from '@vue-hero-icons/solid';
import { OpenPopupIcon, TriangleRight } from '~/components/icons';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import InterfaceArrowsBendRight1Alternate from '~/components/streamline/InterfaceArrowsBendRight1Alternate.vue';
import InterfaceBookmarkTag from '~/components/streamline/InterfaceBookmarkTag.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceEditPencil from '~/components/streamline/InterfaceEditPencil.vue';
import InterfaceValidationCheckSquare1 from '~/components/streamline/InterfaceValidationCheckSquare1.vue';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import InterfaceFileCheckAlternate from '~/components/streamline/InterfaceFileCheckAlternate.vue';
import InterfaceArrowsBendUpRight2 from '~/components/streamline/InterfaceArrowsBendUpRight2.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import InterfaceUnlink from '~/components/streamline/InterfaceUnlink.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import JiraIssueControls from '~/components/integrations/jira/JiraIssueControls.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import ADropDown from '~/components/ADropDown.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'JiraContextMenu',
    components: {
        InterfaceLink,
        ADropDown,
        InterfaceAlertInformationCircle,
        DropdownButton,
        JiraIssueControls,
        InterfaceCalendar,
        InterfaceUnlink,
        InterfaceLinkSquare,
        JiraIcon,
        InterfaceArrowsBendUpRight2,
        InterfaceFileCheckAlternate,
        TooltipKeys,
        InterfaceValidationCheckSquare1,
        InterfaceEditPencil,
        InterfaceContentFileAlternate,
        InterfaceDeleteBin1,
        InterfaceBookmarkTag,
        TrashIcon,
        LinkIcon,
        CheckIcon,
        DocumentIcon,
        OpenPopupIcon,
        InterfaceFavoriteStar,
        InterfaceArrowsBendRight1Alternate,
        TriangleRight,
    },
})
export default class JiraContextMenu extends JiraEntityMixin {
    @Prop({ required: true })
    entityId!: any;

    $refs!: {
        status: HTMLElement;
        priority: HTMLElement;
        assignee: HTMLElement;
        labels: HTMLElement;
    };

    selected: any[] = [];

    pickingPage: boolean = false;

    get entityData() {
        return this.$store.getters['integrationData/byId'](this.entityId);
    }

    openInBrowser() {
        this.$emit('close');
        this.$utils.navigation.openExternalLink(this.entityData.url);
        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.OPEN_JIRA_ISSUE_IN_BROWSER,
            source: TrackingActionSource.JIRA_TAB_CONTEXT_MENU,
        });
    }

    copyToClipboard() {
        const url = this.entityData.url;
        this.$utils.copyToClipboard(url, 'Copied to clipboard');
        this.$emit('close');
    }

    created() {
        this.entity = this.entityData;
    }
}
</script>

<style lang="scss" scoped>
.jira-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;

    &--title {
        @include font10-700;
        padding: 3px 8px 0;
        color: var(--context-menu-section-title);
        text-transform: uppercase;
    }

    &--left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &--right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        :deep(.tooltip-keys--button) {
            background: none;
            color: var(--context-menu-tooltip-keys-color);
        }
    }

    &--button {
        justify-content: space-between;
    }
}
</style>

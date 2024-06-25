<template>
    <div class="jira-dropdown">
        <div class="jira-dropdown--section--title">Filters</div>
        <DisplayIssues :tab-id="tabId" @update="updateAssignee" />
        <hr />
        <JiraOrdering :tab-id="tabId" @update="updateSortBy" />
        <hr />
        <div class="jira-dropdown--section">
            <div class="jira-dropdown--section--title">display properties</div>
            <DisplayProperties :tab-id="tabId" />
        </div>
        <hr />
        <button tabindex="-1" @click="openPreferences('jira-integration')">
            <CogIcon size="20" class="icon" />
            Jira Settings
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CogIcon } from '@vue-hero-icons/solid';
import DisplayIssues from '~/components/dropdown/controls/DisplayIssues.vue';
import DisplayProperties from '~/components/dropdown/controls/DisplayProperties.vue';
import JiraOrdering from '~/components/dropdown/controls/JiraOrdering.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'JiraDropdown',
    components: { CogIcon, JiraOrdering, DisplayProperties, DisplayIssues },
})
export default class JiraDropdown extends Vue {
    @Prop({ required: true })
    tabId!: string;

    openPreferences(pane: string) {
        this.$dropdown.hideAll();
        this.$utils.navigation.openSettings(
            pane,
            TrackingActionSource.JIRA_TAB,
        );
    }

    updateAssignee($event: any) {
        this.$emit('update', $event);

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.FILTER_BY_ASSIGNEE,
        });
    }

    updateSortBy($event: any) {
        this.$emit('update', $event);

        this.$tracking.trackDropdownEvent(TrackingType.JIRA, $event, {});
    }
}
</script>
<style lang="scss" scoped>
.jira-dropdown {
    @include frostedGlassBackground;
    padding: 10px;
    border-radius: 12px;
    min-width: 270px;
    max-width: 270px;
    user-select: none;

    button {
        outline: none;
        display: flex;
        width: 100%;
        align-items: center;
        font-weight: 500;
        font-size: 13px;
        line-height: 155.2%;
        color: var(--calendar-visibility-dropdown-button-color);
        padding: 3px 13px 3px 6px;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: var(--calendar-visibility-dropdown-button-color__hover);

            .icon {
                color: var(
                    --calendar-visibility-dropdown-button-icon-color__hover
                );
            }
        }

        .icon {
            color: var(--calendar-visibility-dropdown-button-icon-color);
            margin-right: 13px;
        }
    }

    hr {
        margin: 10px 0px;
        border-color: var(--tab-divider-color);
    }

    &--section {
        &--title {
            @include font10-700;
            padding: 0 0 8px;
            color: var(--dropdown-button-text-color);
            text-transform: uppercase;
        }
    }
}
</style>

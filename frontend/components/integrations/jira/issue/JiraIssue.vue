<template>
    <div
        class="jira-issue"
        :class="{
            'context-highlight': contextMenuOpen,
            'hover-highlight': isInPanel,
        }"
    >
        <button
            class="jira-issue--wrapper"
            :class="{
                focused: focused,
            }"
            @click="openIssueModal"
            @contextmenu.prevent.stop="onIssueContextMenuHandle"
        >
            <div class="jira-issue--left">
                <div
                    v-if="showNotification"
                    class="jira-issue--left--notification"
                ></div>
                <div
                    v-else
                    class="jira-issue--left--notification-placeholder"
                ></div>
                <IssueType
                    v-if="displayProperty('type') || minimal"
                    class=""
                    :entity="issue"
                />
                <IssuePriority
                    v-if="displayProperty('priority') && !minimal"
                    ref="jiraIssuePriority"
                    class="has-tippy"
                    :data-tippy-content="
                        $shortcutsManager.getShortcutTooltipString(
                            $shortcutsManager.availableShortcuts.JIRA_PRIORITY,
                        )
                    "
                    :entity="issue"
                    :selected="focused"
                />
                <IssueStatus
                    v-if="displayProperty('status') && !minimal"
                    ref="jiraIssueStatus"
                    class="has-tippy"
                    :data-tippy-content="
                        $shortcutsManager.getShortcutTooltipString(
                            $shortcutsManager.availableShortcuts.JIRA_STATUS,
                        )
                    "
                    :entity="issue"
                    :selected="focused"
                />
                <div
                    v-if="displayProperty('key') || minimal"
                    class="jira-issue--key"
                >
                    {{ issue.key }}
                </div>
                <div class="jira-issue--text">{{ issue.text }}</div>
            </div>
            <div class="jira-issue--right">
                <IssueLabels
                    v-if="displayProperty('labels') && !minimal"
                    ref="jiraIssueLabels"
                    class="has-tippy"
                    :data-tippy-content="
                        $shortcutsManager.getShortcutTooltipString(
                            $shortcutsManager.availableShortcuts.JIRA_LABELS,
                        )
                    "
                    :entity="issue"
                    :selected="focused"
                />
                <span
                    v-if="displayProperty('updated')"
                    :data-tippy-content="longUpdatedAt"
                    class="jira-issue--updated-at has-tippy"
                >
                    {{ updatedAt }}
                </span>
                <span
                    v-if="displayProperty('created')"
                    :data-tippy-content="longCreatedAt"
                    class="jira-issue--updated-at has-tippy"
                >
                    {{ createdAt }}
                </span>
                <IssueAssignee
                    v-if="displayProperty('assignee') && !minimal"
                    ref="jiraIssueAssignee"
                    class="has-tippy"
                    :data-tippy-content="
                        $shortcutsManager.getShortcutTooltipString(
                            $shortcutsManager.availableShortcuts.JIRA_ASSIGNEE,
                        )
                    "
                    name="jira-issue-assignee"
                    :entity="issue"
                    :selected="focused"
                />
                <IssueClipTrigger
                    :name="`jira-issue-clip-${issue.id}`"
                    :entity="issue"
                    :source="TrackingActionSource.JIRA_TAB"
                    :selected="focused"
                />
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns-tz';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import { currentTimezone, localizedRelativeFormat } from '~/helpers/date';
import { TabSymbols } from '~/constants/symbols';
import InterfaceRemove1 from '~/components/streamline/InterfaceRemove1.vue';
import IssueAssignee from '~/components/integrations/jira/issue/IssueAssignee.vue';
import IssuePriority from '~/components/integrations/jira/issue/IssuePriority.vue';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import IssueClipTrigger from '~/components/integrations/jira/issue/IssueClipTrigger.vue';
import IssueLabels from '~/components/integrations/jira/issue/IssueLabels.vue';
import IssueStatus from '~/components/integrations/jira/issue/IssueStatus.vue';
import JiraContextMenu from '~/components/integrations/jira/JiraContextMenu.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraIssue',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        IssueStatus,
        IssueLabels,
        IssueClipTrigger,
        IssueType,
        IssuePriority,
        IssueAssignee,
        InterfaceRemove1,
        InterfaceUserCircle,
        InterfaceAdd1,
        DocumentIcon,
        AcreomChevronRight,
    },
})
export default class JiraIssue extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({
        default: null,
    })
    issue!: any;

    @Prop({
        default: false,
    })
    collapsible!: boolean;

    @Prop({ default: false })
    minimal!: boolean;

    @Prop({ default: false })
    focused!: boolean;

    @Prop({ default: false })
    isInPanel!: boolean;

    $refs!: {
        assignee: HTMLElement;
        priority: HTMLElement;
        jiraIssueAssignee: IssueAssignee;
        jiraIssuePriority: IssuePriority;
        jiraIssueStatus: IssueStatus;
        jiraIssueLabels: IssueLabels;
    };

    contextMenuOpen: boolean = false;

    get createdAtTrigger() {
        return `updatedAt-${this.issue.id}`;
    }

    get updatedAtTrigger() {
        return `createdAt-${this.issue.id}`;
    }

    get showNotification() {
        return this.issue.notification;
    }

    get hasLabels() {
        return this.issue.properties?.labels?.length ?? false;
    }

    get displayProperties() {
        return (
            (!this.minimal &&
                this.$store.getters['tabs/byId'](this.tabId).data
                    .selectedDisplayProperties) ??
            []
        );
    }

    openLabelsDropdown() {
        this.$refs.jiraIssueLabels?.onLabelsDropdown?.();
    }

    openAssigneeDropdown() {
        this.$refs.jiraIssueAssignee?.onAssigneeDropdown?.();
    }

    openPriorityDropdown() {
        this.$refs.jiraIssuePriority?.onPriorityDropdown?.();
    }

    openStatusDropdown() {
        this.$refs.jiraIssueStatus?.onStatusDropdown?.();
    }

    shouldShowTippy() {
        return this.focused;
    }

    displayProperty(property: string) {
        return !this.minimal && this.displayProperties.includes(property);
    }

    get jiraIssueId() {
        return this.issue.id;
    }

    get document() {
        return this.$store.getters['document/byClip'](this.jiraIssueId);
    }

    get createdAt() {
        return format(new Date(this.issue.properties.created), `d MMM`, {
            timeZone: currentTimezone(),
        });
    }

    get updatedAt() {
        return format(new Date(this.issue.properties.updated), `d MMM`, {
            timeZone: currentTimezone(),
        });
    }

    get longCreatedAt() {
        return `<span class='tooltip'>${localizedRelativeFormat(
            new Date(this.issue.properties.created),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        )}</span>`;
    }

    get longUpdatedAt() {
        return `<span class='tooltip'>${localizedRelativeFormat(
            new Date(this.issue.properties.updated),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        )}</span>`;
    }

    openIssueModal() {
        this.$entities.jira.openModal(
            this.issue,
            TrackingActionSource.JIRA_TAB,
        );
    }

    onIssueContextMenuHandle(e: any) {
        this.contextMenuOpen = true;
        this.$contextMenu.show(e, {
            component: JiraContextMenu,
            bind: {
                entityId: this.issue.id,
                tabId: this.tabId,
            },
            onClose: () => {
                this.contextMenuOpen = false;
                this.$nextTick(() => {
                    this.$dropdown.hideAll();
                });
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.jira-issue {
    height: 100%;
    width: 100%;
    user-select: none;

    &.context-highlight,
    &:hover.hover-highlight {
        background: var(--document-card-bg-color_hover);
        border-radius: 6px;
    }

    &--wrapper {
        width: 100%;
        padding: 4px 5px 4px 7px;
        display: flex;
        justify-content: space-between;
        justify-items: start;
        align-items: center;
        border-radius: 6px;

        &.focused {
            background: var(--document-card-bg-color_hover);
            border-radius: 6px;
        }
    }

    &--left {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        line-height: 22px;
        overflow: hidden;
        text-align: left;

        &--notification {
            flex-shrink: 0;
            background: var(--orange-color);
            border-radius: 50%;
            width: 8px;
            height: 8px;
        }

        &--notification-placeholder {
            flex-shrink: 0;
            width: 8px;
            height: 8px;
        }

        &--status {
            width: 14px;
            height: 14px;
        }
    }

    &--right {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
    }

    &--key {
        //@include font14-500;
        font-weight: 500;
        font-size: 13px;
        line-height: 24px;
        flex-shrink: 0;
        font-style: normal;
        color: var(--jira-issue-key-color);
        font-feature-settings: 'tnum' on;
    }

    &--text {
        @include ellipsis;
        font-weight: 500;
        font-size: 13px;
        line-height: 24px;
        overflow-y: hidden;
        width: 100%;
        color: var(--jira-issue-text-color);
        padding-right: 4px;
    }

    &--updated-at {
        @include font12-500;
        @include ellipsis;
        width: 100%;
        font-weight: 400;
        min-width: 42px;
        text-align: right;
    }
}
</style>

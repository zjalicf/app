<template>
    <div class="jira-issue-controls">
        <div class="jira-issue-controls--title">jira</div>
        <DropdownButton
            ref="status"
            :class="{ active: active === 'status' }"
            class="jira-issue-controls--button"
            @mouseenter="showStatusDropdown"
        >
            <div class="jira-issue-controls--left">
                <JiraIcon class="icon" size="14" />
                Status
            </div>
            <TriangleRight class="small-icon" size="8" />
        </DropdownButton>
        <DropdownButton
            ref="priority"
            :class="{ active: active === 'priority' }"
            class="jira-issue-controls--button"
            @mouseenter="showPriorityDropdown"
        >
            <div class="jira-issue-controls--left">
                <JiraIcon class="icon" size="14" />
                Priority
            </div>
            <TriangleRight class="small-icon" size="8" />
        </DropdownButton>
        <DropdownButton
            ref="assignee"
            :class="{ active: active === 'assignee' }"
            class="jira-issue-controls--button"
            @mouseenter="showAssigneeDropdown"
        >
            <div class="jira-issue-controls--left">
                <JiraIcon class="icon" size="14" />
                Assignee
            </div>
            <TriangleRight class="small-icon" size="8" />
        </DropdownButton>
        <DropdownButton
            ref="labels"
            :class="{ active: active === 'labels' }"
            class="jira-issue-controls--button"
            @mouseenter="showLabelsDropdown"
        >
            <div class="jira-issue-controls--left">
                <JiraIcon class="icon" size="14" />
                Labels
            </div>
            <TriangleRight class="small-icon" size="8" />
        </DropdownButton>
    </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { TriangleRight } from '~/components/icons';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import ADropDown from '~/components/ADropDown.vue';
import { JiraActions } from '~/constants';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraIssueControls',
    components: {
        DropdownButton,
        JiraIcon,
        TriangleRight,
    },
})
export default class JiraIssueControls extends JiraEntityMixin {
    @Prop({ required: true })
    entityData!: any;

    $refs!: {
        status: any;
        priority: any;
        assignee: any;
        labels: any;
    };

    picker: string | null = null;
    active: string | null = '';
    selected: any[] = [];
    labelsUpdated: boolean = false;

    // @ts-ignore
    get entity() {
        return this.setProperties(this.entityData);
    }

    async showStatusDropdown() {
        await this.$nextTick();
        if (this.active !== 'status') {
            this.hideOptions();
            this.active = 'status';
        }
        this.$dropdown.show({
            name: 'jira-status',
            parent: this.$refs.status.$el,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-6, 7],
                        },
                    },
                ],
            },
            bind: {
                items: this.statusesByEntity,
                value: this.status?.id,
                search: false,
                searchPlaceholder: 'Search status',
                clear: false,
                multi: false,
                checkPlacement: 'end',
            },
            on: {
                change: (value: any) => {
                    this.$dropdown.hideAll();
                    this.$emit('close');
                    this.handleStatusChange(value);
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async showPriorityDropdown() {
        await this.$nextTick();
        if (this.active !== 'priority') {
            this.hideOptions();
            this.active = 'priority';
        }
        this.$dropdown.show({
            name: 'jira-priority',
            parent: this.$refs.priority.$el,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-6, 7],
                        },
                    },
                ],
            },
            bind: {
                items: this.prioritiesByEntity,
                value: this.priority ?? null,
                search: false,
                clear: false,
                multi: false,
                checkPlacement: 'end',
            },
            on: {
                change: (value: any) => {
                    this.handlePriorityChange(value);
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async showAssigneeDropdown() {
        await this.$nextTick();
        if (this.active !== 'assignee') {
            this.hideOptions();
            this.active = 'assignee';
        }
        this.$dropdown.show({
            name: 'jira-assignee',
            parent: this.$refs.assignee.$el,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-6, 7],
                        },
                    },
                ],
            },
            bind: {
                items: this.assigneesByEntity,
                value: this.assignee ?? null,
                search: false,
                searchPlaceholder: 'Search assignee',
                clear: false,
                multi: false,
                checkPlacement: 'end',
            },
            on: {
                change: (value: any) => {
                    this.handleAssigneeChange(value);
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async showLabelsDropdown() {
        await this.$nextTick();
        if (this.active !== 'labels') {
            this.hideOptions();
            this.active = 'labels';
        }
        this.$dropdown.show({
            name: 'jira-labels',
            parent: this.$refs.labels.$el,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-5, 7],
                        },
                    },
                ],
            },
            bind: {
                items: this.labelsByEntity,
                value: this.labels,
                search: false,
                searchPlaceholder: 'Search labels',
                clear: false,
                multi: true,
            },
            on: {
                change: (value: any) => {
                    this.handleLabelsChange({ labels: value });
                },
            },
            onClose: () => {
                this.active = null;
                if (this.labelsUpdated) {
                    this.labelsUpdated = false;
                    this.$notification.show({
                        component: () =>
                            import(
                                '@/components/integrations/jira/JiraNotification.vue'
                            ),
                        bind: {
                            entityId: this.entity.id,
                            action: JiraActions.UPDATE,
                            property: 'Labels',
                        },
                    });
                }
            },
        });
    }

    handleStatusChange(newStatus: any) {
        this.hideOptions();
        this.$emit('close');
        this.changeStatus(
            { transitionId: newStatus },
            TrackingActionSource.JIRA_TAB_CONTEXT_MENU,
        );
    }

    handlePriorityChange(newPriority: any) {
        this.hideOptions();
        this.$emit('close');
        this.changePriority(
            { id: newPriority },
            TrackingActionSource.JIRA_TAB_CONTEXT_MENU,
        );
    }

    handleLabelsChange(props: any) {
        this.changeLabels(props, TrackingActionSource.JIRA_TAB_CONTEXT_MENU);
        this.labelsUpdated = true;
    }

    handleAssigneeChange(newAssignee: any) {
        this.hideOptions();
        this.$emit('close');
        this.changeAssignee(
            { id: newAssignee },
            TrackingActionSource.JIRA_TAB_CONTEXT_MENU,
        );
    }

    hideOptions() {
        this.$dropdown.hide('jira-status');
        this.$dropdown.hide('jira-priority');
        this.$dropdown.hide('jira-assignee');
        this.$dropdown.hide('jira-labels');
        this.active = null;
    }

    registerShortcuts() {}

    removeShortcuts() {}

    beforeDestroy() {
        this.$nuxt.$off('dropdown-button-hover');
        this.removeShortcuts();
    }

    mounted() {
        this.$nuxt.$on('dropdown-button-hover', () => {
            this.hideOptions();
        });
        this.registerShortcuts();
    }
}
</script>

<style lang="scss" scoped>
.jira-issue-controls {
    @include contextMenu;
    padding: 0;

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

    &--button {
        justify-content: space-between;
    }
}
</style>

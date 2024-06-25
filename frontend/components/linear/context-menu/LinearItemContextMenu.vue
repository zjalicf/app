<template>
    <div class="linear-context-menu">
        <DropdownButton ref="status" @mouseenter="openStatusDropdown">
            <div class="linear-context-menu--left">
                <LinearIconRound class="icon" size="16" />
                Status
            </div>
            <TriangleRight class="small-icon" size="8"
        /></DropdownButton>
        <DropdownButton ref="assignee" @mouseenter="openUserDropdown">
            <div class="linear-context-menu--left">
                <LinearIconRound class="icon" size="16" />
                Assignee
            </div>
            <TriangleRight class="small-icon" size="8"
        /></DropdownButton>
        <DropdownButton ref="priority" @mouseenter="openPriorityDropdown">
            <div class="linear-context-menu--left">
                <LinearIconRound class="icon" size="16" />
                Priority
            </div>
            <TriangleRight class="small-icon" size="8"
        /></DropdownButton>
        <DropdownButton ref="labels" @mouseenter="openLabelsDropdown">
            <div class="linear-context-menu--left">
                <LinearIconRound class="icon" size="16" />
                Labels
            </div>
            <TriangleRight class="small-icon" size="8"
        /></DropdownButton>
        <DropdownButton ref="project" @mouseenter="openProjectDropdown">
            <div class="linear-context-menu--left">
                <LinearIconRound class="icon" size="16" />
                Project
            </div>
            <TriangleRight class="small-icon" size="8"
        /></DropdownButton>
        <hr />
        <DropdownButton
            class="linear-context-menu--button"
            @click="copyToClipboard"
        >
            <div class="linear-context-menu--left">
                <InterfaceLink class="icon" size="14" />
                Copy link
            </div>
            <div class="linear-context-menu--right"></div>
        </DropdownButton>
        <DropdownButton
            class="linear-context-menu--button"
            @click="openInBrowser"
        >
            <div class="linear-context-menu--left">
                <InterfaceLinkSquare class="icon" size="14" />
                Open in Browser
            </div>
            <div class="linear-context-menu--right"></div>
        </DropdownButton>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { TriangleRight } from '~/components/icons';
import LinearIconRound from '~/components/linear/icons/LinearIconRound.vue';
import LinearStateDropdown from '~/components/linear/dropdown/LinearStateDropdown.vue';
import LinearUserDropdown from '~/components/linear/dropdown/LinearUserDropdown.vue';
import LinearPriorityDropdown from '~/components/linear/dropdown/LinearPriorityDropdown.vue';
import LinearLabelsDropdown from '~/components/linear/dropdown/LinearLabelsDropdown.vue';
import LinearProjectDropdown from '~/components/linear/dropdown/LinearProjectDropdown.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'LinearItemContextMenu',
    components: {
        LinearIconRound,
        TriangleRight,
        JiraIcon,
        InterfaceLinkSquare,
        InterfaceLink,
        DropdownButton,
    },
})
export default class LinearItemContextMenu extends Vue {
    @Prop({ required: true })
    entityId!: any;

    $refs!: {
        status: DropdownButton;
        priority: DropdownButton;
        assignee: DropdownButton;
        labels: DropdownButton;
        project: DropdownButton;
    };

    selected: any[] = [];
    active: string | null = null;

    pickingPage: boolean = false;

    get entity() {
        return this.$entities.linear.getIssueById(this.entityId);
    }

    get teamId() {
        return this.$entities.linear.parseId(this.entityId).teamId;
    }

    get clippedDocument() {
        return this.$store.getters['document/byClip'](this.entityId);
    }

    openInBrowser() {
        if (!this.entity) return;
        this.$emit('close');
        this.$utils.navigation.openExternalLink(this.entity.url);
        this.$tracking.trackEventV2(TrackingType.LINEAR, {
            action: TrackingAction.OPEN_IN_BROWSER,
            source: TrackingActionSource.LINEAR_ISSUE_CONTEXT_MENU,
        });
    }

    copyToClipboard() {
        if (!this.entity) return;
        const url = this.entity.url;
        this.$utils.copyToClipboard(url, 'Copied to clipboard');
        this.$emit('close');
    }

    hideOptions() {
        this.$dropdown.hide('linear-state-dropdown');
        this.$dropdown.hide('linear-user-dropdown');
        this.$dropdown.hide('linear-priority-dropdown');
        this.$dropdown.hide('linear-label-dropdown');
        this.$dropdown.hide('linear-project-dropdown');
        this.$dropdown.hideAll();
        this.active = null;
    }

    async openStatusDropdown() {
        if (this.active !== 'status') {
            this.hideOptions();
            await this.$nextTick();
            this.active = 'status';
        }
        this.$dropdown.show({
            name: 'linear-state-dropdown',
            parent: this.$refs.status.$el,
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
            component: LinearStateDropdown,
            bind: {
                stateId: this.entity?.state.id,
                search: false,
            },
            on: {
                change: (state: any) => {
                    this.$dropdown.hide('linear-state-dropdown');
                    this.$emit('change', state);
                },
                close: () => {
                    this.$dropdown.hide('linear-state-dropdown');
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async openUserDropdown() {
        if (this.active !== 'assignee') {
            this.hideOptions();
            await this.$nextTick();
            this.active = 'assignee';
        }
        this.$dropdown.show({
            name: 'linear-user-dropdown',
            parent: this.$refs.assignee.$el,
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
            component: LinearUserDropdown,
            bind: {
                teamId: this.teamId,
                userId: this.entity?.assignee?.id ?? null,
                search: false,
            },
            on: {
                change: (user: any) => {
                    this.$entities.linear.updateAssignee(this.entity, user);
                },
                close: () => {
                    this.$dropdown.hide('linear-user-dropdown');
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async openPriorityDropdown() {
        if (this.active !== 'priority') {
            this.hideOptions();
            await this.$nextTick();
            this.active = 'priority';
        }
        this.$dropdown.show({
            name: 'linear-priority-dropdown',
            parent: this.$refs.priority.$el,
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
            component: LinearPriorityDropdown,
            bind: {
                priorityId: this.entity?.priority.id,
                search: false,
            },
            on: {
                change: (priority: any) => {
                    this.$entities.linear.updatePriority(this.entity, priority);
                },
                close: () => {
                    this.$dropdown.hide('linear-priority-dropdown');
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async openLabelsDropdown() {
        if (this.active !== 'labels') {
            this.hideOptions();
            await this.$nextTick();
            this.active = 'labels';
        }
        this.$dropdown.show({
            name: 'linear-label-dropdown',
            parent: this.$refs.labels.$el,
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
            component: LinearLabelsDropdown,
            bind: {
                teamId: this.teamId,
                labels: this.entity?.labels,
                search: false,
            },
            on: {
                change: (labels: any) => {
                    this.$entities.linear.updateLabels(this.entity, labels);
                },
                close: () => {
                    this.$dropdown.hide('linear-label-dropdown');
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    async openProjectDropdown() {
        if (this.active !== 'project') {
            this.hideOptions();
            await this.$nextTick();
            this.active = 'project';
        }
        this.$dropdown.show({
            name: 'linear-project-dropdown',
            parent: this.$refs.project.$el,
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
            component: LinearProjectDropdown,
            bind: {
                teamId: this.teamId,
                projectId: this.entity?.project ?? null,
                search: false,
            },
            on: {
                change: (project: any) => {
                    this.$dropdown.hide('linear-project-dropdown');
                    this.$entities.linear.updateProject(this.entity, project);
                },
                close: () => {
                    this.$dropdown.hide('linear-project-dropdown');
                },
            },
            onClose: () => {
                this.active = null;
            },
        });
    }

    mounted() {
        this.$nuxt.$on('dropdown-button-hover', () => {
            this.hideOptions();
        });
    }
}
</script>

<style lang="scss" scoped>
.linear-context-menu {
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

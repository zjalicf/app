<template>
    <div>
        <div
            class="linear-issue"
            :class="{ active, selected }"
            @contextmenu.stop.prevent="handleContextMenu"
        >
            <div class="linear-issue__front-meta">
                <span
                    class="linear-issue__notification"
                    :class="{ active: entity.acreomMeta?.notification }"
                ></span>
                <LinearPriorityIcon
                    v-if="displayProperty(LinearDisplayProperties.PRIORITY)"
                    ref="priority"
                    :priority="entity.priority"
                    class="
                        linear-issue__item__priority
                        linear-issue__item--hover-state
                    "
                    :class="{
                        active: activePart === 'priority',
                        disabled: !editable,
                    }"
                    @click.native.prevent.stop="openPriorityDropdown"
                />
                <div
                    v-else
                    ref="priorityPlaceholder"
                    class="linear-issue__item__placeholder"
                ></div>
                <div
                    v-if="displayProperty(LinearDisplayProperties.KEY)"
                    class="linear-issue__item__identifier"
                    :style="{ '--column-width': `${identifierWidth}px` }"
                >
                    {{ entity.identifier }}
                </div>
                <LinearStateIcon
                    v-if="displayProperty(LinearDisplayProperties.STATUS)"
                    ref="state"
                    :state="entity.state"
                    class="
                        linear-issue__item__state
                        linear-issue__item--hover-state
                    "
                    :class="{
                        active: activePart === 'status',
                        disabled: !editable,
                    }"
                    @click.native.prevent.stop="openStateDropdown"
                />
                <div
                    v-else
                    ref="statePlaceholder"
                    class="linear-issue__item__placeholder"
                ></div>
            </div>
            <p>
                {{ entity.title }}
            </p>
            <div class="linear-issue__back-meta">
                <LinearRowLabels
                    v-if="
                        displayProperty(LinearDisplayProperties.LABELS) &&
                        entity.labels.length
                    "
                    ref="labels"
                    :labels="entity.labels"
                    :disabled="true"
                />
                <div
                    v-else
                    ref="labelsPlaceholder"
                    class="linear-issue__item__placeholder"
                ></div>
                <LinearProject
                    v-if="
                        displayProperty(LinearDisplayProperties.PROJECT) &&
                        entity.project
                    "
                    ref="project"
                    :project="entity.project"
                    :disabled="true"
                />
                <div
                    v-else
                    ref="projectPlaceholder"
                    class="linear-issue__item__placeholder"
                ></div>
                <LinearCycle
                    v-if="
                        displayProperty(LinearDisplayProperties.CYCLE) &&
                        entity.cycle
                    "
                    :cycle="entity.cycle"
                    :disabled="true"
                />
                <div
                    v-if="displayProperty(LinearDisplayProperties.UPDATED)"
                    class="linear-issue__item__created-at"
                >
                    {{ formatDate(entity.updatedAt) }}
                </div>
                <div
                    v-if="displayProperty(LinearDisplayProperties.CREATED)"
                    class="linear-issue__item__created-at"
                >
                    {{ formatDate(entity.createdAt) }}
                </div>
                <LinearUserIcon
                    v-if="displayProperty(LinearDisplayProperties.ASSIGNEE)"
                    ref="assignee"
                    class="linear-issue__item__user"
                    :class="{
                        active: activePart === 'assignee',
                        disabled: !editable,
                    }"
                    :user="entity.assignee"
                    @click.native.prevent.stop="openUserDropdown"
                />
                <div
                    v-else
                    ref="assigneePlaceholder"
                    class="linear-issue__item__placeholder"
                ></div>
                <EntityClipButton
                    v-if="displayProperty(LinearDisplayProperties.CLIP)"
                    :entity-id="entity.id"
                    @click.native.prevent.stop="handleClipClick"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import InterfaceArrowsDiagonalAlternate from '~/components/streamline/InterfaceArrowsDiagonalAlternate.vue';
import { TabSymbols } from '~/constants/symbols';
import { TabType } from '~/constants';
import EntityClipButton from '~/components/linear/EntityClipButton.vue';
import LinearCycle from '~/components/linear/row/LinearCycle.vue';
import LinearItemContextMenu from '~/components/linear/context-menu/LinearItemContextMenu.vue';
import { LinearDisplayPropertiesOptions } from '~/components/linear/constants';

@Component({
    name: 'LinearIssue',
    components: {
        LinearCycle,
        LinearRowLabels: () =>
            import('~/components/linear/row/LinearRowLabels.vue'),
        LinearProject: () =>
            import('~/components/linear/row/LinearProject.vue'),
        LinearUserIcon: () =>
            import('~/components/linear/icons/LinearUserIcon.vue'),
        LinearPriorityIcon: () =>
            import('~/components/linear/icons/LinearPriorityIcon.vue'),
        LinearStateIcon: () =>
            import('~/components/linear/icons/LinearStateIcon.vue'),
        InterfaceArrowsDiagonalAlternate,
        EntityClipButton,
    },
    computed: {
        LinearDisplayProperties() {
            return LinearDisplayPropertiesOptions;
        },
    },
})
export default class LinearIssue extends Vue {
    @Prop({ required: true })
    entity!: any;

    @Prop()
    meta!: any;

    @Prop({ default: true })
    showBacklinks!: boolean;

    @Prop({ default: false })
    selected!: boolean;

    @Prop({ default: false })
    editable!: boolean;

    @Prop({ default: false })
    minimal!: boolean;

    @Prop({ default: () => [] })
    displayProperties!: string[];

    active: boolean = false;
    activePart: string = '';

    $refs!: {
        state: Vue;
        statePlaceholder: HTMLElement;
        priority: Vue;
        priorityPlaceholder: HTMLElement;
        assignee: Vue;
        assigneePlaceholder: HTMLElement;
        labels: Vue;
        labelsPlaceholder: HTMLElement;
        project: Vue;
        projectPlaceholder: HTMLElement;
    };

    get backlinks() {
        return [];
    }

    get identifierWidth() {
        return (
            this.meta?.identifierWidth ?? 2 + 8 * this.entity.identifier.length
        );
    }

    handleContextMenu(event: MouseEvent) {
        this.$contextMenu.show(event, {
            component: LinearItemContextMenu,
            bind: {
                entityId: this.entity.id,
            },
            onClose: () => {
                this.$nextTick(() => {
                    this.$dropdown.hideAll();
                });
            },
        });
    }

    displayProperty(property: string) {
        return this.displayProperties.includes(property);
    }

    formatDate(date: string) {
        // format as 17 Jan
        return format(new Date(date), 'd MMM');
    }

    get clip() {
        return this.$entities.linear.getClip(this.entity.id);
    }

    get teamId() {
        return this.entity.team.split('/').pop()!;
    }

    handleClipClick() {
        if (this.clip) {
            const tab = this.$tabs.createNewTabObject(
                this.clip.id,
                TabType.DOCUMENT,
            );

            this.$tabs.openTab(tab);
            return;
        }

        this.$entities.linear.createPageFromEntity(this.entity);
    }

    openUserDropdown() {
        this.activePart = 'assignee';
        const teamId = this.entity.team.split('/').pop()!;
        this.$dropdown.show({
            name: 'linear-user-dropdown',
            parent: this.$refs.assigneePlaceholder ?? this.$refs.assignee.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-end',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearUserDropdown.vue'
                ) as any,
            bind: {
                teamId,
                userId: this.entity.assignee?.id,
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
                this.activePart = '';
            },
        });
    }

    openStateDropdown() {
        this.activePart = 'status';
        this.$dropdown.show({
            name: 'linear-state-dropdown',
            parent: this.$refs.statePlaceholder ?? this.$refs.state.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearStateDropdown.vue'
                ) as any,
            bind: {
                stateId: this.entity.state.id,
            },
            on: {
                change: (state: any) => {
                    this.$entities.linear.updateState(this.entity, state);
                },
                close: () => {
                    this.$dropdown.hide('linear-state-dropdown');
                },
            },
            onClose: () => {
                this.activePart = '';
            },
        });
    }

    openPriorityDropdown() {
        this.activePart = 'priority';
        this.$dropdown.show({
            name: 'linear-priority-dropdown',
            parent: this.$refs.priorityPlaceholder ?? this.$refs.priority.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearPriorityDropdown.vue'
                ) as any,
            bind: {
                priorityId: this.entity.priority.id,
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
                this.activePart = '';
            },
        });
    }

    openLabelsDropdown() {
        this.activePart = 'labels';
        const isPlaceholder = !!this.$refs.labelsPlaceholder;

        this.$dropdown.show({
            name: 'linear-label-dropdown',
            parent: this.$refs.labelsPlaceholder ?? this.$refs.labels.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: isPlaceholder ? 'bottom-end' : 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearLabelsDropdown.vue'
                ) as any,
            bind: {
                teamId: this.teamId,
                labels: this.entity.labels,
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
                this.activePart = '';
            },
        });
    }

    openProjectDropdown() {
        this.activePart = 'project';
        const isPlaceholder = !!this.$refs.projectPlaceholder;
        this.$dropdown.show({
            name: 'linear-project-dropdown',
            parent: this.$refs.projectPlaceholder ?? this.$refs.project.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: isPlaceholder ? 'bottom-end' : 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearProjectDropdown.vue'
                ) as any,
            bind: {
                teamId: this.teamId,
                projectId: this.entity.project?.id ?? null,
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
                this.activePart = '';
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-issue {
    font-weight: 500;
    font-size: 13px;
    line-height: 24px;
    padding: 4px 5px 4px 7px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    cursor: default;
    position: relative;
    user-select: none;

    &__item {
        &--hover-state {
            &:hover,
            &.active {
                background: var(--issue-status-bg-color__hover);
            }
        }
        &__placeholder {
            width: 0;
            height: 16px;
        }
        &__priority {
            padding: 2px;
            border-radius: 4px;

            &--state {
                padding: 4px;
            }
        }

        &__state {
            padding: 4px;
            border-radius: 4px;
        }

        &__user {
            &:hover,
            &.active {
                filter: brightness(120%);
            }
        }

        &__identifier {
            min-width: var(--column-width);
            color: var(--jira-issue-key-color);
        }

        &__created-at {
            min-width: 46px;
            color: var(--jira-issue-key-color);
        }
    }

    &__front-meta {
        display: flex;
        flex-direction: row;
        flex: 0 0 auto;
        align-items: center;
        gap: 8px;
    }

    &__back-meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        min-width: fit-content;
        gap: 8px;
    }

    p {
        @include ellipsis;
        color: var(--jira-issue-text-color);
        min-width: 0px;
        width: 100%;
    }

    .icon {
        flex-shrink: 0;
    }

    &__notification {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;

        &.active {
            background: var(--orange-color);
        }
    }

    &:hover,
    &.active,
    &.selected {
        background: var(--document-card-bg-color_hover);
        border-radius: 6px;
    }

    &__backlinks {
        @include font12-500;
        display: flex;
        align-items: center;
        gap: 5px;
        color: $blueGrey400;
        background: $blueGrey100-05;
        padding: 2px 12px;
        border-radius: 30px;

        &:hover,
        &.active {
            background: $blueGrey800;
            color: $white;
        }
    }

    &__comments {
        margin-left: auto;
    }
}
</style>

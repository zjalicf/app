<template>
    <draggable v-model="sidebarEntities" v-bind="dragOptions">
        <transition-group ref="views" type="transition" name="views">
            <div
                v-for="entity of sidebarEntities"
                :key="entity.id"
                :class="{ 'can-reorder': canReorder(entity) }"
            >
                <div
                    class="view-sorted__view"
                    :class="{
                        'view-sorted__view--can-reorder': canReorder(entity),
                    }"
                >
                    <div class="view-sorted__view__wrapper">
                        <div class="view-sorted__view__name">
                            <component
                                :is="getIcon(entity)"
                                v-bind="{
                                    id: entity.id,
                                    viewId: entity.id,
                                }"
                            />
                            {{ entity.name || 'Untitled' }}
                        </div>
                    </div>
                    <div
                        v-if="canReorder(entity)"
                        class="view-sorted__view__drag-handle"
                    >
                        <ComputerConnectionSignalLoading size="12" />
                    </div>
                </div>
            </div>
        </transition-group>
    </draggable>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import InterfaceArrowsRight from '~/components/streamline/InterfaceArrowsRight.vue';
import ComputerConnectionSignalLoading from '~/components/streamline/ComputerConnectionSignalLoading.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import InterfaceFavoriteStarAlternate from '~/components/streamline/InterfaceFavoriteStarAlternate.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { IntegrationConfig } from '~/workers/integrations/base';
import { IntegrationType, SidebarEntityType } from '~/constants';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';
import InterfaceAlignLayers1 from '~/components/streamline/InterfaceAlignLayers1.vue';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';

@Component({
    name: 'SidebarSettingsSortable',
    components: {
        InterfaceFavoriteStarAlternate,
        InterfaceFavoriteStar,
        ComputerConnectionSignalLoading,
        InterfaceArrowsRight,
        draggable: () => import('vuedraggable'),
    },
})
export default class SidebarSettingsSortable extends Vue {
    get dragOptions() {
        return {
            animation: 200,
            group: {
                name: 'view',
                pull: true,
                put: true,
            },
            disabled: false,
            ghostClass: 'ghost',
            dragClass: 'dragged-status',
            draggable: '.can-reorder',
        };
    }

    get apps() {
        if (!this.$accessControl.hasProAccess) return [];
        const integrations = this.$store.getters['integration/list'].filter(
            ({ type }: any) =>
                ![
                    IntegrationType.ICS_CALENDAR,
                    IntegrationType.GOOGLE_CALENDAR,
                    IntegrationType.APPLE_CALENDAR,
                ].includes(type),
        );
        const integrationsWithProjects = integrations.filter(
            (integration: any) =>
                integration?.data?.projects?.filter(
                    (project: any) => project.syncEnabled,
                ).length,
        );

        const githubIntegrations = integrations.filter(
            (integration: any) => integration.type === IntegrationType.GITHUB,
        );
        const linearIntegrations = integrations.filter(
            (integration: any) => integration.type === IntegrationType.LINEAR,
        );

        const integrationSet = new Set([
            ...integrationsWithProjects.map(
                (i: IntegrationConfig<any>) => i.type,
            ),
            ...githubIntegrations.map((i: IntegrationConfig<any>) => i.type),
            ...linearIntegrations.map((i: IntegrationConfig<any>) => i.type),
        ]);

        const getIcon = (type: string) => {
            switch (type) {
                case IntegrationType.JIRA:
                    return JiraIcon;
                case IntegrationType.GITHUB:
                    return GithubIcon;
                case IntegrationType.LINEAR:
                    return LinearIcon;
            }
        };
        const toTitleCase = (type: string): string => {
            return type[0].toUpperCase() + type.slice(1);
        };
        const data = [...integrationSet.values()]
            .map(v => ({
                name: v === IntegrationType.LINEAR ? 'Linear' : toTitleCase(v),
                id: v,
                icon: getIcon(v),
                authStatus: integrations.find((i: any) => i.type === v)
                    ?.authStatus,
            }))
            .sort((a, b) => (a.name > b.name ? 1 : -1));

        return data;
    }

    get sidebarEntities() {
        const entities = this.$utils.sidebar.sidebarEntities;
        const minOrder = Math.min(
            ...entities.map((view: any) => view?.order ?? -1),
        );
        const maxOrder = Math.max(
            ...entities.map((view: any) => view.order ?? 100000),
        );
        const orderedViews = [
            {
                id: 'my_day',
                name: 'My Day',
                order: minOrder - 1,
            },
        ];
        orderedViews.push(...entities);
        orderedViews.push(
            ...this.apps.map((app: any, idx: number) => ({
                ...app,
                order: maxOrder + idx,
            })),
        );
        return orderedViews;
    }

    set sidebarEntities(values: any[]) {
        const valueIndices = values.map((entity: any) => entity.id);
        const views = values.filter(
            (entity: any) =>
                entity.sidebarEntityType === SidebarEntityType.VIEW,
        );
        const projects = values.filter(
            (entity: any) =>
                entity.sidebarEntityType === SidebarEntityType.PROJECT,
        );
        this.$entities.view.batchUpdate(
            views.map(view => ({
                ...view,
                order: valueIndices.indexOf(view.id),
            })),
        );
        this.$entities.project.updateBatch(
            projects.map(project => {
                const storedProject = this.$entities.project.byId(project.id);
                const properties = {
                    ...storedProject!.properties,
                    order: valueIndices.indexOf(project.id),
                };
                return {
                    ...storedProject,
                    properties,
                };
            }),
        );
        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.REORDER_SIDEBAR_BENTO_ITEMS,
        });
    }

    canReorder(entity: any) {
        return !!entity.sidebarEntityType;
    }

    getIcon(entity: any) {
        if (entity.sidebarEntityType) {
            return this.$utils.sidebar.getEntityIcon(entity);
        }
        if (entity.icon) {
            return entity.icon;
        }
        if (entity.id === 'my_day') {
            return InterfaceFavoriteStar;
        }
        return InterfaceAlignLayers1;
    }
}
</script>
<style lang="scss" scoped>
.view-sorted {
    &__view {
        @include font12-500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 12px;
        background: var(--settings-modal-jira-sortable-bg-color);
        border-radius: 5px;
        margin-bottom: 4px;

        opacity: 0.5;

        &--can-reorder {
            cursor: move;
            opacity: 1;

            &:hover:not(.ghost) {
                background: var(--settings-modal-jira-sortable-bg-color__hover);

                .view-sorted__view__name {
                    color: var(
                        --settings-modal-jira-sortable-text-color__hover
                    );
                }

                .view-sorted__view__drag-handle {
                    opacity: 1;
                }
            }
        }

        &__wrapper {
            display: flex;
            align-items: center;
            justify-items: flex-start;
            gap: 8px;
        }

        &__name {
            display: flex;
            align-items: center;
            justify-items: flex-start;
            gap: 8px;
        }

        &__icon {
            margin-right: 8px;
        }

        &__drag-handle {
            flex-shrink: 0;
            transform: rotate(90deg);
            color: var(--settings-modal-jira-sortable-icon-color);
            opacity: 0;
        }
    }
}
</style>

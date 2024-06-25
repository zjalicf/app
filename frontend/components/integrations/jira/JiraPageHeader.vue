<template>
    <div class="jira-page-header">
        <p>
            {{ infoText }}
        </p>
        <div
            class="jira-page-header__heading"
            :class="{ expanded: filterByAssignee.length || !displayAll }"
        >
            <button
                ref="projectSelect"
                :disabled="projects.length <= 1"
                class="jira-page-header__heading__project-select"
                :class="{ active: dropdownActive }"
                @click="showProjectSelector"
            >
                {{ displayProject }}
                <LoadingIcon
                    v-if="currentUpdateProgress"
                    v-tippy="{ theme: 'tooltip', placement: 'right' }"
                    size="16"
                    :content="`<div class='tooltip'>Loading ${currentUpdateProgress.status} issues: ${currentUpdateProgress.current} / ${currentUpdateProgress.total}</div>`"
                    class="loading-icon"
                />
                <AcreomChevronDown
                    v-if="projects.length > 1"
                    class="icon"
                    size="12"
                />
            </button>

            <div class="jira-page-header__heading__controls">
                <JiraSearch
                    ref="jiraSearch"
                    @search="$emit('search', $event)"
                />
                <button
                    class="
                        jira-page-header__heading__controls__refresh
                        has-tippy
                    "
                    data-tippy-content="<div class='tooltip'>Refresh JIRA issues</div>"
                    @click="$emit('refresh')"
                >
                    <InterfaceArrowsSynchronize size="14" class="icon" />
                </button>
                <JiraDropdownWrapper @update="updateProperties" />
            </div>
        </div>
        <div
            v-if="filterByAssignee.length || !displayAll"
            class="jira-page-header__filter__wrapper"
        >
            <div v-if="!displayAll" class="jira-page-header__filter">
                Assigned to me
                <button tabindex="-1" @click="updateDisplayAll">
                    <XIcon size="16" class="icon" />
                </button>
            </div>
            <div
                v-if="filterByAssignee.length"
                class="jira-page-header__filter"
            >
                Filter by assignee
                <DisplayByAssigneeDropdown
                    :tab-id="tabId"
                    @update="updateDisplayByAssignee"
                />
                <button tabindex="-1" @click="clearFilterByAssignees">
                    <XIcon size="16" class="icon" />
                </button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
import ProjectSwitch from '~/components/integrations/jira/ProjectSwitch.vue';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';
import JiraDropdownWrapper from '~/components/dropdown/JiraDropdownWrapper.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import JiraSearch from '~/components/integrations/jira/JiraSearch.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { IntegrationType } from '~/constants';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import DisplayByAssigneeDropdown from '~/components/jira/DisplayByAssigneeDropdown.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'JiraPageHeader',
    components: {
        DisplayByAssigneeDropdown,
        InterfaceArrowsSynchronize,
        LoadingIcon,
        JiraSearch,
        InterfaceSearch,
        JiraDropdownWrapper,
        AcreomChevronDown,
        XIcon,
    },
})
export default class JiraPageHeader extends Vue {
    dropdownActive: boolean = false;

    @Prop({ default: 0, required: true })
    issues!: number;

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    $refs!: {
        projectSelect: HTMLButtonElement;
        jiraSearch: JiraSearch;
    };

    blurSearchWithoutClose() {
        this.$refs.jiraSearch?.blurWithoutClose();
    }

    get filterByAssignee(): string[] {
        return this.folderOptions?.filterByAssignee ?? [];
    }

    get currentUpdateProgress() {
        return (
            this.updateProgresses?.[this.currentProject?.id]?.loadProgress ??
            null
        );
    }

    get updateProgresses() {
        const progresses = this.jiraIntegrations.reduce(
            (acc: any, { updateProgress }: { updateProgress: any[] }) => ({
                ...acc,
                ...(updateProgress ?? {}),
            }),
            {},
        );
        return progresses;
    }

    get displayAll() {
        return this.folderOptions?.displayAll ?? false;
    }

    get folderOptions() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get jiraOptions() {
        return (
            this.$store.getters['vaultSettings/integrationsOptions'].jira ?? {}
        );
    }

    get jiraIntegrations() {
        return this.$store.getters['integration/byType'](IntegrationType.JIRA);
    }

    get projects() {
        const projects = this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PROJECT,
        );
        return projects.filter((proj: any) => proj.syncEnabled);
    }

    get currentProject() {
        return this.projects.find(
            (project: any) => project.id === this.folderOptions.project,
        );
    }

    get displayProject() {
        return this.currentProject?.name ?? '';
    }

    get infoText() {
        return `${this.issues} issues`;
    }

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    updateDisplayByAssignee(data: any) {
        this.updateProperties(data);

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.FILTER_BY_ASSIGNEE,
        });
    }

    clearFilterByAssignees() {
        this.updateProperties({ filterByAssignee: [] });
    }

    updateDisplayAll() {
        this.updateProperties({ displayAll: true });
    }

    updateProperties(data: any) {
        this.updateTabData(data);
        this.$store.dispatch('vaultSettings/updateIntegrationsOptions', {
            jira: data,
        });
    }

    showProjectSelector() {
        this.dropdownActive = true;
        this.$dropdown.show({
            component: ProjectSwitch,
            parent: this.$refs.projectSelect,
            bind: {
                tabId: this.tabId,
                loading: this.updateProgresses,
            },
            on: {
                'project-switch': (id: string) => {
                    this.$tracking.trackEventV2(TrackingType.JIRA, {
                        action: TrackingAction.SWITCH_PROJECT,
                    });
                    this.updateTabData({ project: id });
                    this.$store.dispatch(
                        'vaultSettings/updateIntegrationsOptions',
                        { jira: { project: id } },
                    );
                },
            },
            onClose: () => {
                this.dropdownActive = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.jira-page-header {
    user-select: none;
    padding-top: 14px;

    &__filter {
        @include font12-500;
        background: var(--jira-page-header-filter-bg-color);
        padding: 4px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        grid-gap: 7px;
        gap: 6px;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
        border-radius: 6px;

        &__wrapper {
            display: flex;
            border-bottom: 1px solid var(--tab-divider-color);
            padding-bottom: 10px;
        }

        :deep(.a-select__button) {
            padding: 2px 4px;
        }

        button {
            color: var(--jira-page-header-filter-button-text-color);

            &:hover {
                color: var(--jira-page-header-filter-button-text-color__hover);
            }
        }
    }

    p {
        user-select: none;
        color: var(--tab-meta-text-color);
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
        margin-bottom: 7px;
    }

    &__heading {
        &.expanded {
            border-bottom: 1px solid var(--tab-divider-color);
        }
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;

        &__project-select {
            color: var(--tab-title-text-color);
            font-weight: bold;
            font-size: 26px;
            line-height: 40px;
            user-select: none;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 6px;
            border-radius: 6px;

            &:not(:disabled):hover,
            &.active {
                background: var(
                    --jira-page-header-filter-selector-bg-color__hover
                );
            }

            .icon {
                color: var(--jira-page-header-filter-selector-icon-color);
                flex-shrink: 0;
                margin-left: 9px;
            }

            .loading-icon {
                color: var(--jira-page-header-filter-selector-loading-color);
                flex-shrink: 0;
                margin-left: 9px;
            }
        }

        &__controls {
            display: flex;
            align-items: center;
            gap: 8px;

            &__refresh {
                padding: 7px;
                border-radius: 6px;
                color: var(--tab-controls-icon-color);

                //.icon {
                //    color: var(--editor-searchbar-button-text-color);
                //}

                &:hover,
                &.active {
                    background: var(--tab-controls-bg-color__hover);
                    color: var(--tab-controls-icon-color__hover);
                }
            }
        }
    }
}
</style>

<template>
    <div class="github-page-header">
        <div class="github-page-header__heading">
            <div class="github-page-header__heading__tabs">
                <button
                    ref="repositorySelect"
                    class="github-page-header__heading__tab"
                    :class="{ active: activeTab === 'recent' }"
                    @click="$emit('updateOptions', { activeTab: 'recent' })"
                >
                    Recent
                </button>
                <button
                    ref="repositorySelect"
                    class="github-page-header__heading__tab"
                    :class="{ active: activeTab === 'issues' }"
                    @click="$emit('updateOptions', { activeTab: 'issues' })"
                >
                    Issues
                </button>
                <button
                    ref="repositorySelect"
                    class="github-page-header__heading__tab"
                    :class="{ active: activeTab === 'pulls' }"
                    @click="$emit('updateOptions', { activeTab: 'pulls' })"
                >
                    Pull Requests
                </button>
            </div>
            <div class="github-page-header__heading__actions">
                <GithubVirtualListSearch @search="$emit('search', $event)" />
                <button @click="manualRefresh">
                    <InterfaceArrowsSynchronize size="14" class="icon" />
                </button>
                <GithubVirtualListOptions
                    :active-tab="activeTab"
                    @updateOptions="$emit('updateOptions', $event)"
                />
            </div>
        </div>
        <div class="github-page-header__switch" :class="[activeTab]">
            <CIconSwitch
                v-if="activeTab !== 'recent'"
                :key="activeTab"
                :options="switchOptions"
                :value="activeFilter"
                @change="updateFilter"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import JiraDropdownWrapper from '~/components/dropdown/JiraDropdownWrapper.vue';
import JiraSearch from '~/components/integrations/jira/JiraSearch.vue';
import CIconSwitch from '~/components/CIconSwitch.vue';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import GithubVirtualListSearch from '~/components/github/GithubVirtualListSearch.vue';
import GithubVirtualListOptions from '~/components/github/GithubVirtualListOptions.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'GithubPageHeader',
    components: {
        GithubVirtualListOptions,
        GithubVirtualListSearch,
        InterfaceArrowsSynchronize,
        CIconSwitch,
        JiraSearch,
        JiraDropdownWrapper,
        LoadingIcon,
        AcreomChevronDown,
    },
})
export default class GithubPageHeader extends Vue {
    @Prop({ required: true })
    activeTab!: 'issues' | 'pulls' | 'recent';

    @Prop({ required: true })
    activeFilter!: string;

    manualRefresh() {
        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.INTEGRATION_RELOAD,
        });
        this.$entities.github.refresh();
    }

    updateFilter(filterBy: string) {
        const value: any = {
            [this.activeTab]: {
                filterBy,
            },
        };
        this.$emit('updateOptions', value);
    }

    get switchOptions() {
        if (this.activeTab === 'issues') {
            return [
                { id: 'created', label: 'Created' },
                { id: 'assigned', label: 'Assigned' },
                { id: 'mentioned', label: 'Mentioned' },
                { id: 'all', label: 'All' },
            ];
        }

        return [
            { id: 'created', label: 'Created' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'mentioned', label: 'Mentioned' },
            { id: 'review', label: 'To Review' },
            { id: 'all', label: 'All' },
        ];
    }
}
</script>
<style lang="scss" scoped>
.github-page-header {
    user-select: none;

    p {
        user-select: none;
        color: var(--tab-meta-text-color);
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
        margin-bottom: 7px;
    }

    &__switch {
        &.issues {
            max-width: 288px;
        }

        &.pulls {
            max-width: 360px;
        }
    }

    &__heading {
        border-bottom: 1px solid var(--tab-divider-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__tabs {
            display: flex;
            gap: 20px;
        }

        &__actions {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 8px;

            button {
                padding: 7px;
                border-radius: 6px;
                color: var(--tab-controls-icon-color);

                &:hover {
                    background: var(--tab-controls-bg-color__hover);
                    color: var(--tab-controls-icon-color__hover);
                }
            }
        }

        &__tab {
            @include font14-600;
            color: $blueGrey300;
            font-weight: bold;
            user-select: none;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            padding: 7px 6px;
            position: relative;

            &:hover {
                color: var(--tab-title-text-color);
            }

            &.active {
                color: var(--tab-title-text-color);
                &::after {
                    content: ' ';
                    width: 100%;
                    height: 2px;
                    background: white;
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                }
            }
        }
    }
}
</style>

<template>
    <div class="app-header" :class="{ 'search-active': open }">
        <div class="app-header--left">
            <TrafficLights
                v-if="isMac"
                class="app-header--left--traffic-lights"
            />
            <WorkspaceSelector class="app-header--left--selector" />
            <SidebarControls />
        </div>
        <div class="app-header--center">
            <AppNavigationArrows />
            <TabInfo v-if="!open" class="app-header--center--search" />
            <SearchComponent
                v-else
                ref="search"
                :include-interactions="includeInteractions"
                :initial-query="initialQuery"
                @close="open = false"
                @update:interactions="includeInteractions = $event"
            />
            <NewTabButton />
        </div>
        <div class="app-header--right">
            <SyncStatus />
            <UserProfileButton />
            <TopBar v-if="isWindows || isLinux" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TrafficLights from '~/components/mac/TrafficLights.vue';
import SidebarControls from '~/components/header/app-header/SidebarControls.vue';
import TabInfo from '~/components/header/app-header/TabInfo.vue';
import WorkspaceSelector from '~/components/header/app-header/WorkspaceSelector.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import UserProfileButton from '~/components/header/app-header/UserProfileButton.vue';
import NewTabButton from '~/components/header/app-header/NewTabButton.vue';
import AppNavigationArrows from '~/components/header/app-header/AppNavigationArrows.vue';
import TopBar from '~/components/windows/TopBar.vue';
import SearchComponent from '~/components/search/SearchComponent.vue';
import SyncStatus from '~/components/header/app-header/SyncStatus.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'AppHeader',
    components: {
        SearchComponent,
        TopBar,
        AppNavigationArrows,
        NewTabButton,
        UserProfileButton,
        InterfaceAdd1,
        WorkspaceSelector,
        TabInfo,
        SidebarControls,
        TrafficLights,
        SyncStatus,
    },
})
export default class AppHeader extends Vue {
    open: boolean = false;
    includeInteractions: boolean = false;
    initialQuery: string = '';

    $refs!: {
        search: SearchComponent;
    };

    get isWindows() {
        return this.$config.os === 'windows';
    }

    get isLinux() {
        return this.$config.os === 'linux';
    }

    get isMac() {
        return this.$config.os === 'mac';
    }

    mounted() {
        this.$nuxt.$on(
            'open-search',
            (
                opts: {
                    includeInteractions?: boolean;
                    text?: string;
                    source?: TrackingActionSource;
                } = {},
            ) => {
                const options = {
                    includeInteractions: false,
                    text: '',
                    ...opts,
                };
                if (this.$vfm.openedModals.length > 0) return;

                this.$nextTick(() => {
                    this.includeInteractions = options.includeInteractions;
                    this.initialQuery = options.text;
                    this.open = true;
                });
                this.$tracking.trackEventV2(TrackingType.NAVIGATION, {
                    action: TrackingAction.OPEN,
                    source: opts.source!,
                });
            },
        );
        this.$nuxt.$on(
            'open-full-search',
            (
                query: string = '',
                initialSearchType: 'assistant' | 'search' = 'search',
            ) => {
                let localQuery = '';

                if (this.open && this.$refs.search) {
                    localQuery = this.$refs.search.text;
                    this.$refs.search.searchOpen = false;
                    this.$refs.search.handleSearchClose();
                }

                if (this.$vfm.openedModals.length > 0) return;

                this.$nextTick(() => {
                    this.$vfm.show({
                        component: () =>
                            import(
                                '@/components/modal/SearchModal/SearchModal.vue'
                            ),
                        bind: {
                            query: localQuery || query,
                            initialSearchType,
                        },
                    });
                });
            },
        );
    }
}
</script>
<style lang="scss" scoped>
.app-header {
    @include drag;
    width: 100%;

    display: grid;
    grid-template-columns: 0.5fr 1fr 0.5fr;
    align-items: center;
    padding: 5px 12px 4px 16px;

    &.search-active {
        padding: 5px 12px 4px 16px;
    }

    &--left {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        &--traffic-lights {
            margin-right: 11px;
        }

        &--selector {
            margin-right: 7px;
        }
    }

    &--center {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        overflow: hidden;

        .search-active & {
            overflow: visible;
        }

        &--search {
            overflow: hidden;
        }
    }

    &--right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 14px;
    }
}
</style>

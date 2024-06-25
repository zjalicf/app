<template>
    <div class="github-virtual-list-search">
        <button v-if="!searchOpen" @click="openSearch">
            <InterfaceSearch />
        </button>
        <div v-else class="github-virtual-list-search__input">
            <InterfaceSearch class="icon" />
            <input
                ref="input"
                v-model="queryString"
                type="text"
                placeholder="Search issues & PRs"
                @input="handleSearchChange"
                @keydown.esc.prevent="closeSearch"
            />
            <button @click="closeSearch">
                <InterfaceDeleteCircle size="12" class="icon" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubVirtualListSearch',
    components: { InterfaceDeleteCircle, InterfaceSearch },
})
export default class GithubVirtualListSearch extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    searchOpen = false;
    queryString = '';

    $refs!: {
        input: HTMLInputElement;
    };

    closeSearch() {
        this.searchOpen = false;
        this.queryString = '';
        this.$emit('search', '');
    }

    openSearch() {
        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.OPEN_SEARCH,
            source: TrackingActionSource.GITHUB_TAB,
        });
        this.searchOpen = true;
        this.$nextTick(() => {
            this.$refs.input?.focus();
        });
    }

    handleSearchChange(event: any) {
        const searchTerm = event.target?.value!;
        this.$emit('search', searchTerm);
    }
}
</script>
<style lang="scss" scoped>
.github-virtual-list-search {
    > button {
        padding: 7px;
        border-radius: 6px;
        color: var(--tab-controls-icon-color);

        &:hover {
            background: var(--tab-controls-bg-color__hover);
            color: var(--tab-controls-icon-color__hover);
        }
    }

    &__input {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border: 1px solid var(--tab-divider-color);
        border-radius: 8px;

        .icon {
            color: var(--editor-searchbar-button-text-color);
        }

        input {
            @include inputMetaStyles;
            @include font12-500;
            padding: 2px 5px;
            outline: none;
            color: var(--editor-searchbar-text-color);

            &::placeholder {
                color: var(--jira-search-placeholder);
            }
        }

        button {
            color: var(--tab-controls-icon-color);
            padding: 3px;
            border-radius: 50%;

            &:hover,
            &.active {
                background: var(--tab-controls-bg-color__hover);
                color: var(--tab-controls-icon-color__hover);
            }
        }
    }
}
</style>

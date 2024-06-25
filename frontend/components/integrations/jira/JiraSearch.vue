<template>
    <div class="jira-search">
        <button v-show="!searchOpen" key="closed" @click="openSearch">
            <InterfaceSearch class="icon" />
        </button>
        <div v-show="searchOpen" key="opened" class="jira-search--wrapper">
            <InterfaceSearch class="icon" />
            <input
                ref="input"
                v-model="queryString"
                type="text"
                placeholder="Search issues"
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
import { Component, Inject, Vue, Watch } from 'vue-property-decorator';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceRemove1 from '~/components/streamline/InterfaceRemove1.vue';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'JiraSearch',
    components: { InterfaceDeleteCircle, InterfaceRemove1, InterfaceSearch },
})
export default class JiraSearch extends Vue {
    $refs!: {
        input: HTMLInputElement;
    };

    queryString: string = '';

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    get searchOpen() {
        return this.tabData.searchOpen;
    }

    @Watch('searchOpen')
    onSearchOpenChange(value: boolean) {
        if (!value) return;
        this.focus();
    }

    handleSearchChange(event: any) {
        const searchTerm = event.target?.value;
        this.$emit('search', searchTerm);
    }

    clearQuery() {
        this.queryString = '';
        this.$emit('search', '');
    }

    blurWithoutClose() {
        this.$refs.input?.blur();
    }

    focus() {
        if (this.$refs.input) {
            this.$nextTick(() => {
                this.$refs.input?.focus();
            });
        }
    }

    openSearch() {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data: { searchOpen: true },
        });
        this.focus();

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.OPEN_SEARCH,
        });
    }

    closeSearch() {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data: { searchOpen: false, searchTerm: '' },
        });
        this.queryString = '';
        this.$emit('search', '');
    }

    beforeDestroy() {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data: { searchTerm: this.queryString },
        });
    }

    mounted() {
        if (!this.searchOpen) return;
        this.queryString = this.tabData.searchTerm ?? '';
        this.$emit('search', this.queryString);
        this.focus();
    }
}
</script>

<style lang="scss" scoped>
.jira-search {
    > button {
        color: var(--tab-controls-icon-color);
        padding: 7px;
        border-radius: 6px;

        &:hover,
        &.active {
            background: var(--tab-controls-bg-color__hover);
            color: var(--tab-controls-icon-color__hover);
        }
    }

    &--wrapper {
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

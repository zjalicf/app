<template>
    <transition name="fade" mode="out-in">
        <div v-if="documentSearchOpen" class="search-bar">
            <div class="search-bar--container no-drag">
                {{ numResults }}
                <p v-if="searchTerm !== '' && numResults > 0">
                    {{ currentIndex }} / {{ numResults }}
                </p>
                <button
                    class="search-bar--container--prev-result-button no-drag"
                    :disabled="searchTerm === ''"
                    @click="selectPrevResult"
                >
                    <ChevronUpIcon size="20" class="icon" />
                </button>
                <button
                    class="search-bar--container--next-result-button no-drag"
                    :disabled="searchTerm === ''"
                    @click="selectNextResult"
                >
                    <ChevronDownIcon size="20" class="icon" />
                </button>
                <input
                    ref="input"
                    :value="searchTerm"
                    class="no-drag"
                    type="text"
                    :placeholder="placeholder"
                    spellcheck="false"
                    autocomplete="off"
                    @input="handleInput($event)"
                    @keydown.enter="handleEnter"
                    @keydown.esc="closeDocumentSearch"
                    @blur="unfocusSearch"
                />
                <button
                    class="search-bar--container--close-button no-drag"
                    @click="closeDocumentSearch"
                >
                    <XCircleIcon size="20" class="icon" />
                </button>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from 'vue-property-decorator';
import {
    XCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@vue-hero-icons/solid';
import { TabSymbols } from '~/constants/symbols';

@Component({
    components: { XCircleIcon, ChevronDownIcon, ChevronUpIcon },
    name: 'SearchBar',
})
export default class SearchBar extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    localSearchTerm: string = '';
    placeholder: string = 'Find in document';

    $refs!: {
        input: HTMLInputElement;
    };

    @Watch('searchTerm')
    onSearchTermChange() {
        if (this.documentSearchOpen) {
            this.$nuxt.$emit(this.getEmitKey('documentSearch:termUpdated'));
        }
    }

    @Watch('documentSearchOpen')
    onSearchOpen(newValue: boolean) {
        if (newValue === true) {
            this.$nuxt.$emit(this.getEmitKey('documentSearch:searchOpen'));
        }
    }

    @Watch('searchBarFocusState')
    onFocusChange() {
        if (this.searchBarFocusState === true) {
            this.$nextTick(() => {
                this.$refs.input?.select();
                this.$refs.input?.focus({
                    preventScroll: true,
                });
            });
        }
    }

    getEmitKey(key: string) {
        if (this.tabId) return `${key}:${this.tabId}`;
        return key;
    }

    closeDocumentSearch() {
        if (this.tabId) {
            this.$emit('update:tab-data', {
                searchOpen: false,
            });
        } else {
            this.$store.dispatch('documentSearch/close');
        }
        this.$nuxt.$emit(this.getEmitKey('documentSearch:focusSelected'));
        this.$nuxt.$emit(this.getEmitKey('documentSearch:termUpdated'));
        this.unfocusSearch();
        this.$nuxt.$emit(this.getEmitKey('documentSearch:searchClose'));
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data ?? {};
    }

    unfocusSearch() {
        if (this.tabId) {
            this.$emit('update:tab-data', {
                searchFocus: false,
            });
            return;
        }
        this.$store.dispatch('documentSearch/unfocus');
    }

    get searchBarFocusState() {
        if (this.tabId) return this.tabData.searchFocus;
        return this.$store.getters['documentSearch/shouldFocus'];
    }

    get numResults() {
        if (this.tabId) return this.tabData.searchNumResults;
        return this.$store.getters['documentSearch/numResults'];
    }

    get currentIndex() {
        if (this.tabId) return this.tabData.searchCurrentIndex;
        return this.$store.getters['documentSearch/currentIndex'];
    }

    get searchTerm() {
        if (this.tabId) return this.tabData.searchTerm;
        return this.$store.getters['documentSearch/term'];
    }

    get documentSearchOpen() {
        if (this.tabId) return this.tabData.searchOpen;
        return this.$store.getters['documentSearch/open'];
    }

    handleInput(event: any) {
        if (this.tabId) {
            this.$emit('update:tab-data', {
                searchTerm: event.target.value,
            });
            return;
        }

        this.$store.dispatch(
            'documentSearch/setTerm',
            event.target.value.trim(),
        );
    }

    selectNextResult() {
        this.$nuxt.$emit(this.getEmitKey('documentSearch:nextResult'));
        this.$nextTick(() => {
            this.$refs.input?.focus({
                preventScroll: true,
            });
        });
    }

    selectPrevResult() {
        this.$nuxt.$emit(this.getEmitKey('documentSearch:prevResult'));
        this.$nextTick(() => {
            this.$refs.input?.focus({
                preventScroll: true,
            });
        });
    }

    handleEnter(event: KeyboardEvent) {
        if (event.isComposing && !this.$utils.isMobile) return;
        this.$nuxt.$emit(this.getEmitKey('documentSearch:nextResult'));
    }
}
</script>

<style scoped lang="scss">
.search-bar {
    button {
        outline: none;
        display: block;
    }

    &--container {
        border: 1px solid var(--tab-divider-color);
        border-radius: 10px;
        padding: 4px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        background: var(--editor-searchbar-bg-color);

        &--close-button,
        &--next-result-button,
        &--prev-result-button {
            outline: none;
            color: var(--editor-searchbar-button-text-color);

            &:hover {
                color: var(--editor-searchbar-button-text-color__hover);
            }
        }

        input {
            @include font12-500;
            @include inputMetaStyles;
            color: var(--editor-searchbar-text-color);
            outline: none;
            padding: 2px 5px;
            font-weight: 500;
            line-height: 20px;
        }

        p {
            white-space: nowrap;
            color: red;
            font-size: 13px;
            font-weight: 500;
            padding: 0 5px;
        }
    }
}
</style>

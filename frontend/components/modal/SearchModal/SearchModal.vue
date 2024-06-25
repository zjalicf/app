<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :styles="{
            padding: '5vh 0',
        }"
        :content-style="{
            maxWidth: '770px',
            width: '100%',
            height: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        :focus-retain="false"
        :focus-trap="true"
        transition="slide-fade"
        name="search-modal"
        v-on="$listeners"
        @opened="setFocus"
    >
        <div class="search-modal">
            <div class="search-modal__header">
                <div class="search-modal__header__close">
                    <button tabindex="-1" @click="close">
                        <InterfaceDelete1 size="12" />
                    </button>
                </div>
                <div v-if="allowQuery" class="search-modal__header__switcher">
                    <c-icon-switch
                        :value="selectedSearchType"
                        :options="searchTypeOptions"
                        @change="switchSearchType"
                    ></c-icon-switch>
                </div>
                <div v-if="!allowQuery" class="search-modal__header__title">
                    Search
                </div>
            </div>
            <FullTextSearch
                v-if="selectedSearchType === 'search'"
                ref="search"
                :query="text"
                @update="text = $event"
                @close="handleSearchClose(close)"
            />
            <AssistantSearch
                v-if="selectedSearchType === 'assistant'"
                ref="assistant"
                :query="text"
                :xray-result="xrayResult"
                @update="text = $event"
                @persist-xray-result="saveXrayResult"
                @close="handleSearchClose(close)"
            />
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import { SearchIndex } from '~/constants';
import SearchResult from '~/components/search/SearchResult.vue';
import AssistantResult from '~/components/search/AssistantResult.vue';
import FullTextSearch from '~/components/search/FullTextSearch.vue';
import AssistantSearch from '~/components/search/AssistantSearch.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import CIconSwitch from '~/components/CIconSwitch.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { SHORTCUTS_ALIASES } from '~/plugins/shortcuts-manager/keybinds';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'SearchModal',
    components: {
        AssistantSearch,
        FullTextSearch,
        CIconSwitch,
        InterfaceDelete1,
        SearchResult,
        AssistantResult,
        InterfaceSearch,
        LoadingIcon,
    },
})
export default class SearchModal extends Vue {
    @Prop({ default: '' })
    query!: string;

    @Prop({ default: 'search' })
    initialSearchType!: 'search' | 'assistant';

    $refs!: {
        [key: string]: any;
        search: FullTextSearch;
        assistant: AssistantSearch;
    };

    text: string = '';

    results: any[] = [];
    selectedIndex: number = 0;

    SearchIndex = SearchIndex;

    xrayResult: any = null;
    searchTypeOptions = [
        { id: 'search', label: 'Search' },
        { id: 'assistant', label: 'Assistant' },
    ];

    // setting initial value to null so the search is forced to mount
    // when the search is mounted, the query is set to the prop value
    selectedSearchType: 'search' | 'assistant' | null = null;
    listenerIds: string[] = [];

    get allowQuery() {
        return this.$utils.assistant.assistantEnabled;
    }

    _selectSearchType(value: 'search' | 'assistant') {
        this.selectedSearchType = value;
        this.listenerIds.forEach(id => {
            this.$nuxt.$off(`assistant-ask-emit-${id}`);
        });
        this.listenerIds = [];
    }

    @TrackEvent(TrackingType.FULL_SEARCH, {
        action: TrackingAction.SWITCH_SEARCH_TYPE,
        source: TrackingActionSource.PICKER,
    })
    switchSearchType(value: 'search' | 'assistant') {
        this._selectSearchType(value);
    }

    @TrackEvent(TrackingType.FULL_SEARCH, {
        action: TrackingAction.SWITCH_SEARCH_TYPE,
        source: TrackingActionSource.SHORTCUT,
    })
    switchSearchTypeShortcut(value: 'search' | 'assistant') {
        this._selectSearchType(value);
    }

    handleSearchClose(close?: () => void) {
        Promise.resolve().then(() => {
            this.$emit('close');
        });
        close?.();
    }

    saveXrayResult(result: any) {
        this.xrayResult = result;
    }

    registerSearchShortcuts() {
        this.$shortcutsManager.enableNamespace('modal');
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_CLOSE,
            () => this.handleSearchClose(),
        );
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_CYCLE_TAB,
            () => {
                if (!this.$utils.assistant.assistantEnabled) return;
                // TODO: this is ok unless we add more search engines
                if (this.selectedSearchType === 'search') {
                    this.switchSearchTypeShortcut('assistant');
                    return;
                }
                this.switchSearchTypeShortcut('search');
            },
        );
    }

    unregisterSearchShortcuts() {
        this.$shortcutsManager.removeShortcut(SHORTCUTS_ALIASES.SEARCH_CLOSE);
        this.$shortcutsManager.removeShortcut(
            SHORTCUTS_ALIASES.SEARCH_CYCLE_TAB,
        );
        this.$shortcutsManager.disableNamespace('modal');
    }

    setFocus() {
        if (!this.selectedSearchType || !this.$refs[this.selectedSearchType])
            return;
        this.$refs[this.selectedSearchType].setFocus();
    }

    beforeDestroy() {
        this.unregisterSearchShortcuts();
    }

    mounted() {
        this.registerSearchShortcuts();
        this.text = this.query;
        this.selectedSearchType = this.initialSearchType;
    }
}
</script>

<style lang="scss" scoped>
.search-modal {
    background: var(--search-modal-bg-color);
    border-radius: 22px;
    width: 100%;
    height: 100%;
    padding: 45px 8px 0px;
    position: relative;

    &__header {
        padding: 0px 114px 0px;

        &__close {
            position: absolute;
            right: 16px;
            top: 16px;

            button {
                background: var(--search-modal-close-bg-color);
                color: var(--search-modal-close-text-color);
                display: block;
                padding: 10px;
                border-radius: 50%;

                &:hover {
                    background: var(--search-modal-close-bg-color__hover);
                    color: var(--search-modal-close-text-color__hover);
                }
            }
        }

        &__title {
            color: var(--modal-title-text-color);
            font-weight: 700;
            font-size: 22px;
            line-height: 34px;
            padding-bottom: 12px;
        }

        &__switcher {
            margin-bottom: 16px;
        }
    }
}
</style>

<template>
    <div class="assistant-search-modal">
        <div class="assistant-search-modal--inputs">
            <div
                class="assistant-search-modal--input-wrapper"
                :class="{
                    empty: text.length <= 0,
                    'has-value': text.length > 0,
                }"
            >
                <InterfaceSearch class="icon search-icon" size="12" />
                <input
                    ref="search"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    :value="text"
                    :disabled="usageCapReached"
                    placeholder="Search with assistant"
                    @input="onSearchChange($event.target.value)"
                    @focus="onInputFocus"
                    @keydown.down.prevent.stop="focusFirstResult"
                    @keydown.up.prevent
                    @keydown.enter.prevent.stop="handleAssistantQuery"
                    @keydown.esc.stop.prevent="handleSearchClose"
                />
                <LoadingIcon
                    v-if="isAssistantRunning && !usageCapReached"
                    size="14"
                    class="loading-icon"
                />
            </div>
        </div>
        <div v-if="usageCapReached" class="assistant-search-modal--exception">
            Usage cap for today reached. You can use AI assistant features again
            tomorrow.
        </div>
        <div v-else class="assistant-search-modal--results-wrapper">
            <AssistantResult :text="assistantResult" />
            <div
                v-if="assistantResultComplete && results.length"
                class="assistant-search-modal--results-wrapper--subtitle"
            >
                Source Pages:
            </div>
            <div
                v-if="results.length"
                class="assistant-search-modal--results-wrapper--results"
            >
                <SearchResult
                    v-for="(result, index) in results"
                    :ref="`result-${index}`"
                    :key="result.id"
                    :search-index-type="result.searchIndexType"
                    :result="result"
                    :vault-id="result.vaultId"
                    :text="result.title || result.displayLabel || 'Untitled'"
                    :active="selectedIndex === index"
                    :is-active-vault="
                        result.vaultId === activeVaultId ||
                        result.vaultId === 'commands'
                    "
                    @mouseup.native.exact.left.stop="
                        handleEnterOnAssistantResult($event)
                    "
                    @mouseup.native.middle.stop.prevent="
                        handleEnterOnAssistantResult($event)
                    "
                    @mouseover.native="selectIndex(index)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { parse } from 'date-fns';
import { v4 } from 'uuid';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import { SearchIndex, TabType } from '~/constants';
import SearchResult from '~/components/search/SearchResult.vue';
import AssistantResult from '~/components/search/AssistantResult.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import CIconSwitch from '~/components/CIconSwitch.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { SHORTCUTS_ALIASES } from '~/plugins/shortcuts-manager/keybinds';
import { GithubIntegrationDataType } from '~/components/github/github';
import { translateToAcreomType } from '~/workers/assistant/chat/tools/filtering';
import { JiraIntegrationDataType } from '~/constants/jira';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    name: 'AssistantSearch',
    components: {
        CIconSwitch,
        InterfaceDelete1,
        SearchResult,
        AssistantResult,
        InterfaceSearch,
        LoadingIcon,
    },
})
export default class AssistantSearch extends Vue {
    @Prop({ default: '' })
    query!: string;

    @Prop({ default: null })
    xrayResult!: any;

    $refs!: {
        [key: string]: any;
        search: HTMLInputElement;
    };

    text: string = '';
    results: any[] = [];
    selectedIndex: number = -1;
    isStreamingContent = false;
    assistantResult: string = '';
    isAssistantRunning: boolean = false;
    listenerIds: string[] = [];
    assistantResultComplete: boolean = false;

    get usageCapReached() {
        return !this.$utils.assistant.allowUsage;
    }

    get activeVaultId() {
        return this.$store.getters['vault/active'].id;
    }

    @Watch('selectedIndex')
    handleSelectedIndexChange(value: number) {
        if (value < 0) return;
        const resultIndex = `result-${value}`;
        this.$refs[resultIndex][0]?.scroll();
    }

    @Watch('results')
    handleResultsChange(curr: any[]) {
        if (this.selectedIndex >= curr.length && curr.length > 0) {
            this.selectedIndex = curr.length - 1;
        }
    }

    onInputFocus() {
        this.selectedIndex = -1;
    }

    selectIndex(index: number) {
        this.$refs.search.blur();
        if (index === this.selectedIndex) return;
        this.selectedIndex = index;
    }

    focusFirstResult() {
        if (!this.results.length) return;
        this.$refs.search.blur();
        this.selectedIndex = 0;
    }

    focusSearch() {
        this.$refs.search.focus();
        this.selectedIndex = -1;
    }

    handleKeyDown() {
        if (this.results.length === 0) return;
        if (this.selectedIndex === this.results.length - 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex++;
        }
    }

    handleKeyUp() {
        if (this.results.length === 0) return;
        if (this.selectedIndex === 0) {
            this.focusSearch();
        } else {
            this.selectedIndex--;
        }
    }

    onSearchChange(value: any) {
        this.$emit('update', value);
        this.text = value;
    }

    @TrackEvent(TrackingType.ASSISTANT, {
        action: TrackingAction.QUERY,
        source: TrackingActionSource.NAVIGATION_SEARCH,
    })
    assistantInitialQuery() {
        this._handleQuery();
    }

    @TrackEvent(TrackingType.ASSISTANT, {
        action: TrackingAction.QUERY,
        source: TrackingActionSource.FULL_SEARCH,
    })
    handleAssistantQuery() {
        this._handleQuery();
    }

    _handleQuery() {
        if (this.isAssistantRunning || !this.text.length) {
            return;
        }
        this.isAssistantRunning = true;
        this.assistantQuery(this.text, this.activeVaultId);
    }

    assistantQuery(query: string, vaultId: string) {
        const id = v4();
        this.listenerIds.push(id);

        this.$tracking.trackEvent('assistant', {
            action: 'query',
        });
        if (!this.$utils.assistant.allowAssistantUsage) {
            this.results = [];
            this.assistantResult = 'Usage Cap reached';
            return;
        }
        this.$utils.assistant.incrementAssistantUsage();
        this.results = [];
        this.assistantResult = 'Searching...';
        this.isStreamingContent = false;
        this.$utils.assistant.askAssistant(query, this.activeVaultId, id);

        this.$nuxt.$on(`assistant-ask-emit-${id}`, (data: any) => {
            this.handleMessage(id, vaultId, data);
            if (data.type !== 'end') return;
            this.$nuxt.$off(`assistant-ask-emit-${id}`);
        });
    }

    async handleMessage(
        id: string,
        vaultId: string,
        { type, content }: { type: string; content: any },
    ) {
        if (type === 'tool') {
            if (content.toolName === 'get_relevant_content') {
                const toolsContext = JSON.parse(content.content);
                const ids = await this.$entities.assistant.getToolContext(id);
                if (ids) {
                    this.results = toolsContext.content.map(
                        (doc: any, index: number) => {
                            const type = translateToAcreomType(doc);
                            return {
                                id: ids[index],
                                title: doc.title,
                                type: doc.type,
                                searchIndexType: type,
                                vaultId,
                                isActiveVault: true,
                            };
                        },
                    );
                }
                if (this.results.length) {
                    this.assistantResult =
                        'Generating response based on relevant context...';
                }
            }
        }
        if (type === 'content') {
            if (!this.isStreamingContent) {
                this.assistantResult = '';
                this.isStreamingContent = true;
            }
            this.assistantResult += content;
        }
        if (type === 'end') {
            this.isAssistantRunning = false;
            this.assistantResultComplete = true;
            this.saveXrayResult();
        }
    }

    saveXrayResult() {
        this.$emit('persist-xray-result', {
            assistantResult: this.assistantResult,
            sourceDocuments: this.results,
            query: this.text,
        });
    }

    @TrackEvent(TrackingType.MY_DAY, {
        source: TrackingActionSource.ASSISTANT_SEARCH,
        action: TrackingAction.OPEN,
    })
    openMyDay(event: MouseEvent | null, document: any, openInNewTab: any) {
        return this.$entities.myDay.open(
            {
                event,
                data: {
                    date: parse(document.dailyDoc, 'yyyy-MM-dd', new Date()),
                },
            },
            { openInNewTab },
        );
    }

    async handleEnterOnAssistantResult(
        event: MouseEvent | null,
        openInNewTab: boolean = false,
    ) {
        if (!this.results.length) {
            await this.setFocus();
            return;
        }

        const { id, searchIndexType } = this.results[this.selectedIndex];

        const activeTabId = this.$utils.navigation.activeTabEntityId;

        if (
            searchIndexType === GithubIntegrationDataType.PR ||
            searchIndexType === GithubIntegrationDataType.ISSUE
        ) {
            this.$entities.github.openModal(
                id,
                TrackingActionSource.ASSISTANT_SEARCH,
            );
            return;
        }

        if (searchIndexType === JiraIntegrationDataType.ISSUE) {
            this.$entities.jira.openModal(
                id,
                TrackingActionSource.ASSISTANT_SEARCH,
            );
            return;
        }

        if (searchIndexType === SearchIndex.EVENT) {
            const calendarEvent = this.$store.getters['event/byId'](id);
            return this.$vfm.show({
                component: () =>
                    import('~/components/event/modal/EventModal.vue'),
                bind: {
                    event: calendarEvent,
                },
            });
        }

        if (activeTabId === id || id === null) {
            this.handleSearchClose();
            return;
        }
        const document = this.$store.getters['document/byId'](id);
        if (document === null) {
            this.handleSearchClose();
            return;
        }
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.handleSearchClose();

        if (document.dailyDoc) {
            return this.openMyDay(event, document, openInNewTab);
        }

        if (event) {
            return this.$tabs.openTabWithEvent(tab, event);
        }
        return this.$tabs.openTab(tab, null, { openInNewTab });
    }

    handleSearchClose() {
        this.assistantResultComplete = false;
        this.assistantResult = '';
        this.listenerIds.forEach(id => {
            this.isAssistantRunning = false;
            this.$nuxt.$off(`assistant-ask-emit-${id}`);
        });
        this.listenerIds = [];

        this.$emit('close');
    }

    async setFocus() {
        await this.$nextTick();
        this.$refs.search?.focus({
            preventScroll: true,
        });
    }

    registerAssistantSearchShortcuts() {
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_NEXT,
            () => this.handleKeyDown(),
        );
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_PREVIOUS,
            () => this.handleKeyUp(),
        );
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_OPEN_RESULT,
            () => this.handleEnterOnAssistantResult(null),
        );
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_OPEN_RESULT_NEW_TAB,
            () => this.handleEnterOnAssistantResult(null, true),
        );
        this.$shortcutsManager.registerShortcut(
            SHORTCUTS_ALIASES.SEARCH_CLOSE,
            () => this.handleSearchClose(),
        );
    }

    unregisterAssistantSearchShortcuts() {
        this.$shortcutsManager.removeShortcut(SHORTCUTS_ALIASES.SEARCH_NEXT);
        this.$shortcutsManager.removeShortcut(
            SHORTCUTS_ALIASES.SEARCH_PREVIOUS,
        );
        this.$shortcutsManager.removeShortcut(
            SHORTCUTS_ALIASES.SEARCH_OPEN_RESULT,
        );
        this.$shortcutsManager.removeShortcut(
            SHORTCUTS_ALIASES.SEARCH_OPEN_RESULT_NEW_TAB,
        );
        this.$shortcutsManager.removeShortcut(SHORTCUTS_ALIASES.SEARCH_CLOSE);
    }

    beforeDestroy() {
        this.unregisterAssistantSearchShortcuts();
    }

    mounted() {
        this.registerAssistantSearchShortcuts();
        this.text = this.query;
        this.$nextTick(() => {
            this.setFocus();
        });
        if (this.xrayResult) {
            this.results = this.xrayResult.sourceDocuments;
            this.assistantResult = this.xrayResult.assistantResult;
            this.text = this.xrayResult.query;
            this.assistantResultComplete = true;
            return;
        }

        if (this.text.length) {
            this.assistantInitialQuery();
        }
    }
}
</script>

<style lang="scss" scoped>
.assistant-search-modal {
    background: var(--search-modal-bg-color);
    width: 100%;
    height: calc(100% - 47px);
    border-radius: 16px;
    overflow: hidden;

    &--inputs {
        padding: 0px 114px 0px;
    }

    &--input-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 6px 6px 13px;
        background: var(--search-modal-input-bg-color);
        border: 1px solid var(--search-modal-input-border-color);
        border-radius: 8px;
        margin-bottom: 16px;

        &.has-value {
            border-radius: 8px;
        }

        .search-icon {
            margin-right: 8px;
            color: var(--search-modal-input-icon-color);
            flex-shrink: 0;
        }

        .loading-icon {
            flex-shrink: 0;
            margin-right: 8px;
        }

        input {
            @include inputMetaStyles;
            outline: none;
            font-weight: 500;
            font-size: 13px;
            line-height: 20px;
            color: var(--search-modal-input-text-color);
            display: block;
            width: 100%;

            &::placeholder {
                color: var(--search-modal-input-placeholder-color);
            }
        }
    }

    &--exception {
        @include font12-600;
        @include frostedGlassBackground;
        margin: 0 114px;
        padding: 16px;
        border-radius: 16px;
        user-select: none;
        cursor: default;
        background: var(--search-modal-assistant-exception-background);
        border: 1px solid var(--search-modal-assistant-exception-border-color);
    }

    &--results-wrapper {
        @include scrollbarLight(0px, 20px);
        padding: 0px 114px 0px;
        overflow-x: hidden;
        overflow-y: overlay;
        height: 100%;

        &--subtitle {
            @include font12-700;
            color: var(--search-modal-subtitle-color);
            margin-bottom: 8px;
            user-select: none;
        }

        &--results {
            :deep(.suggestion) {
                margin: 0;
            }
        }
    }

    &--no-results {
        @include font12-500;
        color: var(--search-modal-no-results-text-color);
        padding-top: 100px;
        text-align: center;

        &.empty {
            padding-top: 152px;
        }
    }
}
</style>

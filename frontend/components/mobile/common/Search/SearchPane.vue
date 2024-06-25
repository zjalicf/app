<template>
    <div
        ref="searchPane"
        class="search"
        :style="{ '--keyboard-height': `${keyboardHeight}px` }"
    >
        <div
            class="input-backdrop"
            :class="{ scrolled: $refs.searchPane?.scrollTop > 0 }"
        >
            <div class="input-wrapper">
                <div class="icon-wrapper">
                    <SearchIcon class="icon" size="16" />
                </div>
                <input
                    ref="search"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    :value="text"
                    placeholder="Search acreom"
                    @input="onSearchChange($event.target.value)"
                />
            </div>
        </div>
        <div class="results-wrapper">
            <div v-if="results.length" class="results-wrapper--results">
                <div
                    v-if="activeVaultResults.length > 0"
                    class="results-wrapper--results--container"
                >
                    <div class="results-wrapper--results--container--title">
                        {{ vaultName }}
                    </div>
                    <div class="results-wrapper--results--container--list">
                        <MobileSearchResult
                            v-for="(result, index) in activeVaultResults"
                            :ref="`result-${index}`"
                            :key="`${result.type}-${result.id}`"
                            :type="result.type"
                            :text="result.title || 'Untitled'"
                            :vault-id="result.vaultId"
                            @click.native="handleEnter(index, 'active')"
                        />
                    </div>

                    <div
                        v-if="otherVaultResults.length > 0"
                        class="results-wrapper--results--container"
                    >
                        <div class="results-wrapper--results--container--title">
                            In other vaults
                        </div>
                        <div class="results-wrapper--results--container--list">
                            <MobileSearchResult
                                v-for="(result, index) in otherVaultResults"
                                :ref="`result-${
                                    index + activeVaultResults.length
                                }`"
                                :key="`${result.type}-${result.id}`"
                                :type="result.type"
                                :text="result.title || 'Untitled'"
                                :vault-id="result.vaultId"
                                @mousedown.prevent.native="
                                    handleEnter(index, 'other')
                                "
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { SearchCircleIcon, SearchIcon } from '@vue-hero-icons/solid';
import debounce from 'lodash/debounce';
import { parse } from 'date-fns';
import MobileSearchResult from '~/components/mobile/common/Search/MobileSearchResult.vue';
import CButton from '@/components/CButton.vue';
import { IDocument } from '~/components/document/model';
import { SearchIndex, SearchServiceAction, ServiceKey } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'SearchPane',
    components: {
        CButton,
        SearchIcon,
        MobileSearchResult,
        SearchCircleIcon,
    },
})
export default class SearchPane extends Vue {
    $refs!: {
        [key: string]: any;
        searchPane: HTMLDivElement;
    };

    searchOpen: boolean = false;
    results: any[] = [];
    text: string = '';
    searchResult: any = {};

    get vaultName() {
        const vault = this.$store.getters['vault/active'];
        const { name } = this.$store.getters['vault/byId'](vault.id);

        return (name || 'Untitled').toUpperCase();
    }

    get activeVaultResults() {
        return (
            this.results.filter(
                ({ vaultId }) =>
                    vaultId === this.$store.getters['vault/active'].id,
            ) ?? []
        );
    }

    get otherVaultResults() {
        return (
            this.results.filter(
                ({ vaultId }) =>
                    vaultId !== this.$store.getters['vault/active'].id,
            ) ?? []
        );
    }

    get keyboardHeight() {
        const keyboardOpen = this.$utils.mobile.keyboardOpen;

        if (!keyboardOpen || this.$config.os === 'android') return 0;
        return this.$store.getters['mobile/keyboardHeight'];
    }

    @Watch('searchOpen')
    handleSearchOpen() {
        this.$serviceRegistry
            .invoke<{ documents: IDocument[] }>(
                ServiceKey.SEARCH,
                SearchServiceAction.GET_INTERACTIONS,
                {
                    vaultId: this.$store.getters['vault/active']?.id,
                    callerContext: 'SearchPane.vue handleSearchOpen',
                },
            )
            .then(searchResult => {
                if (!searchResult) {
                    this.results = [];
                    return;
                }
                const results = searchResult.documents?.map((doc: any) => {
                    return {
                        ...doc,
                        type: 'document',
                    };
                }) as IDocument[];
                this.results = [
                    ...results.filter(
                        ({ vaultId }) =>
                            vaultId === this.$store.getters['vault/active'].id,
                    ),
                    ...results.filter(
                        ({ vaultId }) =>
                            vaultId !== this.$store.getters['vault/active'].id,
                    ),
                ];
            });
    }

    async handleEnter(index: number, type: string) {
        if (!this.results.length) return;
        const { id, dailyDoc, vaultId } =
            type === 'active'
                ? this.activeVaultResults[index]
                : this.otherVaultResults[index];

        if (vaultId !== this.$store.getters['vault/active'].id) {
            await this.$store.dispatch('vault/activate', vaultId);
        }

        await this.$utils.mobile.closeKeyboard();
        await this.$pane.hide();

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE_NAVIGATION_SEARCH,
        });

        if (dailyDoc) {
            this.$store.commit(
                'dailyDoc/set',
                parse(dailyDoc, 'yyyy-MM-dd', new Date()),
            );
            this.$router.push(`/mobile?level=0`);
            return;
        }

        this.$router.push(`/mobile/documents/${id}?level=1`);
    }

    setFocus() {
        if (!this.$refs.search) return;
        this.$nextTick(() => {
            this.$refs.search.focus({
                preventScroll: true,
            });
        });
    }

    debouncedQuery!: Function;

    mounted() {
        this.searchOpen = true;
        setTimeout(() => {
            this.setFocus();
        }, 400);

        this.debouncedQuery = debounce(this.query, 60, {
            leading: true,
            maxWait: 100,
            trailing: true,
        });

        this.onSearchChange('');
    }

    query() {
        const activeVault = this.$store.getters['vault/active'];

        if (!activeVault) return [];

        if (this.text.length === 0)
            return this.$serviceRegistry.invoke(
                ServiceKey.SEARCH,
                SearchServiceAction.GET_INTERACTIONS,
                {
                    vaultId: activeVault.id,
                    callerContext: 'SearchPane.vue get_interactions',
                },
            );

        return this.$serviceRegistry.invoke(
            ServiceKey.SEARCH,
            SearchServiceAction.QUERY,
            {
                query: this.text,
                options: {
                    activeVault,
                    thisVaultOnly: true,
                    limit: 100,
                    excludeTypes: [
                        SearchIndex.COMMANDS,
                        SearchIndex.SETTINGS,
                        SearchIndex.VIEW,
                        SearchIndex.MY_DAY,
                        SearchIndex.PROJECT,
                    ],
                },
                callerContext: 'SearchPane.vue query',
            },
        );
    }

    async onSearchChange(value: any) {
        this.text = value;
        const searchResult = await this.debouncedQuery();
        if (!searchResult) return;

        const results = searchResult.documents?.map((doc: any) => {
            return {
                ...doc,
                type: 'document',
            };
        });

        this.results = [
            ...results.filter(
                ({
                    vaultId,
                    searchIndexType,
                    inactive,
                }: IDocument & {
                    searchIndexType: SearchIndex;
                    inactive: boolean;
                }) =>
                    vaultId === this.$store.getters['vault/active'].id &&
                    searchIndexType === SearchIndex.DOCUMENT &&
                    !inactive,
            ),
        ];
    }
}
</script>

<style lang="scss" scoped>
.save-search {
    max-height: 19px;
}

.search {
    overflow: auto;
    height: calc(85vh - var(--keyboard-height));

    .other-results--title {
        margin-top: 10px;
    }

    .results-wrapper {
        padding: 0 16px 16px;
        overflow-y: auto;

        &--results {
            overflow: hidden;
            user-select: none;

            &--container {
                &--title {
                    @include ellipsis;
                    cursor: default;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 17px;
                    letter-spacing: -0.24px;
                    color: var(--mobile-pane-search-result-text-color);
                    margin-top: 18px;
                }

                &--list {
                    overflow-x: hidden;
                    border-radius: 12px;
                    margin-top: 12px;
                }
            }
        }
    }

    .input-backdrop {
        padding: 0 16px 16px;
        margin-top: 16px;
        position: sticky;
        position: -webkit-sticky;
        top: 0;

        .input-wrapper {
            display: flex;
            padding: 14px 13px;
            background: var(--mobile-pane-option-bg-color);
            border-radius: 9px;
            -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
            backdrop-filter: blur(12px); /* Chrome and Opera */

            .icon-wrapper {
                color: var(--mobile-pane-option-icon-color);
                display: flex;
                align-items: center;
                margin-right: 10px;
            }

            input {
                @include inputMetaStyles;
                outline: none;
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                letter-spacing: -0.24px;
                color: var(--mobile-pane-search-input-text-color);
                display: block;
                width: 100%;

                &::placeholder {
                    color: var(--mobile-pane-search-input-placeholder-color);
                }
            }
        }
    }
}
</style>

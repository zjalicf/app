<template>
    <div ref="result" class="suggestion" :class="{ active }">
        <div
            class="suggestion-wrapper"
            :class="{
                'continue-search': searchIndexType === SearchIndex.SEARCH,
            }"
        >
            <div class="vault-result--title">
                <div class="icon-wrapper">
                    <component
                        :is="resultIcon"
                        :id="result.id"
                        class="icon"
                        size="14"
                        :icon="result.icon"
                        :document="result"
                        v-bind="{
                            entity: result,
                            entityId: result.id,
                        }"
                    />
                </div>
                <p
                    class="vault-result--title--text"
                    :class="{
                        'assistant-answer':
                            searchIndexType === SearchIndex.ASSISTANT_ANSWER,
                    }"
                >
                    <span v-if="prefix">{{ prefix }}</span>
                    <span
                        class="vault-result--title--name-wrapper"
                        :class="{
                            'assistant-answer':
                                searchIndexType ===
                                SearchIndex.ASSISTANT_ANSWER,
                        }"
                    >
                        <span
                            v-for="(part, index) of highlightedTitle"
                            :key="`${index}-${Math.random()}`"
                            :class="{ highlight: part.highlight }"
                            >{{ part.text }}</span
                        >
                        <span v-if="!highlightedTitle.length">
                            {{ text }}
                        </span>
                    </span>
                    <span class="vault-result--title--date-wrapper">
                        <span
                            v-for="(part, index) of highlightedDate"
                            :key="`${index}-${Math.random()}`"
                            class="vault-result--title--date"
                            :class="{ highlight: part.highlight }"
                            >{{ part.text }}</span
                        >
                        <span
                            v-if="!highlightedDate.length && result.start"
                            class="vault-result--title--date"
                            >{{ dateString }}</span
                        >
                    </span>
                    <span class="vault-result--title--labels-wrapper">
                        <span
                            v-for="(part, index) of highlightedLabels"
                            :key="`${index}-${Math.random()}`"
                            class="vault-result--title--labels"
                            :class="{ highlight: part.highlight }"
                            >{{ part.text }}</span
                        >
                        <span
                            v-if="!highlightedLabels.length && result.labels"
                            class="vault-result--title--labels"
                            >{{ result.labels.join(' ') }}</span
                        >
                    </span>
                    <span v-if="!isActiveVault" class="vault-result--vault">
                        <span class="vault-result--vault--dot"></span>
                        <span class="vault-result--vault--name">
                            {{ vault.name.toUpperCase() }}
                        </span>
                    </span>
                    <span
                        v-if="breadcrumbs"
                        class="vault-result--title__breadcrumbs"
                    >
                        {{ breadcrumbs }}
                    </span>
                </p>
            </div>
            <div v-if="result.keybind" class="vault-result--keybind">
                <TooltipKeys :keybind="result.keybind" />
            </div>
        </div>
        <p
            v-if="
                result.highlights &&
                result.highlights.content &&
                result.highlights.content.length
            "
            class="result-content"
        >
            <span
                v-for="(part, index) of result.highlights.content"
                :key="`${index}-${Math.random()}`"
                :class="{ highlight: part.highlight }"
                >{{ part.text }}</span
            >
        </p>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import JiraIcon from '../icons/JiraIcon.vue';
import { formatRelativeToDate } from '~/helpers';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceFileAddAlt from '~/components/streamline/InterfaceFileAddAlt.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceArrowsRightCircle2 from '~/components/streamline/InterfaceArrowsRightCircle2.vue';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import InterfaceEditSwatch from '~/components/streamline/InterfaceEditSwatch.vue';
import { SearchIndex } from '~/constants';
import ComputerDesktopFavoriteStar from '~/components/streamline/ComputerDesktopFavoriteStar.vue';
import InterfaceLightingLightBulbOn from '~/components/streamline/InterfaceLightingLightBulbOn.vue';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';
import PageStatusComponent from '~/components/entities/page/PageStatusComponent.vue';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import ViewIcon from '~/components/view/ViewIcon.vue';
import ProjectIcon from '~/components/project/ProjectIcon.vue';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    computed: {
        SearchIndex() {
            return SearchIndex;
        },
    },
    components: {
        PageStatusComponent,
        TooltipKeys,
    },
})
export default class SearchResult extends Vue {
    $refs!: {
        result: HTMLElement;
    };

    @Prop({ default: SearchIndex.DOCUMENT })
    searchIndexType!: string;

    @Prop({ default: '' })
    text!: string;

    @Prop({ default: null })
    prefix!: string | null;

    @Prop({ default: false })
    active!: boolean;

    @Prop({ default: '' })
    labels!: string;

    @Prop({ default: '' })
    date!: any;

    @Prop({ default: '' })
    vaultId!: string;

    @Prop({ default: false })
    isActiveVault!: boolean;

    @Prop({ default: () => [] })
    highlight!: any[];

    @Prop({ default: null })
    keybind!: string | null;

    @Prop({ default: null })
    result!: any;

    get vault() {
        return this.$store.getters['vault/byId'](this.vaultId) || { name: '' };
    }

    get dateString() {
        const now = new Date();
        return formatRelativeToDate(
            this.result,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    get breadcrumbs() {
        if (!this.result.id || this.result.dailyDoc) return null;
        return (
            this.$store.getters['document/breadcrumbsById'](this.result.id) ??
            null
        );
    }

    get resultIcon(): any {
        switch (this.searchIndexType) {
            case SearchIndex.OPEN_SEARCH:
                return InterfaceSearch;
            case SearchIndex.TEMPLATE:
                return InterfaceEditSwatch;
            case SearchIndex.DOCUMENT:
                return DocumentIcon;
            case SearchIndex.VIEW:
                return ViewIcon;
            case SearchIndex.COMMANDS:
            case 'command':
                return this.commandIcon;
            case SearchIndex.SETTINGS:
                return InterfaceSettingCog;
            case SearchIndex.MY_DAY:
                return InterfaceFavoriteStar;
            case SearchIndex.NEW_DOCUMENT:
                return InterfaceFileAddAlt;
            case SearchIndex.ASSISTANT_QUERY:
                return InterfaceLightingLightBulbOn;
            case SearchIndex.ASSISTANT_ANSWER:
                return ComputerDesktopFavoriteStar;
            case SearchIndex.INTEGRATION_DATA:
                if (this.result.id.startsWith('github')) {
                    return GithubEntityIcon;
                }
                if (this.result.id.startsWith('jira')) {
                    return IssueType;
                }
                if (this.result.id.startsWith('linear')) {
                    return LinearStateIcon;
                }
                break;
            case SearchIndex.PROJECT:
                return ProjectIcon;
            default:
                return DocumentIcon;
        }
    }

    get commandIcon() {
        if (this.result.id.toLowerCase().startsWith('new')) {
            return InterfaceAdd1;
        }
        switch (this.result.id) {
            case this.$shortcutsManager.availableShortcuts.NEW_DOCUMENT:
                return InterfaceFileAddAlt;
            default:
                return InterfaceArrowsRightCircle2;
        }
    }

    get highlightedTitle() {
        return this.result.highlights?.title || [];
    }

    get highlightedDate() {
        return this.result.highlights?.date || [];
    }

    get highlightedLabels() {
        return this.result.highlights?.labels || [];
    }

    scroll() {
        this.$refs.result?.scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
        });
    }
}
</script>
<style scoped lang="scss">
@mixin highlight {
    //color: var(--search-result-highlight-text-color);
    padding: 1px 0;
    border-radius: 2px;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;
    font-weight: 700;
    //background-color: var(--search-result-content-highlight-bg-color);
}

.vault-result__meta {
    @include font11-500;
    padding-left: 30px;
}

.suggestion {
    margin: 2px 3px 0px;
    border: 2px solid rgba(0, 0, 0, 0);
    border-radius: 6px;
    cursor: default;

    &.active {
        margin: 2px 3px 0px;
        border: 2px solid var(--accent-color);
        background: var(--search-result-highlight-bg-color__active);

        .icon {
            color: var(--search-result-content-icon-color__active);
        }
    }

    &:hover:not(.active) {
        background: var(--search-result-highlight-bg-color__hover);
    }

    .result-content {
        @include ellipsis;
        color: var(--search-result-content-text-color);
        font-size: 13px;
        line-height: 18px;
        padding-left: 30px;
        padding-bottom: 5px;

        span {
            &.highlight {
                @include highlight;
            }
        }
    }

    //.continue-search {
    .icon {
        color: var(--search-result-content-icon-color);
    }

    //}

    .suggestion-wrapper {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .vault-result {
            &--title {
                @include font12-500;
                display: flex;
                align-items: center;
                width: 100%;

                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    padding: 7px 0px 7px 8px;
                    align-self: flex-start;
                }

                &--text {
                    &:not(.assistant-answer) {
                        white-space: nowrap;
                    }

                    cursor: default;
                    padding: 4px 4px 4px 8px;
                    color: var(--search-result-text-color);
                    display: flex;
                    align-items: center;
                    width: calc(100% - 22px);

                    span {
                        &.highlight {
                            @include highlight;
                        }
                    }
                }

                &--name-wrapper {
                    &:not(.assistant-answer) {
                        @include ellipsis;
                    }
                }

                &--date {
                    &-wrapper {
                        margin-left: 4px;
                    }

                    cursor: default;
                    color: var(--accent-color);
                    white-space: nowrap;
                }

                &--labels {
                    &-wrapper {
                        margin-left: 4px;
                    }

                    @include ellipsis;
                    cursor: default;
                    color: var(--accent-color);
                    white-space: nowrap;
                }

                &__breadcrumbs {
                    color: var(--search-result-content-vault-breadcrumbs-color);
                    margin-left: 4px;
                }

                &__page-status {
                    pointer-events: none;
                }
            }

            &--vault {
                white-space: nowrap;
                display: flex;
                align-items: center;

                &--dot {
                    background-color: var(
                        --search-result-content-vault-text-color
                    );
                    width: 4px;
                    height: 4px;
                    border-radius: 2px;
                    margin-right: 8px;
                    margin-left: 4px;
                    min-width: 4px;
                }

                &--name {
                    font-weight: 600;
                    color: var(--search-result-content-vault-text-color);
                    font-size: 11px;
                    line-height: 1.552;
                    padding-right: 4px;
                }
            }

            &--keybind {
                width: 100%;
                display: flex;
                justify-content: flex-end;
                gap: 4px;
                margin-right: 6px;
            }
        }
    }
}
</style>

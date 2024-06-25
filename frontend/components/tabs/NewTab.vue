<template>
    <div
        class="new-tab page"
        :class="{ 'single-tab': isSingleTab }"
        @mousedown="$emit('focus-tab')"
    >
        <div class="new-tab--basic-options">
            <button @click="addPage">
                <span>New Page</span>
                <div class="new-tab--basic-options--tooltip">
                    <TooltipKeys
                        :keybind="
                            $shortcutsManager.keybinds[
                                $shortcutsManager.availableShortcuts
                                    .NEW_DOCUMENT
                            ].keybind
                        "
                    />
                </div>
            </button>
        </div>
        <div class="new-tab--recent">
            <span class="new-tab--recent--section-title"
                >recently updated pages</span
            >
            <button
                v-for="result in results"
                :key="result.id"
                class="new-tab--recent--result"
                :class="{ active: highlightResult === result.id }"
                @click="openPage(result.id)"
                @contextmenu.prevent.stop="handleContextMenu(result.id, $event)"
            >
                <DocumentIcon
                    :document="result"
                    class="new-tab--recent--result--icon"
                />
                <span class="new-tab--recent--result--title">{{
                    titleForResult(result)
                }}</span>
                <span class="new-tab--recent--result--update">{{
                    lastUpdated(result)
                }}</span>
            </button>
            <button class="new-tab--recent--navigation" @click="allPages">
                Show all Pages
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import SearchComponent from '~/components/search/SearchComponent.vue';
import { TabType, ViewType } from '~/constants';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import { IDocument } from '~/components/document/model';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import { localizedRelativeFormat } from '~/helpers/date';
import TabMixin from '~/components/tabs/TabMixin.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    name: 'NewTab',
    components: { DocumentIcon, TooltipKeys, SearchComponent },
})
export default class NewTab extends TabMixin<any> {
    $refs!: {
        templatesDropdown: HTMLButtonElement;
    };

    recent: IDocument[] = [];
    highlightResult: string | null = null;

    get results() {
        return this.$entities.page
            .list()
            .filter(
                (doc: IDocument) =>
                    !!doc.id && !doc.archived && !doc.template && !doc.dailyDoc,
            )
            .sort((a: IDocument, b: IDocument) => {
                const aNum = new Date(a.updatedAt).getTime();
                const bNum = new Date(b.updatedAt).getTime();
                return bNum - aNum;
            })
            .slice(0, 10);
    }

    get isSingleTab() {
        return this.$store.getters['tabs/singleTabOpen'];
    }

    handleContextMenu(id: string, e: MouseEvent) {
        this.highlightResult = id;
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.$contextMenu.show(e, {
            component: () =>
                import('@/components/context-menu/NewTabContextMenu.vue'),
            bind: {
                id,
                tab,
                invokeFrom: 'sidebar',
                source: TrackingActionSource.NEW_TAB,
            },
            onClose: () => {
                this.highlightResult = null;
            },
        });
    }

    async addPage() {
        const id = await this.$utils.page.newPage();
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.$tabs.openTab(tab);

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.NEW_TAB,
            entityId: id,
        });
    }

    @TrackEvent(TrackingType.NEW_TAB, {
        action: TrackingAction.SHOW_ALL_PAGES,
    })
    allPages() {
        const allPagesView = this.$entities.view.getViewByType(
            ViewType.ALL_PAGES,
        );
        const tab = this.$tabs.createNewTabObject(
            allPagesView.id,
            TabType.VIEW,
        );
        this.$tabs.openTab(tab);
    }

    @TrackEvent(TrackingType.PAGE, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.NEW_TAB,
    })
    openPage(id: string) {
        const tab = this.$tabs.createNewTabObject(id, TabType.DOCUMENT);
        this.$tabs.openTab(tab);
    }

    lastUpdated(document: IDocument) {
        return localizedRelativeFormat(
            new Date(document.updatedAt),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        );
    }

    titleForResult(result: IDocument) {
        return result.title?.length > 0 ? result.title : 'Untitled';
    }
}
</script>
<style scoped lang="scss">
.new-tab {
    @include scrollbar(36px, 9px);
    height: $desktopContentHeight;
    padding-top: 60px;
    user-select: none;
    overflow-y: auto;

    &--basic-options {
        margin: 0 auto;
        max-width: 450px;
        display: flex;
        align-items: center;
        gap: 21px;

        button {
            @include frostedGlassBackground;
            @include font12-600;
            padding: 18px 21px 18px 21px;
            background: var(--new-tab-button-bg-color);
            border-radius: 20px;
            width: 100%;
            color: var(--new-tab-button-text-color);

            display: flex;
            align-items: center;
            justify-content: space-between;

            &:hover {
                color: var(--new-tab-button-text-color__hover);
                background: var(--new-tab-button-bg-color__hover);
            }
        }
    }

    &--recent {
        margin: 21px auto 0;
        max-width: 450px;

        &--section-title {
            text-transform: uppercase;
            font-weight: 600;
            font-size: 11px;
            line-height: 155.2%;
            letter-spacing: 0.03em;
            color: var(--new-tab-title-color);
            user-select: none;
            margin-bottom: 21px;
            padding-left: 11px;
        }

        &--result {
            padding: 8px 13px 6px 11px;
            width: 100%;
            display: grid;
            grid-template-columns: 28px 1fr 0.5fr;
            align-items: center;
            justify-items: start;
            border-radius: 6px;

            &:first-of-type {
                margin-top: 8px;
            }

            &:hover,
            &.active {
                background: var(--new-tab-result-bg-color__hover);

                .new-tab--recent--result--icon,
                .new-tab--recent--result--title {
                    color: var(--new-tab-result-title-color__hover);
                }
            }

            &--title {
                @include font12-400;
                @include ellipsis;
                color: var(--new-tab-result-title-color);
                width: 100%;
                text-align: left;
                padding-right: 4px;
            }

            &--update {
                @include font12-400;
                @include ellipsis;
                color: var(--new-tab-result-date-color);
                text-transform: capitalize;
                width: 100%;
                text-align: right;
            }
        }

        &--navigation {
            @include font12-500;
            margin: 20px auto;
            width: 100%;
            color: var(--new-tab-result-navigation-color);
            text-align: left;
            padding-left: 11px;
        }
    }
}
</style>

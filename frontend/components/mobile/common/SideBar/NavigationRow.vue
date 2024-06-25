<template>
    <div
        class="navigation-row"
        :class="{
            expandable:
                item.type !== 'search' &&
                hasChildren &&
                item.type !== 'document',
            expanded: isExpanded,
        }"
    >
        <div class="navigation-row--item">
            <button
                v-longpress="onContextMenu"
                tabindex="-1"
                class="navigation-row--item--link"
                @click="navigate"
            >
                <div
                    class="navigation-row--item--link--icon"
                    :style="{ 'padding-left': `${16 + 8 * level}px` }"
                >
                    <div v-if="item.icon">
                        <component
                            :is="item.icon"
                            v-if="item.icon.name"
                            class="icon"
                            size="16"
                        />
                        <div v-else class="custom-icon icon">
                            <span>{{ item.icon }}</span>
                        </div>
                    </div>
                    <InterfaceContentFileAlternate
                        v-else-if="item.type === 'document'"
                        class="icon"
                        size="16"
                    />
                    <InterfaceFolder v-else class="icon" size="16" />
                </div>
                <div class="navigation-row--item--link--name">
                    <p v-if="item.name">
                        {{ item.name }}
                    </p>
                    <p v-else-if="item.title">
                        {{ item.title }}
                    </p>
                    <p v-else class="untitled">
                        {{
                            item.type === 'folder' ? 'New Folder' : 'New Search'
                        }}
                    </p>
                </div>
            </button>
            <span class="navigation-row--doc-count">
                {{ docsNumber ?? '' }}</span
            >
            <button
                v-if="hasChildren && item.type !== 'document'"
                class="navigation-row--item--button"
                tabindex="-1"
                @click="handleToggleClick"
            >
                <span
                    class="navigation-row--item--button--inner-wrapper expand"
                >
                    <AcreomChevronRight
                        v-if="!isExpanded"
                        size="12"
                        class="icon"
                    />
                    <AcreomChevronDown v-else size="12" class="icon" />
                </span>
            </button>
            <NuxtLink
                v-else-if="item.type !== 'document'"
                :to="link"
                tabindex="-1"
                class="navigation-row--item--button"
            >
                <span class="navigation-row--item--button--inner-wrapper">
                    <AcreomChevronRight size="12" class="icon" />
                </span>
            </NuxtLink>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    CogIcon,
    FolderIcon,
    SearchCircleIcon,
} from '@vue-hero-icons/solid';
import { AcreomChevronDown, AcreomChevronRight } from '~/components/icons';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import TaskListProgress from '~/components/task/TaskListProgress.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import { isDocument, isSearch } from '~/helpers/util';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';
import PageDropdown from '~/components/mobile/common/dropdown/PageDropdown.vue';
import FolderDropdown from '~/components/mobile/common/dropdown/FolderDropdown.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'NavigationRow',
    methods: { isDocument, isSearch },
    components: {
        InterfaceFolder,
        InterfaceContentFileAlternate,
        InterfaceSearch,
        AcreomChevronRight,
        AcreomChevronDown,
        ChevronRightIcon,
        ChevronDownIcon,
        FolderIcon,
        SearchCircleIcon,
        CogIcon,
        TaskListProgress,
    },
})
export default class NavigationRow extends Vue {
    @Prop({ default: {} })
    item!: any;

    @Prop({
        default: false,
    })
    hasChildren!: boolean;

    @Prop({
        default: true,
    })
    isExpanded!: boolean;

    @Prop({
        required: true,
    })
    level!: number;

    @Prop({ default: null })
    docsNumber!: number | null;

    navigate() {
        this.$router.push(this.link);
        const toPage = this.link.split('/')[2];
        const trackingType =
            toPage === 'documents'
                ? TrackingType.PAGE
                : toPage === 'folder'
                ? TrackingType.FOLDER
                : null;
        if (!trackingType) return;
        this.$tracking.trackEventV2(trackingType, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE_SIDEBAR,
        });
    }

    get link() {
        if (this.item.type === 'document') {
            return `/mobile/documents/${this.item.id}?level=${this.level + 1}`;
        }

        return this.item.id === 'all_documents'
            ? `/mobile/documents?level=${this.level + 1}`
            : this.item.type === 'setting'
            ? `/mobile/preferences/${this.item.id}?level=2`
            : `/mobile/folder/${this.item.id}?level=${this.level + 1}`;
    }

    handleToggleClick() {
        this.$emit('collapse-toggle', this.item.id, !this.isExpanded);
    }

    onContextMenu() {
        if (this.item.id === 'all_documents') return;
        if (this.item.type === 'document') {
            this.$pane.show({
                component: PageDropdown,
                bind: {
                    document: this.item,
                },
                type: 'dropdown',
            });
            return;
        }
        if (this.item.type === 'folder') {
            this.$pane.show({
                component: FolderDropdown,
                bind: {
                    folder: this.item,
                },
                type: 'dropdown',
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.navigation-row {
    @include animateBackgroundColor;
    user-select: none;

    &:active {
        background: $blueGrey800;
    }

    &--item {
        display: flex;
        align-items: center;
        width: 100%;
        border-top: 1px solid var(--tab-divider-color);

        .first & {
            border-top: 1px solid rgba(0, 0, 0, 0);
        }

        &--button {
            padding: 13px 11px 12px;
            outline: none;
            display: block;

            &:focus {
                outline: none;
            }

            &--inner-wrapper {
                padding: 7px;
                border-radius: 50%;
                display: block;
                color: $blueGrey500;

                &.expand {
                    background: $blueGrey800;
                    color: $white;
                }
            }
        }

        &--link {
            display: flex;
            align-items: center;
            width: 100%;
            outline: none;

            &--icon {
                color: $blueGrey300;
                padding: 16px 16px 17px;
                margin-bottom: -1px;

                .custom-icon {
                    width: 16px;
                    height: 16px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    span {
                        font-size: 16px;
                        line-height: 16px;
                        font-family: 'Apple Color Emoji', 'Segoe UI Emoji',
                            NotoColorEmoji, 'Noto Color Emoji',
                            'Segoe UI Symbol', 'Android Emoji', EmojiSymbols,
                            serif;
                    }
                }
            }

            &--name {
                @include font14-500;
                font-weight: 400;
                font-size: 16px;
                line-height: 20px;
                letter-spacing: -0.24px;
                padding: 16px 4px 15px 0;
                color: $white;
                width: 100%;
                text-align: left;
                overflow-x: hidden;

                p {
                    @include ellipsis;
                }
            }
        }
    }

    &--doc-count {
        @include font14-500;
        color: $blueGrey300;
        padding: 15px 0 14px;
    }
}
</style>

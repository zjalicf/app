<template>
    <div
        class="item"
        :class="[
            isFolder ? 'item__folder' : 'item__document',
            isDraggingOver ? 'item__dragging-over' : null,
            isDragging ? 'item__dragging' : null,
            isSelected ? 'item__selected' : null,
            isContextMenu ? 'highlight' : null,
            isOptionsMenu ? 'item__options-menu' : null,
        ]"
        @contextmenu.prevent.stop="onContextmenuHandler"
    >
        <div
            v-if="isFolder"
            ref="folder"
            :data-e2e="`folder-${name || 'Untitled'}`"
            class="item__content"
            @click.stop.prevent="handleFolderClick"
            @mouseup="handleDropInside"
            @mousedown.left.stop="handleMouseDown"
            @mouseenter.stop="handleMouseEnter"
            @mouseleave.stop="handleMouseLeave"
        >
            <div class="item__content__chevron">
                <InterfaceGeometricTriangle
                    v-if="isExpanded"
                    class="item__content__chevron__icon"
                    size="6"
                    style="transform: rotate(180deg)"
                />
                <InterfaceGeometricTriangle
                    v-else
                    class="item__content__chevron__icon"
                    size="6"
                    style="transform: rotate(90deg)"
                />
            </div>
            <div v-if="icon" class="item__content__custom-icon">
                <span>{{ icon }}</span>
            </div>
            <div v-else class="item__content__icon">
                <InterfaceFolder class="icon" size="14" />
            </div>
            <div class="item__content__name">
                {{ name || 'New folder' }}
            </div>
            <div
                v-if="$config.os === 'web'"
                ref="moreOptions"
                class="item__content__more"
                @click.stop.prevent="openOptions"
            >
                <InterfaceSettingMenuHorizontal size="12" />
            </div>
        </div>
        <div
            v-else
            ref="document"
            class="item__content"
            :data-e2e="`page-${name || 'Untitled'}`"
            @mousedown.exact.left.stop="handleMouseDown"
            @click.stop.prevent="handleDocumentClick($event)"
            @mouseup.middle.stop.prevent="handleDocumentClick($event)"
        >
            <DocumentIcon
                v-if="document"
                class="item__content__custom-icon"
                :document="document"
                :size="14"
                :font-size="12"
            />
            <div v-else class="item__content__icon">
                <InterfaceContentFileAlternate class="icon" size="14" />
            </div>
            <div class="item__content__name">
                {{ name || 'Untitled' }}
            </div>
            <div
                v-if="$config.os === 'web'"
                ref="moreOptions"
                class="item__content__more"
                @mousedown.left.stop
                @click.prevent.stop="openOptions"
            >
                <InterfaceSettingMenuHorizontal size="12" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { animate } from 'motion';
import scrollIntoView from 'scroll-into-view';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';
import {
    DocumentContextMenu,
    FolderContextMenu,
} from '~/components/context-menu';
import { TabType } from '~/constants';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import { ThemeOptions } from '~/helpers/date';
import PageStatusComponent from '~/components/entities/page/PageStatusComponent.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

let animation: any = null;
let scroll: any = null;

@Component({
    name: 'TreeItem',
    components: {
        PageStatusComponent,
        DocumentIcon,
        InterfaceSettingMenuHorizontal,
        InterfaceContentFileAlternate,
        InterfaceFolder,
        InterfaceGeometricTriangle,
        JiraIcon,
    },
})
export default class TreeItem extends Vue {
    @Prop({ default: null })
    id!: string;

    @Prop({ default: null })
    clip!: { type: string; key: string; id: string };

    @Prop({ default: null })
    name!: string | null;

    @Prop({ default: null })
    order!: number;

    @Prop({ default: null })
    status!: string | null;

    @Prop({ default: null })
    parentId!: string;

    @Prop({ default: true })
    isDragging!: boolean;

    @Prop({ default: false })
    isExpanded!: boolean;

    @Prop({ default: true })
    isFolder!: boolean;

    @Prop({ default: false })
    isSelected!: boolean;

    @Prop({ default: null })
    icon!: string;

    @Prop({ default: 0 })
    level!: number;

    selectedItemId: any = null;
    $refs!: {
        folder: HTMLElement;
        document: HTMLElement;
        moreOptions: HTMLElement;
    } & Record<string, TreeItem>;

    dragTimeout: any = null;
    shouldExpandFolderTimeout: any = null;
    isContextMenu: boolean = false;
    isOptionsMenu: boolean = false;

    get document() {
        return (
            this.$store.getters['document/byId'](this.id) ||
            this.$store.getters['document/byClip'](this.clip?.id)
        );
    }

    isDraggingOver: boolean = false;

    handleDropInside() {
        if (this.dragTimeout) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;
            return;
        }
        if (this.selectedItemId === this.id) {
            this.selectedItemId = null;
            return;
        }
        this.$emit('tree-item:dropinside');
    }

    handleDocumentClick(event: MouseEvent) {
        if (this.dragTimeout) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;
        }

        const sourceMeta = this.document.pinned
            ? TrackingActionSourceMeta.PIN
            : undefined;

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.SIDEBAR,
            sourceMeta,
        });

        const tab = this.$tabs.createNewTabObject(this.id, TabType.DOCUMENT);
        this.$tabs.openTabWithEvent(tab, event);
    }

    handleFolderClick() {
        if (this.dragTimeout) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;
        }
        this.toggleExpanded();
    }

    toggleExpanded() {
        this.$entities.folder.toggleExpanded(this.id, !this.isExpanded);
        const action = this.isExpanded
            ? TrackingAction.COLLAPSE
            : TrackingAction.EXPAND;
        this.$tracking.trackEventV2(TrackingType.FOLDER, {
            action,
        });
    }

    handleMouseDown(e: MouseEvent) {
        this.dragTimeout = setTimeout(() => {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;
            this.selectedItemId = this.id;
            this.$emit('tree-item:dragstart', {
                offsetX: e.offsetX,
                offsetY: e.offsetY,
                pageX: e.pageX,
                pageY: e.pageY,
            });
        }, 200);
    }

    handleMouseEnter() {
        if (this.isExpanded || !this.$store.getters['sidebar/draggedItem'])
            return;

        this.shouldExpandFolderTimeout = setTimeout(() => {
            clearTimeout(this.shouldExpandFolderTimeout);
            this.shouldExpandFolderTimeout = null;
            this.$entities.folder.toggleExpanded(this.id, true);
        }, 800);
    }

    handleMouseLeave() {
        if (this.shouldExpandFolderTimeout) {
            clearTimeout(this.shouldExpandFolderTimeout);
            this.shouldExpandFolderTimeout = null;
        }
    }

    openOptions() {
        this.isOptionsMenu = true;
        if (!this.isFolder) {
            this.$dropdown.show({
                parent: this.$refs.moreOptions,
                component: DocumentContextMenu,
                bind: {
                    id: this.id,
                    invokeFrom: 'sidebar',
                    source: TrackingActionSource.SIDEBAR,
                },
                onClose: () => {
                    this.isOptionsMenu = false;
                },
            });
        } else {
            this.$dropdown.show({
                parent: this.$refs.moreOptions,
                component: FolderContextMenu,
                bind: {
                    id: this.id,
                },
                onClose: () => {
                    this.isOptionsMenu = false;
                },
            });
        }
    }

    async onContextmenuHandler(e: MouseEvent, rename: boolean = false) {
        this.isContextMenu = true;
        if (!this.isFolder) {
            const tab = this.$tabs.createNewTabObject(
                this.id,
                TabType.DOCUMENT,
            );
            await this.$contextMenu.show(e, {
                component: DocumentContextMenu,
                bind: {
                    id: this.id,
                    tab,
                    tabId: tab.id,
                    invokeFrom: 'sidebar',
                    source: TrackingActionSource.SIDEBAR,
                },
                onClose: () => {
                    this.$nextTick(() => {
                        this.$dropdown.hideAll();
                    });
                },
            });
        } else {
            await this.$contextMenu.show(e, {
                component: FolderContextMenu,
                bind: {
                    id: this.id,
                    rename,
                },
            });
        }
        this.isContextMenu = false;
    }

    clientTop() {
        const parent = this.$refs.folder.getBoundingClientRect();

        return parent.y + 32;
    }

    focusFolder() {
        if (animation) {
            animation.cancel();
            animation = null;
        }

        if (scroll) {
            scroll();
            scroll = null;
        }

        scroll = scrollIntoView(
            this.$refs.folder,
            {
                time: 250,
            },
            (type: string) => {
                if (type !== 'complete') return;

                animation = animate(
                    this.$refs.folder,
                    {
                        background:
                            this.$store.getters['appSettings/theme'] ===
                            ThemeOptions.DARK
                                ? [
                                      null,
                                      '#262d39',
                                      'black',
                                      '#262d39',
                                      'black',
                                      'initial',
                                  ]
                                : [
                                      null,
                                      '#eceef0',
                                      '#ffffff',
                                      '#eceef0',
                                      '#ffffff',
                                      'initial',
                                  ],
                    },
                    {
                        duration: 1,
                    },
                );
            },
        );
    }

    beforeDestroy() {
        this.$nuxt.$off(`focus:folder-${this.id}`);
    }

    mounted() {
        if (!this.isFolder && ['new', 'creating'].includes(this.status!)) {
            scrollIntoView(this.$refs.document, {
                time: 250,
            });
        }

        if (this.isFolder) {
            this.$nuxt.$on(`focus:folder-${this.id}`, this.focusFolder);
        }

        if (this.isFolder && ['new', 'creating'].includes(this.status!)) {
            scrollIntoView(
                this.$refs.folder,
                {
                    time: 250,
                },
                (type: string) => {
                    if (type !== 'complete') return;
                    this.onContextmenuHandler(
                        {
                            clientX: (this.level - 1) * 26 + 16,
                            clientY: this.clientTop(),
                        } as any as MouseEvent,
                        true,
                    );
                },
            );
        }
    }
}
</script>

<style lang="scss" scoped>
.item {
    user-select: none;
    line-height: 20px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    margin-bottom: 2px;
    color: var(--sidebar-text-color);

    .sidebar-group.root:not(.is-dragging) &:hover,
    &.highlight {
        background: var(--sidebar-bg-color__hover);
        color: var(--sidebar-text-color__hover);

        .item__content__icon,
        .item__content__custom-icon,
        .item__content__chevron {
            color: var(--sidebar-icon-color__hover);
        }

        &.item__selected {
            background: var(--sidebar-bg-color__active__hover);
        }
    }

    &__options-menu {
        background: var(--sidebar-bg-color__hover);
        color: var(--sidebar-text-color__hover);

        .item__content__icon,
        .item__content__custom-icon,
        .item__content__chevron {
            color: var(--sidebar-icon-color__hover);
        }

        &.item__selected {
            background: var(--sidebar-bg-color__active__hover) !important;

            .item__content__more {
                display: block;
                color: var(--sidebar-more-options-color__active__hover);
            }
        }

        .item__content__more {
            display: block;
            color: var(--sidebar-more-options-color__active__hover);
        }
    }

    .sidebar-group.root.is-dragging
        &__folder:not(.item__dragging):hover
        .item__content {
        border: 2px solid var(--accent-color);
        padding: 2px 4px 2px calc(((var(--depth) - 1) * 26px));

        .item__content__more {
            display: none;
        }
    }

    &__selected {
        background: var(--sidebar-bg-color__active);
        color: var(--sidebar-text-color__active);

        .item__content__icon,
        .item__content__custom-icon,
        .item__content__chevron {
            color: var(--sidebar-icon-color__active);
        }

        .item__content__more {
            color: var(--sidebar-more-options-color__active);

            &:hover {
                color: var(--sidebar-more-options-color__active__hover);
            }
        }
    }

    &__dragging {
        pointer-events: none;
        opacity: 0.3;
    }

    &__folder {
    }

    &__document {
    }

    .is-dragging & {
        &:hover {
            .item__content__more {
                display: none;
            }
        }
    }

    &:hover {
        .item__content__more {
            display: block;
        }
    }

    &__content {
        display: flex;
        align-items: center;
        border-radius: 6px;

        &__more {
            color: var(--sidebar-more-options-color);
            display: none;
            padding: 4px;

            &:hover {
                color: var(--sidebar-more-options-color__hover);
            }
        }

        .item__folder & {
            padding: 4px 6px 4px calc(((var(--depth) - 1) * 26px) + 2px);
        }

        .item__document & {
            padding: 4px 6px 4px calc(((var(--depth) - 1) * 26px) + 21px);
        }

        .item__dragging-over & {
            border: 2px solid var(--accent-color);
            padding: 2px 4px 2px calc(((var(--depth) - 1) * 26px) + 19px);
        }

        &__clip {
            display: flex;
            align-items: center;
        }

        &__icon {
            pointer-events: none;
            flex-shrink: 0;
            margin-right: 10px;
            color: var(--sidebar-icon-color);
        }

        &__chevron {
            padding: 7px 3px;
            margin-right: 7px;
            flex-shrink: 0;
            color: var(--sidebar-chevron-color);
        }

        &__name {
            @include ellipsis;
            pointer-events: none;
            flex-direction: row;
            text-align: left;
            width: 100%;
        }

        &__status-icon {
            pointer-events: none;
        }

        &__custom-icon {
            pointer-events: none;
            margin-right: 10px;
            flex-shrink: 0;
            color: var(--sidebar-icon-color);
            width: 14px;
            height: 14px;
            position: relative;

            span {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
}
</style>

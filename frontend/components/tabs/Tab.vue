<template>
    <div
        ref="tab"
        class="tab"
        :class="{
            active,
            'group-active': groupActive,
            'context-active': contextMenuOpen,
        }"
        @click.prevent.stop="openTab"
        @mousedown.middle.prevent
        @mouseup.middle="close"
        @contextmenu.stop.prevent="openContextMenu"
        @mouseenter="hoverEnter"
        @mouseleave="hoverLeave"
    >
        <div class="tab__icon">
            <DocumentIcon
                v-if="tab.type === TabType.DOCUMENT && document"
                :document="document"
                :size="14"
                class="tab__icon__document"
            />
            <InterfaceContentFileAlternate
                v-if="tab.type === TabType.DOCUMENT && !document"
                class="icon"
            />
            <InterfaceFavoriteStar
                v-if="tab.type === TabType.MY_DAY"
                class="icon"
            />
            <InterfaceGeometricCircle
                v-if="tab.type === TabType.NEW"
                size="6"
                class="icon"
            />
            <JiraIcon
                v-if="tab.type === TabType.JIRA_APP"
                size="14"
                class="icon"
            />
            <LinearIcon
                v-if="tab.type === TabType.LINEAR_APP"
                size="14"
                class="icon"
            />
            <GithubIcon
                v-if="tab.type === TabType.GITHUB_APP"
                size="14"
                class="icon"
            />
            <ViewIcon
                v-else-if="tab.type === TabType.VIEW && tab.entityId"
                :id="tab.entityId"
            />
            <ProjectIcon
                v-else-if="tab.type === TabType.PROJECT && tab.entityId"
                :id="tab.entityId"
            />
        </div>
        <div class="tab__title">{{ title }}</div>
        <div class="tab__options">
            <button v-if="tabHovered" @click.prevent.stop="close">
                <InterfaceDelete1 size="10" />
            </button>
            <div v-else class="tab__options__placeholder"></div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import scrollIntoView from 'scroll-into-view';
import type { Tab } from '~/@types/app';
import { TabType } from '~/constants';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceGeometricCircle from '~/components/streamline/InterfaceGeometricCircle.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import ViewIcon from '~/components/view/ViewIcon.vue';
import ProjectIcon from '~/components/project/ProjectIcon.vue';
import LinearIconRound from '~/components/linear/icons/LinearIconRound.vue';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';

@Component({
    name: 'TabComponent',
    computed: {
        TabType() {
            return TabType;
        },
    },
    components: {
        ProjectIcon,
        ViewIcon,
        LinearIcon,
        LinearIconRound,
        GithubIcon,
        JiraIcon,
        InterfaceGeometricCircle,
        DocumentIcon,
        InterfaceFavoriteStar,
        InterfaceContentFileAlternate,
        InterfaceDelete1,
    },
})
export default class TabComponent extends Vue {
    tabHovered: boolean = false;

    @Prop({
        required: true,
    })
    tab!: Tab;

    @Prop({
        required: true,
    })
    active!: boolean;

    @Prop({
        required: true,
    })
    groupId!: string;

    @Prop({ required: true })
    groupActive!: boolean;

    contextMenuOpen: boolean = false;

    $refs!: {
        tab: HTMLElement;
    };

    openContextMenu(e: any) {
        this.contextMenuOpen = true;
        this.$contextMenu.show(e, {
            component: () =>
                import('@/components/context-menu/NewTabContextMenu.vue'),
            onClose: () => {
                this.contextMenuOpen = false;
            },
            bind: {
                id: this.tab.entityId,
                tab: this.tab,
                tabId: this.tab.id,
                group: this.group,
                invokeFrom: 'tab',
            },
        });
    }

    get document() {
        return this.tab.type === TabType.DOCUMENT
            ? this.$store.getters['document/byId'](this.tab.entityId) ??
                  this.$store.getters['document/byClip'](this.tab.entityId)
            : null;
    }

    @Watch('tab.entityId', { deep: true })
    onEntityIdChange() {
        scrollIntoView(this.$refs.tab, {
            time: 250,
        });
    }

    @Watch('active')
    onActiveChange(isActive: boolean) {
        if (isActive) {
            scrollIntoView(this.$refs.tab, {
                time: 250,
            });
        }
    }

    hoverEnter() {
        this.tabHovered = true;
    }

    hoverLeave() {
        this.tabHovered = false;
    }

    get title() {
        if (this.tab.type === TabType.DOCUMENT) {
            return this.document?.title || 'Untitled';
        }
        if (this.tab.type === TabType.MY_DAY) return 'My Day';
        if (this.tab.type === TabType.NEW) return 'New Tab';
        if (this.tab.type === TabType.JIRA_APP) return 'Jira';
        if (this.tab.type === TabType.GITHUB_APP) return 'Github';
        if (this.tab.type === TabType.LINEAR_APP) return 'Linear';
        if (this.tab.type === TabType.VIEW)
            return this.$entities.view.getViewName(this.tab.entityId);
        if (this.tab.type === TabType.PROJECT)
            return this.$entities.folder.getName(this.tab.entityId);
        return 'Untitled';
    }

    openTab() {
        this.$tabs.activateTab(this.tab, this.groupId);
    }

    // split() {
    //     this.$tabs.splitRight({ ...this.tab, id: v4() });
    // }

    close() {
        this.$tabs.closeTab(this.tab, this.groupId);
        return false;
    }

    get group() {
        return this.$store.getters['tabs/groupById'](this.groupId);
    }

    mounted() {
        if (this.active && this.groupActive) {
            scrollIntoView(this.$refs.tab, {
                time: 250,
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.tab {
    @include font12-500;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 100px;
    color: var(--tab-pill-text-color);
    border-radius: 8px;
    padding: 5px 10px 5px 12px;
    cursor: default;
    flex: 1 1;
    background: var(--tab-pill-bg-color);

    &.single {
        padding-top: 0;
        padding-bottom: 9px;
    }

    &:not(:last-of-type) {
        margin-right: 6px;
    }

    &:hover:not(.single),
    &.context-active:not(.single) {
        color: var(--tab-pill-text-color__hover);
        background: var(--tab-pill-bg-color__active);
    }

    &.active {
        color: var(--tab-pill-text-color__active);
        background: var(--tab-pill-bg-color__active);

        .tab__icon {
            color: var(--tab-pill-icon-color__active);
        }

        &:hover {
            background: var(--tab-pill-bg-group__active__hover);
        }

        &.group-active {
            background: var(--tab-pill-bg-group-color__active);
        }
    }

    &__title {
        @include ellipsis;
        flex: 1 1 auto;
    }

    &__icon {
        color: var(--tab-pill-icon-color);
        margin-right: 8px;
        padding: 2px;
        border-radius: 4px;

        &__document {
            line-height: 14px;
        }

        div > button {
            color: var(--tab-pill-icon-color);

            &:hover {
                color: var(--tab-pill-icon-color__hover);
            }
        }
    }

    &__options {
        margin-left: auto;
        display: flex;
        align-items: center;

        button {
            color: var(--tab-pill-close-icon-color);
            border-radius: 4px;
            padding: 2px;

            .icon {
                color: var(--tab-pill-close-icon-color);
            }

            &:hover,
            &.active {
                color: var(--tab-pill-icon-color__active);

                .icon {
                    color: var(--tab-pill-icon-color__active);
                }
            }
        }

        &__placeholder {
            width: 14px;
            height: 10px;
        }
    }
}
</style>

<template>
    <div class="sidebar">
        <OverlayScrollbar>
            <div
                class="sidebar__navigation"
                @contextmenu.prevent.stop="handleSidebarContextMenu"
            >
                <AppNavigation />
                <PinnedMenu />
                <div class="sidebar__navigation__divider">
                    <button tabindex="-1" @click="expanded = !expanded">
                        Pages
                    </button>
                </div>
                <div class="sidebar__navigation__menu-wrapper">
                    <div v-show="expanded" class="sidebar__navigation__menu">
                        <Tree
                            :parent-id="null"
                            :class="[isDragging ? 'is-dragging' : null]"
                            class="root"
                        />
                    </div>
                </div>
            </div>
        </OverlayScrollbar>
        <SidebarFooter />
        <div
            ref="resizeHandle"
            class="sidebar__navigation__resize-handle"
        ></div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AppNavigation from '~/components/sidebar/AppNavigation.vue';
import Tree from '~/components/sidebar/SidebarTree/Tree.vue';
import PinnedMenu from '~/components/sidebar/SidebarTree/PinnedMenu.vue';
import OverlayScrollbar from '~/components/OverlayScrollbar.vue';
import SidebarFooter from '~/components/sidebar/SidebarFooter.vue';
import SidebarContextMenu from '~/components/context-menu/SidebarContextMenu.vue';

@Component({
    components: {
        SidebarFooter,
        OverlayScrollbar,
        PinnedMenu,
        Tree,
        AppNavigation,
    },
})
export default class Sidebar extends Vue {
    expanded: boolean = true;

    get isDragging() {
        return !!this.$store.getters['sidebar/draggedItem'];
    }

    highlight = '';

    handleSidebarContextMenu(e: MouseEvent) {
        this.$contextMenu.show(e, {
            component: SidebarContextMenu,
            bind: {
                redirect: true,
            },
        });
    }

    mounted() {
        this.$shortcutsManager.enableNamespace('sidebar');
        this.$shortcutsManager.enableNamespace('header');
    }
}
</script>

<style lang="scss" scoped>
.sidebar {
    grid-area: sidebar;
    color: var(--sidebar-text-color);

    &__navigation {
        height: calc(var(--viewport-height) - 105px);

        &__divider {
            padding: 10px 16px 2px 14px;
            user-select: none;

            button {
                display: block;
                outline: none;
                font-style: normal;
                font-weight: 600;
                font-size: 12px;
                line-height: 17px;
                color: var(--sidebar-group-button-text-color);
                padding: 1px 8px 2px;
                border-radius: 6px;

                .icon {
                    margin-right: 4px;
                }

                &:hover {
                    color: var(--sidebar-group-button-text-color__hover);
                    background: var(--sidebar-group-button-bg-color__hover);
                }
            }
        }

        &__menu {
            &-wrapper {
                padding: 0 10px;
            }

            padding-bottom: 8px;
        }

        &__resize-handle {
            width: 6px;
            height: 100vh;
            position: absolute;
            right: 0px;
            top: 0px;
            cursor: col-resize;
        }
    }
}
</style>

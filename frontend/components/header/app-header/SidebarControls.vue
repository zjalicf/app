<template>
    <div class="sidebar-controls">
        <button class="no-drag" @click="toggleSidebar">
            <tippy
                :content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.TOGGLE_SIDEBAR,
                    )
                "
                :delay="[500, 20]"
                theme="tooltip"
                :touch="false"
            >
                <InterfaceLayout9 class="icon" size="14" />
            </tippy>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TrafficLights from '~/components/mac/TrafficLights.vue';
import InterfaceArrowsLeft from '~/components/streamline/InterfaceArrowsLeft.vue';
import InterfaceArrowsRight from '~/components/streamline/InterfaceArrowsRight.vue';
import InterfaceLayout9 from '~/components/streamline/InterfaceLayout9.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'SidebarControls',
    components: {
        InterfaceLayout9,
        InterfaceArrowsRight,
        InterfaceArrowsLeft,
        TrafficLights,
    },
})
export default class SidebarControls extends Vue {
    timeout: any = null;

    async toggleSidebar() {
        await this.$store.dispatch('misc/toggleSidebar');
        const width = this.$store.getters['misc/viewportWidth'];
        if (this.sidebarOpen) {
            this.$tracking.trackEventV2(TrackingType.SIDEBAR, {
                action: TrackingAction.OPEN,
                source: TrackingActionSource.BUTTON,
            });
            if (this.timeout) {
                return;
            }
            this.timeout = setTimeout(() => {
                this.$tabs.recalculateAllTabs(width);
                clearTimeout(this.timeout);
                this.timeout = null;
            }, 200);
        } else {
            this.$tracking.trackEventV2(TrackingType.SIDEBAR, {
                action: TrackingAction.CLOSE,
                source: TrackingActionSource.BUTTON,
            });
            clearTimeout(this.timeout);
            this.timeout = null;
            this.$tabs.recalculateAllTabs(window.innerWidth);
        }
    }

    get sidebarOpen() {
        return this.$store.getters['misc/sidebarOpen'];
    }
}
</script>

<style lang="scss" scoped>
.sidebar-controls {
    button {
        padding: 7px;
        color: var(--app-bg-icon-color);
        border-radius: 6px;

        &:hover {
            color: var(--app-bg-icon-color__hover);
            background: var(--app-bg-icon-bg-color__hover);
        }
    }
}
</style>

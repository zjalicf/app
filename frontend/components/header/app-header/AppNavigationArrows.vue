<template>
    <div class="navigation-arrows drag">
        <button
            class="no-drag"
            :disabled="!canMoveBackward"
            @mousedown.stop
            @click.stop.prevent="moveHistoryBackward"
        >
            <tippy
                :content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.BACK,
                    )
                "
                :delay="[500, 20]"
                theme="tooltip"
                :touch="false"
            >
                <InterfaceArrowsLeft class="icon" size="14" />
            </tippy>
        </button>
        <button
            class="no-drag"
            :disabled="!canMoveForward"
            @mousedown.stop
            @click.stop.prevent="moveHistoryForward"
        >
            <tippy
                :content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.FORWARD,
                    )
                "
                :delay="[500, 20]"
                theme="tooltip"
                :touch="false"
            >
                <InterfaceArrowsRight class="icon" size="14" />
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
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'AppNavigationArrows',
    components: {
        InterfaceLayout9,
        InterfaceArrowsRight,
        InterfaceArrowsLeft,
        TrafficLights,
    },
})
export default class AppNavigationArrows extends Vue {
    get canMoveForward() {
        return this.$store.getters['tabs/historyCanMoveForward'];
    }

    get canMoveBackward() {
        return this.$store.getters['tabs/historyCanMoveBackward'];
    }

    @TrackEvent(TrackingType.HISTORY, {
        action: TrackingAction.BACK,
        source: TrackingActionSource.CLICK,
    })
    moveHistoryBackward() {
        this.$tabs.historyBackward();
    }

    @TrackEvent(TrackingType.HISTORY, {
        action: TrackingAction.FORWARD,
        source: TrackingActionSource.CLICK,
    })
    moveHistoryForward() {
        this.$tabs.historyForward();
    }
}
</script>

<style lang="scss" scoped>
.navigation-arrows {
    display: flex;
    align-items: center;
    gap: 4px;

    button {
        color: var(--app-bg-icon-color);
        padding: 7px;
        border-radius: 6px;

        &:hover:not(:disabled) {
            background: var(--app-bg-icon-bg-color__hover);
            color: var(--app-bg-icon-color__hover);
        }

        &:disabled {
            color: var(--app-bg-icon-color__disabled);
        }
    }
}
</style>

<template>
    <div class="traffic-light drag" :class="{ 'window-focus': windowFocus }">
        <button tabindex="-1" class="no-drag close" @click="close">
            <CloseIcon class="icon" size="12" />
        </button>
        <button tabindex="-1" class="no-drag minimize" @click="minimize">
            <MinimizeIcon class="icon" size="12" />
        </button>
        <button tabindex="-1" class="no-drag maximize" @click="maximize">
            <MaximizeIcon class="icon" size="12" />
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CloseIcon from './CloseIcon.vue';
import MaximizeIcon from './MaximizeIcon.vue';
import MinimizeIcon from './MinimizeIcon.vue';
import { SafeElectronWindow } from '~/@types';

@Component({
    components: { MinimizeIcon, MaximizeIcon, CloseIcon },
})
export default class TrafficLights extends Vue {
    get windowFocus() {
        return this.$store.getters['misc/windowFocus'];
    }

    maximize() {
        (window as SafeElectronWindow).electron.maximize();
    }

    minimize() {
        (window as SafeElectronWindow).electron.minimize();
    }

    close() {
        (window as SafeElectronWindow).electron.close();
    }
}
</script>

<style lang="scss" scoped>
.traffic-light {
    width: 60px;
    padding: 7px 5px 5px;
    display: flex;
    align-items: center;

    &:hover button .icon {
        display: block;
    }

    &:not(.window-focus) button.close,
    &:not(.window-focus) button.minimize,
    &:not(.window-focus) button.maximize {
        background: var(--traffic-lights-bg-color__disabled);
    }

    button {
        outline: none;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            display: none;
        }

        &:not(:last-of-type) {
            margin-right: 7px;
        }

        &.close {
            background: #fc615d;
        }

        &.minimize {
            background: #fdbc40;
        }

        &.maximize {
            background: #34c749;
        }
    }
}
</style>

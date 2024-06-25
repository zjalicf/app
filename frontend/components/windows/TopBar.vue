<template>
    <div class="top-bar drag">
        <button tabindex="-1" class="no-drag" @click="minimize">
            <MinimizeIcon size="10" />
        </button>
        <button
            tabindex="-1"
            class="no-drag"
            @click="maximize"
            v-if="!windowMaximized"
        >
            <MaximizeIcon size="10" />
        </button>
        <button v-else tabindex="-1" class="no-drag close" @click="maximize">
            <RestoreIcon size="10" />
        </button>
        <button tabindex="-1" class="no-drag close" @click="close">
            <CloseIcon size="10" />
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CloseIcon from '~/components/windows/CloseIcon.vue';
import MaximizeIcon from '~/components/windows/MaximizeIcon.vue';
import MinimizeIcon from '~/components/windows/MinimizeIcon.vue';
import { SafeElectronWindow } from '~/@types';
import RestoreIcon from '~/components/windows/RestoreIcon.vue';

@Component({
    components: { RestoreIcon, MinimizeIcon, MaximizeIcon, CloseIcon },
})
export default class TopBar extends Vue {
    maximize() {
        (window as SafeElectronWindow).electron.maximize();
    }

    minimize() {
        (window as SafeElectronWindow).electron.minimize();
    }

    close() {
        (window as SafeElectronWindow).electron.close();
    }

    get windowMaximized() {
        return this.$store.getters['misc/windowMaximized'];
    }
}
</script>

<style lang="scss" scoped>
.top-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    z-index: 99999999999;
    button {
        @include animateBackgroundColor;
        outline: none;
        height: 100%;
        padding: 5px 11px;
        color: var(--windows-controls-color);

        &:hover {
            color: var(--windows-controls-color__hover);
        }
    }
}
</style>

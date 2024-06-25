<template>
    <div class="debug-context-menu">
        <button @click="cleanCacheAndRestart">
            <ExclamationIcon class="icon" size="20" />
            Clean Cache & Restart
        </button>
        <button @click="openDevtools">
            <ExclamationIcon class="icon" size="20" />
            Open DevTools
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ExclamationIcon } from '@vue-hero-icons/solid';
import { cleanCache, restartApp } from '~/helpers/app';
import { SafeElectronWindow } from '~/@types';

@Component({
    name: 'DebugContextMenu',
    components: {
        ExclamationIcon,
    },
})
export default class DebugContextMenu extends Vue {
    async cleanCacheAndRestart() {
        this.$emit('close');

        await cleanCache();
        restartApp();
    }

    openDevtools() {
        this.$emit('close');
        (window as SafeElectronWindow).electron.openDevTools();
    }
}
</script>

<style lang="scss" scoped>
.debug-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>

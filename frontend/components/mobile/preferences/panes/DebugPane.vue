<template>
    <div class="debug-pane">
        <div class="debug-pane__options">
            <button
                class="debug-pane__options__option danger"
                @click="cleanCacheAndRestart"
            >
                <div class="debug-pane__options__option__title">
                    Clean Cache & Restart
                </div>
                <div class="debug-pane__options__option__icon">
                    <ExclamationIcon class="icon" size="20" />
                </div>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ExclamationIcon } from '@vue-hero-icons/solid';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import { cleanCache, restartApp } from '~/helpers/app';

@Component({
    name: 'DebugPane',
    components: {
        InterfaceValidationCheck,
        ExclamationIcon,
    },
})
export default class DebugPane extends Vue {
    async cleanCacheAndRestart() {
        this.$emit('close');

        await cleanCache();
        restartApp();
    }
}
</script>
<style lang="scss" scoped>
.debug-pane {
    @include mobileDropdown;
    padding-top: 36px;
}
</style>

<template>
    <div class="mirror-context-menu">
        <button @click="mirrorVault">
            <ExclamationIcon class="icon" size="20" />
            Mirror vault
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ExclamationIcon } from '@vue-hero-icons/solid';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

@Component({
    name: 'DebugContextMenu',
    components: {
        ExclamationIcon,
    },
})
export default class DebugContextMenu extends Vue {
    mirrorVault() {
        this.$emit('close');

        this.$serviceRegistry.emit(
            ServiceKey.DATABASE,
            DatabaseServiceAction.MIRROR_VAULT,
            { payload: { vault: this.$store.getters['vault/active'] } },
        );
    }
}
</script>

<style lang="scss" scoped>
.mirror-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;
}
</style>

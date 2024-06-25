<template>
    <div class="tooltip">
        Loading vault<span class="tooltip-divider"></span>Progress:
        {{ Math.floor((vault.info.loaded / vault.info.total) * 100) }}%<span
            class="tooltip-divider"
        ></span
        >Remaining: {{ vault.info.timeRemaining }}s
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'TippyElement',
    components: {},
})
export default class TippyElement extends Vue {
    _init() {}

    get vault() {
        return this.$store.getters['vault/vaultStatus'](
            this.$store.getters['vault/activeVaultId'],
        );
    }

    get progress() {
        if (this.vault.state === 'LOADING') {
            return `<div class='tooltip'>Loading vault<span class='tooltip-divider'></span>Progress: ${Math.floor(
                (this.vault.info.loaded / this.vault.info.total) * 100,
            )}%<span class='tooltip-divider'></span>Remaining: ${
                this.vault.info.timeRemaining
            }s</div>`;
        }
        return `<div class='tooltip'>${this.vault.state}<span class='tooltip-divider'></span>SOME</span></div>`;
    }
}
</script>
<style lang="scss" scoped>
.sync-status {
    user-select: none;
}
</style>

<template>
    <div class="vault-overview-settings">
        <div class="vault-overview-settings__title">Overview</div>
        <VaultSettings :selected-vault="vaultId" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import VaultSettings from '~/components/vault/VaultSettings.vue';

@Component({
    name: 'VaultOverviewSettings',
    components: { VaultSettings },
})
export default class VaultOverviewSettings extends Vue {
    get vaultId() {
        return this.$store.getters['vault/active'].id;
    }
}
</script>

<style lang="scss" scoped>
.vault-overview-settings {
    padding: 30px;

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
        margin-bottom: 27px;
    }
}
</style>

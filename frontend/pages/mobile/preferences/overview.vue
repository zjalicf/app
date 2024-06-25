<template>
    <div class="mobile-vault-overview-settings page">
        <MobileSettingsHeader name="Overview" />
        <div class="mobile-vault-overview-settings__wrapper">
            <MobileOverviewPreferences :selected-vault="vaultId" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MobileSettingsHeader from '~/components/mobile/common/headers/MobileSettingsHeader.vue';
import MobileOverviewPreferences from '~/components/mobile/preferences/MobileOverviewPreferences.vue';

@Component({
    name: 'MobileVaultOverviewSettings',
    components: {
        MobileOverviewPreferences,
        MobileSettingsHeader,
    },
    layout: 'mobile',
})
export default class MobileVaultOverviewSettings extends Vue {
    get vaultId() {
        return this.$store.getters['vault/active'].id;
    }
}
</script>
<style lang="scss" scoped>
.mobile-vault-overview-settings {
    background: var(--mobile-app-bg-color);
    height: $pageHeight;

    &__wrapper {
        @include scrollbar;
        height: $contentHeight;
        overflow-y: overlay;
        padding: 8px 18px 0;
    }
}
</style>

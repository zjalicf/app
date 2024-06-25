<template>
    <div class="mobile-vault-calendars-settings page">
        <MobileSettingsHeader name="Calendars" />
        <div class="mobile-vault-calendars-settings__wrapper">
            <MobileCalendarPreferences :vault="vault" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MobileSettingsHeader from '~/components/mobile/common/headers/MobileSettingsHeader.vue';
import MobileCalendarPreferences from '~/components/mobile/preferences/MobileCalendarPreferences.vue';

@Component({
    name: 'MobileVaultCalendarSettings',
    components: {
        MobileCalendarPreferences,
        MobileSettingsHeader,
    },
    layout: 'mobile',
})
export default class MobileVaultCalendarSettings extends Vue {
    get vault() {
        return this.$store.getters['vault/active'];
    }
}
</script>
<style lang="scss" scoped>
.mobile-vault-calendars-settings {
    background: var(--mobile-app-bg-color);
    height: 100%;

    &__wrapper {
        @include scrollbar;
        height: $contentHeight;
        overflow-y: overlay;
        padding: 8px 18px 0;
    }
}
</style>

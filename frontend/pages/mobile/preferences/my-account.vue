<template>
    <div class="mobile-my-account-settings page">
        <MobileSettingsHeader name="My account" />
        <div class="mobile-my-account-settings__wrapper">
            <MobileAccountPreferences />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MobileSettingsHeader from '~/components/mobile/common/headers/MobileSettingsHeader.vue';
import MobileAccountPreferences from '~/components/mobile/preferences/MobileAccountPreferences.vue';

@Component({
    name: 'MobileMyAccountSettings',
    components: {
        MobileAccountPreferences,
        MobileSettingsHeader,
    },
    layout: 'mobile',
})
export default class MobileMyAccountSettings extends Vue {}
</script>
<style lang="scss" scoped>
.mobile-my-account-settings {
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

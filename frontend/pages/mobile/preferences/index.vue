<template>
    <div class="mobile-preferences page">
        <MobileSettingsHeader name="Settings" />
        <div class="mobile-preferences__body">
            <NavigationGroup title="General" :items="accountPreferences" />
            <NavigationGroup :title="vaultName" :items="vaultPreferences" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavigationGroup from '~/components/mobile/common/SideBar/NavigationGroup.vue';
import { transition } from '@/helpers/util';
import MobileSettingsHeader from '~/components/mobile/common/headers/MobileSettingsHeader.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import MoneySafeVault from '~/components/streamline/MoneySafeVault.vue';
import InterfaceUserSingle from '~/components/streamline/InterfaceUserSingle.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';

@Component({
    name: 'Preferences',
    transition,
    components: {
        MobileSettingsHeader,
        NavigationGroup,
    },
    layout: 'mobile',
})
export default class Preferences extends Vue {
    get accountPreferences() {
        return [
            {
                name: 'My account',
                type: 'setting',
                id: 'my-account',
                icon: InterfaceUserSingle,
            },
            {
                name: 'Preferences',
                type: 'setting',
                id: 'preferences',
                icon: InterfaceSettingCog,
            },
        ];
    }

    get vaultPreferences() {
        return [
            {
                name: 'Overview',
                type: 'setting',
                id: 'overview',
                icon: MoneySafeVault,
            },
            {
                name: 'Calendars',
                type: 'setting',
                id: 'calendars',
                icon: InterfaceCalendar,
            },
        ];
    }

    get vaultName() {
        return this.$store.getters['vault/active'].name;
    }
}
</script>
<style lang="scss" scoped>
.mobile-preferences {
    background: var(--mobile-app-bg-color);
    height: $pageHeight;

    &__body {
        padding: 20px;
    }
}
</style>

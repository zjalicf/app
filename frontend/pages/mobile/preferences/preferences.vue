<template>
    <div class="mobile-settings-preferences page">
        <MobileSettingsHeader name="Preferences" />
        <MobilePreferences />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { transition } from '@/helpers/util';
import MobileSettingsHeader from '~/components/mobile/common/headers/MobileSettingsHeader.vue';
import MobilePreferences from '~/components/mobile/preferences/MobilePreferences.vue';

@Component({
    name: 'MobileSettingsPreferences',
    components: { MobilePreferences, MobileSettingsHeader },
    transition,
    layout: 'mobile',
})
export default class MobileSettingsPreferences extends Vue {}
</script>
<style lang="scss" scoped>
.mobile-settings-preferences {
    background: var(--mobile-app-bg-color);
    height: $pageHeight;
}
</style>

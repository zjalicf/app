<template>
    <div class="mobile-sidebar page">
        <MobileWorkspaceSelector />
        <div class="mobile-sidebar__page">
            <MobileSearch />
            <MobileViews />
            <div class="mobile-sidebar__body">
                <MobileSidebar />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MobileWorkspaceSelector from '~/components/mobile/common/SideBar/MobileWorkspaceSelector.vue';
import MobileSidebar from '~/components/mobile/common/SideBar/MobileSidebar.vue';
import { transition } from '@/helpers/util';
import MobileSearch from '~/components/mobile/common/Search/MobileSearch.vue';
import SyncStatus from '~/components/mobile/SyncStatus.vue';
import MobileViews from '~/components/mobile/common/SideBar/MobileViews.vue';

@Component({
    name: 'MobileSidebarPage',
    layout: 'mobile',
    transition,
    components: {
        MobileViews,
        SyncStatus,
        MobileWorkspaceSelector,
        MobileSidebar,
        MobileSearch,
    },
})
export default class MobileSidebarPage extends Vue {}
</script>

<style lang="scss" scoped>
.mobile-sidebar {
    height: $pageHeight;
    background: var(--app-mobile-bg-color);

    &__page {
        height: calc(100% - 42px);
        overflow-y: auto;
    }

    &__body {
        max-height: 100%;
        padding: 20px;
    }
}
</style>

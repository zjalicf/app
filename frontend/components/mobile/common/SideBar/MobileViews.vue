<template>
    <div class="mobile-views">
        <nuxt-link
            v-for="sidebarEntity of $utils.sidebar.sidebarEntities"
            :key="`view-${sidebarEntity.id}`"
            :to="{
                path: $utils.sidebar.getMobileEntityLink(sidebarEntity),
                query: { level: 1 },
            }"
            class="mobile-views__item"
            @mousedown.native="trackNavigation(sidebarEntity)"
        >
            <MenuItem :color="$utils.sidebar.getEntityColor(sidebarEntity)">
                <template #icon>
                    <component
                        :is="$utils.sidebar.getEntityIcon(sidebarEntity)"
                        v-bind="{
                            id: sidebarEntity.id,
                        }"
                    />
                </template>
                <template
                    v-if="$utils.sidebar.showSmallIcon(sidebarEntity)"
                    #small-icon
                >
                    <InterfaceAlignLayers1 size="8" />
                </template>
                <template v-if="$utils.sidebar.showData(sidebarEntity)" #data
                    >{{ $utils.sidebar.sidebarCount(sidebarEntity) }}
                </template>
                <template #title
                    >{{ $utils.sidebar.getEntityName(sidebarEntity) }}
                </template>
            </MenuItem>
        </nuxt-link>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MenuItem from '~/components/sidebar/MenuItem.vue';
import ViewIcon from '~/components/view/ViewIcon.vue';
import { SidebarEntityType, ViewType } from '~/constants';
import InterfaceAlignLayers1 from '~/components/streamline/InterfaceAlignLayers1.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { Tab } from '~/@types/app';

@Component({
    name: 'MobileViews',
    computed: {
        ViewType() {
            return ViewType;
        },
    },
    components: { InterfaceAlignLayers1, ViewIcon, MenuItem },
})
export default class MobileViews extends Vue {
    get views() {
        return this.$entities.view.getDisplayedViews();
    }

    trackNavigation(sidebarEntity: any) {
        if (!sidebarEntity) return;
        let type;
        if (sidebarEntity.sidebarEntityType === SidebarEntityType.VIEW) {
            type = this.$tracking._resolveViewSource({
                entityId: sidebarEntity.id,
            } as Tab) as TrackingType | null;
        } else {
            type = this.$tracking._resolveProjectSource({
                entityId: sidebarEntity.id,
            } as Tab) as TrackingType | null;
        }
        if (!type) return;
        this.$tracking.trackEventV2(type, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE_SIDEBAR,
        });
    }
}
</script>
<style lang="scss" scoped>
.mobile-views {
    @include scrollbar;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    overflow-x: overlay;
    padding: 0 18px;

    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    &__item {
        width: 140px;
        height: 84px;
        flex-shrink: 0;

        :deep(.menu-item) {
            padding: 10px 11px 12px 12px;
            background: var(--sidebar-bg-color__mobile);
            justify-content: space-between;
            color: var(--sidebar-text-color__active);

            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            letter-spacing: -0.24px;
        }

        :deep(.title) {
            font-style: normal;
            font-weight: 500;
            font-size: 13.83px;
            line-height: 22px;
            color: $blueGrey300;
        }
    }
}
</style>

<template>
    <div ref="bottomBar" class="bottom-bar">
        <button
            class="link"
            :class="{
                active: activeTab === 'mobile',
            }"
            @click="navigateMyDay"
        >
            <StarIcon class="icon" size="24" />
        </button>
        <add-menu />
        <button
            class="link"
            :class="{
                active: documentRoutes.includes(activeTab),
            }"
            @click="navigateSidebar"
        >
            <FolderOpenIcon class="icon" />
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { FolderOpenIcon, StarIcon } from '~/components/icons';
import AddMenu from '~/components/mobile/common/AddMenu.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'BottomBar',
    components: {
        AddMenu,
        StarIcon,
        FolderOpenIcon,
    },
})
export default class BottomBar extends Vue {
    $refs!: {
        bottomBar: HTMLElement;
    };

    documentRoutes: string[] = [
        'mobile-sidebar',
        'mobile-documents',
        'mobile-documents-id',
        'mobile-folder-id',
        'mobile-info-id',
        'mobile-view-id',
        'mobile-project-id',
    ];

    get activeTab() {
        return this.$route.name;
    }

    navigateMyDay() {
        if (this.$router.currentRoute.name === 'mobile') {
            this.$store.commit('dailyDoc/today');
            this.$store.dispatch(
                'dailyDoc/calendarSetDate',
                new Date(this.$store.getters['dailyDoc/date']),
            );
        } else {
            this.$router.push({
                path: `/mobile`,
                query: {
                    level: '0',
                },
            });
        }

        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE_BOTTOM_BAR,
        });
    }

    navigateSidebar() {
        this.$router.push({
            path: `/mobile/sidebar`,
            query: {
                level: '0',
            },
        });
    }

    async mounted() {
        const { SafeArea } = await import('capacitor-plugin-safe-area');
        const offsets = await SafeArea.getSafeAreaInsets();
        const height =
            this.$config.os === 'ios' ? 60 + offsets.insets.bottom : 60;

        this.$refs.bottomBar.style.top = `${Math.round(
            document.body.getBoundingClientRect().height - height,
        )}px`;

        window.addEventListener('orientationchange', () => {
            this.$refs.bottomBar.style.top = `${Math.round(
                document.body.getBoundingClientRect().height - height,
            )}px`;
        });
    }
}
</script>
<style lang="scss" scoped>
.bottom-bar {
    user-select: none;
    position: absolute !important;
    width: 100vw;
    top: 100%;
    background: var(--mobile-app-bg-color) !important;
    border-top: 1px solid var(--tab-divider-color);
    height: calc(60px + var(--ion-safe-area-bottom));
    display: grid;
    align-items: center;
    gap: 48px;
    grid-template-columns: repeat(3, min-content);
    grid-template-rows: 50px;
    justify-content: center;
    justify-items: center;
    z-index: 1;

    .link {
        @include animateOpacity;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.4;
        height: 50px;
        width: 56px;

        &.active,
        &:active {
            opacity: 1;
        }
    }
}
</style>

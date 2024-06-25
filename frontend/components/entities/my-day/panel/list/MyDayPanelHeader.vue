<template>
    <div class="my-day-panel-header">
        {{ headingText }}
        <div class="my-day-panel-header__buttons">
            <button
                ref="calendarDisplaySettigns"
                :class="{
                    active: calendarVisibilityButtonActive,
                }"
                tabindex="-1"
                @click="toggleDisplaySettings"
            >
                <LoadingIcon v-if="isLoading" size="25" class="icon" />
                <InterfaceSettingSliderVertical v-else size="14" class="icon" />
            </button>
            <button
                v-if="detached"
                class="my-day-panel-header__close"
                @click="$emit('close')"
            >
                <InterfaceDelete1 class="icon" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import InterfaceArrowsMoveLeft from '~/components/streamline/InterfaceArrowsMoveLeft.vue';
import InterfaceArrowsMoveRight from '~/components/streamline/InterfaceArrowsMoveRight.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import InterfaceSettingSliderVertical from '~/components/streamline/InterfaceSettingSliderVertical.vue';
import CalendarVisibilitySettingsDropdown from '~/components/calendar/CalendarVisibilitySettingsDropdown.vue';

@Component({
    name: 'MyDayPanelHeader',
    components: {
        InterfaceSettingSliderVertical,
        LoadingIcon,
        InterfaceDelete1,
        InterfaceArrowsMoveRight,
        InterfaceArrowsMoveLeft,
    },
})
export default class MyDayPanelHeader extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ default: false })
    detached!: boolean;

    @Prop({ default: () => new Date() })
    currentDate!: Date;

    calendarVisibilityButtonActive: boolean = false;

    $refs!: {
        calendarDisplaySettigns: HTMLButtonElement;
    };

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data;
    }

    get isLoading() {
        return this.$store.getters['integration/isLoading'];
    }

    get headingText() {
        return format(this.currentDate, 'MMMM, yyyy');
    }

    updateTabData(data: any) {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.tabId,
            data,
        });
    }

    toggleDisplaySettings() {
        this.calendarVisibilityButtonActive = true;

        this.$dropdown.show({
            component: CalendarVisibilitySettingsDropdown,
            parent: this.$refs.calendarDisplaySettigns,
            popperOptions: {
                placement: 'bottom-end',
            },
            onClose: () => {
                this.calendarVisibilityButtonActive = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.my-day-panel-header {
    @include font14-600;
    width: 100%;
    background: var(--jira-panel-header-bg-color);
    -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
    backdrop-filter: blur(12px); /* Chrome and Opera */
    border-bottom: 1px solid var(--tab-divider-color);

    user-select: none;

    display: flex;
    justify-content: space-between;
    align-items: center;

    position: sticky;
    top: 0;

    padding: 0 20px 16px;

    &__buttons {
        display: flex;
        align-items: center;
        gap: 8px;

        button {
            padding: 6px;
            border-radius: 50%;
            color: var(--tab-controls-icon-color);
            background: var(--tab-controls-bg-color);

            &:hover,
            &.active {
                color: var(--tab-controls-icon-color__hover);
                background: var(--tab-controls-bg-color__hover);
            }
        }
    }
}
</style>

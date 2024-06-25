<template>
    <div class="mobile-calendar-preferences">
        <MobileSettingsSection>
            <template #title>{{ vaultName }}</template>
            <template #buttons>
                <MobileSettingsButton
                    class="disabled"
                    @click.prevent.stop="toggleTasksInCalendarVisibility"
                >
                    <div class="mobile-settings-button__title">
                        <button
                            class="mobile-calendar-preferences__color-wrapper"
                            @click.prevent.stop="
                                onTasksInCalendarColorPickerHandler
                            "
                        >
                            <div
                                class="
                                    mobile-calendar-preferences__color-wrapper__color
                                "
                                :style="{
                                    background: computeColorHex(
                                        tasksInCalendarConfig.acreomColorId,
                                    ),
                                }"
                            ></div></button
                        >Tasks
                    </div>
                    <div class="mobile-settings-button__value">
                        <CSwitch :value="tasksInCalendarConfig.visible" />
                    </div>
                </MobileSettingsButton>
                <MobileSettingsButton
                    class="disabled"
                    @click.prevent.stop="togglePagesInCalendarVisibility"
                >
                    <div class="mobile-settings-button__title">
                        <button
                            class="mobile-calendar-preferences__color-wrapper"
                            @click.prevent.stop="
                                onPagesInCalendarColorPickerHandler
                            "
                        >
                            <div
                                class="
                                    mobile-calendar-preferences__color-wrapper__color
                                "
                                :style="{
                                    background: computeColorHex(
                                        pagesInCalendarConfig.acreomColorId,
                                    ),
                                }"
                            ></div></button
                        >Pages
                    </div>
                    <div class="mobile-settings-button__value">
                        <CSwitch :value="pagesInCalendarConfig.visible" />
                    </div>
                </MobileSettingsButton>
            </template>
        </MobileSettingsSection>
        <div v-if="!$accessControl.readOnlyAccess">
            <MobileSettingsSection
                v-for="integration in gCalIntegrations"
                :key="integration.id"
            >
                <template #title
                    ><div class="mobile-calendar-preferences__title-wrapper">
                        <div
                            class="
                                mobile-calendar-preferences__title-wrapper__title
                            "
                        >
                            {{ integration.data.googleAccountEmail }}
                            <LoadingIcon
                                v-if="integration.data.state === 'loading'"
                                size="12"
                                class="icon"
                            />
                        </div>
                        <button
                            class="
                                mobile-calendar-preferences__title-wrapper__toggle-all
                            "
                            @click="toggleSelectAll(integration.id)"
                        >
                            {{
                                allCalendarsSelected(integration.id)
                                    ? 'HIDE'
                                    : 'SHOW'
                            }}
                            ALL
                        </button>
                    </div></template
                >
                <template #buttons>
                    <MobileSettingsButton
                        v-for="(
                            calendar, index
                        ) in integration.data.calendars.filter(
                            cal => !cal.isAcreom,
                        )"
                        :key="calendar.id"
                        class="disabled"
                        @click.prevent.stop="
                            toggleCalendarVisibility(
                                calendar.id,
                                integration.id,
                            )
                        "
                    >
                        <div class="mobile-settings-button__title">
                            <button
                                class="
                                    mobile-calendar-preferences__color-wrapper
                                "
                                @click.prevent.stop="
                                    onColorPickerHandler(
                                        calendar,
                                        integration.id,
                                    )
                                "
                            >
                                <div
                                    class="
                                        mobile-calendar-preferences__color-wrapper__color
                                    "
                                    :style="{
                                        background: calendar.acreomColorId
                                            ? computeColorHex(
                                                  calendar.acreomColorId,
                                              )
                                            : calendar.displayColor ||
                                              calendar.backgroundColor,
                                    }"
                                ></div>
                            </button>
                            {{ calendar.summary }}
                        </div>
                        <div class="mobile-settings-button__value">
                            <CSwitch :value="calendar.selected" />
                        </div>
                    </MobileSettingsButton>
                </template>
            </MobileSettingsSection>
        </div>
        <MobileSettingsSection
            v-for="integration in icsIntegrations"
            :key="integration.id"
        >
            <template #title
                ><div class="mobile-calendar-preferences__title-wrapper">
                    <div
                        class="
                            mobile-calendar-preferences__title-wrapper__title
                        "
                    >
                        {{ integration.data.calendar.name }}
                    </div>
                </div></template
            >
            <template #buttons>
                <MobileSettingsButton
                    class="disabled"
                    @click.prevent.stop="
                        toggleICSCalendarVisibility(
                            integration.data.calendar.id,
                            integration.id,
                        )
                    "
                >
                    <div class="mobile-settings-button__title">
                        <button
                            class="mobile-calendar-preferences__color-wrapper"
                            @click.prevent.stop="
                                onColorPickerHandler(
                                    integration.data.calendar,
                                    integration.id,
                                )
                            "
                        >
                            <div
                                class="
                                    mobile-calendar-preferences__color-wrapper__color
                                "
                                :style="{
                                    background: integration.data.calendar
                                        .acreomColorId
                                        ? computeColorHex(
                                              integration.data.calendar
                                                  .acreomColorId,
                                          )
                                        : integration.data.calendar
                                              .displayColor ||
                                          integration.data.calendar.color,
                                }"
                            ></div></button
                        >{{ integration.data.calendar.name }}
                    </div>
                    <div class="mobile-settings-button__value">
                        <CSwitch
                            :value="
                                integration.data.calendar.state === 'visible'
                            "
                        />
                    </div>
                </MobileSettingsButton>
            </template>
        </MobileSettingsSection>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { APP_COLORS, Color, IntegrationType } from '~/constants';
import { IVault } from '~/workers/database/indexeddb/types';
import ACheck from '~/components/system/ACheck/ACheck.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { ThemeOptions } from '~/helpers/date';
import InterfaceAlertWarningTriangle from '~/components/streamline/InterfaceAlertWarningTriangle.vue';
import MobileSettingsSection from '~/components/mobile/preferences/navigation/MobileSettingsSection.vue';
import MobileSettingsButton from '~/components/mobile/preferences/navigation/MobileSettingsButton.vue';
import CSwitch from '~/components/CSwitch.vue';
import ColorPickerPane from '~/components/mobile/preferences/panes/ColorPickerPane.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MobileCalendarPreferences',
    components: {
        CSwitch,
        MobileSettingsButton,
        MobileSettingsSection,
        InterfaceAlertWarningTriangle,
        ACheck,
        LoadingIcon,
    },
})
export default class MobileCalendarPreferences extends Vue {
    @Prop()
    vault!: IVault;

    get defaultCalendar() {
        return this.$store.getters['vaultSettings/defaultCalendar'];
    }

    get tasksInCalendarConfig() {
        return this.$store.getters['vaultSettings/tasksInCalendarConfig'];
    }

    get pagesInCalendarConfig() {
        return this.$store.getters['vaultSettings/pagesInCalendarConfig'];
    }

    get integrations(): any[] {
        return this.$store.getters['integration/list'];
    }

    get vaultName() {
        const vault = this.$store.getters['vault/byId'](this.vault.id);
        return vault.name || 'Untitled Vault';
    }

    get gCalIntegrations() {
        return this.integrations.filter(
            integration => integration.type === IntegrationType.GOOGLE_CALENDAR,
        );
    }

    get icsIntegrations() {
        return this.integrations.filter(
            integration => integration.type === IntegrationType.ICS_CALENDAR,
        );
    }

    computeColorHex(color: Color) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];

        return APP_COLORS[color][theme].COLOR;
    }

    toggleTasksInCalendarVisibility() {
        const tasksInCalendarVisible = this.tasksInCalendarConfig.visible;
        const vaultId = this.vault.id;
        this.$store.dispatch('vaultSettings/updateTasksInCalendarConfig', {
            vaultId,
            value: { visible: !tasksInCalendarVisible },
        });

        if (tasksInCalendarVisible) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.HIDE_TASKS,
                source: TrackingActionSource.MOBILE,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.SHOW_TASKS,
                source: TrackingActionSource.MOBILE,
            });
        }
    }

    togglePagesInCalendarVisibility(value: boolean) {
        const pagesInCalendarVisible = this.pagesInCalendarConfig.visible;
        const vaultId = this.vault.id;
        this.$store.dispatch('vaultSettings/updatePagesInCalendarConfig', {
            vaultId,
            value: { visible: !pagesInCalendarVisible },
        });

        if (pagesInCalendarVisible) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.HIDE_PAGES,
                source: TrackingActionSource.MOBILE,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.SHOW_PAGES,
                source: TrackingActionSource.MOBILE,
            });
        }
    }

    toggleICSCalendarVisibility(calendarId: string, integrationId: string) {
        const icsCalendarVisible =
            this.icsIntegrations.find(({ id }) => id === integrationId)?.data
                .calendar?.state === 'visible';
        this.$store.dispatch('integration/updateCalendar', {
            calendar: {
                id: calendarId,
                state: !icsCalendarVisible ? 'visible' : 'hidden',
            },
            integrationId,
        });
    }

    toggleCalendarVisibility(calendarId: string, integrationId: string) {
        const calendarVisible = this.integrations
            .find(({ id }) => id === integrationId)
            ?.data.calendars.find(
                (cal: any) => cal.id === calendarId,
            )?.selected;
        this.$store.dispatch('integration/updateCalendar', {
            calendar: { id: calendarId, selected: !calendarVisible },
            integrationId,
        });
    }

    updateCalendarVisibility(
        value: boolean,
        calendarId: string,
        integrationId: string,
    ) {
        this.$store.dispatch('integration/updateCalendar', {
            calendar: { id: calendarId, selected: value },
            integrationId,
        });
    }

    onColorPickerHandler(calendar: any, integrationId: string) {
        this.$pane.show({
            component: ColorPickerPane,
            bind: {
                colors: APP_COLORS,
                value:
                    calendar?.acreomColorId ||
                    calendar?.displayColor ||
                    calendar?.backgroundColor,
            },
            on: {
                select: (value: Color) => {
                    this.$pane.hide();
                    this.$store.dispatch('integration/updateCalendar', {
                        calendar: { id: calendar.id, acreomColorId: value },
                        integrationId,
                    });
                },
            },
            type: 'picker',
            options: {
                fitHeight: true,
            },
        });
    }

    onPagesInCalendarColorPickerHandler() {
        this.$pane.show({
            component: ColorPickerPane,
            bind: {
                colors: APP_COLORS,
                value: this.pagesInCalendarConfig.acreomColorId,
            },
            on: {
                select: (value: Color) => {
                    this.$pane.hide();
                    const vaultId = this.vault.id;
                    this.$store.dispatch(
                        'vaultSettings/updatePagesInCalendarConfig',
                        {
                            vaultId,
                            value: { acreomColorId: value },
                        },
                    );
                },
            },
            type: 'picker',
            options: {
                fitHeight: true,
            },
        });
    }

    onTasksInCalendarColorPickerHandler() {
        this.$pane.show({
            component: ColorPickerPane,
            bind: {
                colors: APP_COLORS,
                value: this.tasksInCalendarConfig.acreomColorId,
            },
            on: {
                select: (value: Color) => {
                    this.$pane.hide();
                    const vaultId = this.vault.id;
                    this.$store.dispatch(
                        'vaultSettings/updateTasksInCalendarConfig',
                        {
                            vaultId,
                            value: { acreomColorId: value },
                        },
                    );
                },
            },
            type: 'picker',
            options: {
                fitHeight: true,
            },
        });
    }

    allCalendarsSelected(integrationId: string) {
        const calendars = this.integrations.find(
            ({ id }) => id === integrationId,
        )?.data.calendars;
        if (!calendars || !calendars.length) return false;
        const unselectedCalendar = calendars.find(
            (cal: any) => !('selected' in cal) || cal.selected === false,
        );
        return !unselectedCalendar;
    }

    toggleSelectAll(integrationId: string) {
        const integration = this.integrations.find(
            ({ id }) => id === integrationId,
        );
        if (!integration) return;
        const toggleValue = !this.allCalendarsSelected(integrationId);

        if (toggleValue) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.SELECT_ALL_CALENDARS,
                source: TrackingActionSource.MOBILE,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.UNSELECT_ALL_CALENDARS,
                source: TrackingActionSource.MOBILE,
            });
        }

        integration.data.calendars.forEach((calendar: any) => {
            this.updateCalendarVisibility(
                toggleValue,
                calendar.id,
                integrationId,
            );
        });
    }
}
</script>

<style lang="scss" scoped>
.mobile-settings-button {
    padding: 0 16px 0 0;

    &__title {
        padding: 0;
    }
}

.mobile-calendar-preferences {
    &__title-wrapper {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &__toggle-all {
            user-select: none;
            color: var(--accent-color);
        }
    }

    &__color-wrapper {
        padding: 19px;

        &__color {
            flex-shrink: 0;
            outline: none;
            width: 14px;
            height: 14px;
            border-radius: 4px;
        }
    }

    &__toggle-all {
        @include font12-500;

        color: var(--calendar-visibility-text-color);

        &:hover {
            color: var(--calendar-visibility-title-text-color__hover);
        }
    }
}
</style>

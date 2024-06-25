<template>
    <div>
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="bottom"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="calendar-settings-modal__body__visibility__account">
            <div
                class="
                    calendar-settings-modal__body__visibility__account__title
                "
                :title="vaultName"
            >
                <p>{{ vaultName }}</p>
            </div>
            <div
                class="
                    calendar-settings-modal__body__visibility__account__calendar
                "
            >
                <div
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__title
                    "
                >
                    <ACheck
                        :value="tasksInCalendarConfig.visible"
                        @change="updateTasksInCalendarVisibility($event)"
                    />
                    <div
                        class="
                            calendar-settings-modal__body__visibility__account__calendar__title__text
                        "
                        @click="
                            updateTasksInCalendarVisibility(
                                !tasksInCalendarConfig.visible,
                            )
                        "
                    >
                        Tasks
                    </div>
                </div>
                <button
                    ref="tasksInCalendarColorPicker"
                    :style="{
                        background: computeColorHex(
                            tasksInCalendarConfig.acreomColorId,
                        ),
                    }"
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__color
                    "
                    @click="onTasksInCalendarColorPickerHandler"
                ></button>
            </div>
            <div
                class="
                    calendar-settings-modal__body__visibility__account__calendar
                "
            >
                <div
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__title
                    "
                >
                    <ACheck
                        :value="pagesInCalendarConfig.visible"
                        @change="updatePagesInCalendarVisibility($event)"
                    />
                    <div
                        class="
                            calendar-settings-modal__body__visibility__account__calendar__title__text
                        "
                        @click="
                            updatePagesInCalendarVisibility(
                                !pagesInCalendarConfig.visible,
                            )
                        "
                    >
                        Pages
                    </div>
                </div>
                <button
                    ref="pagesInCalendarColorPicker"
                    :style="{
                        background: computeColorHex(
                            pagesInCalendarConfig.acreomColorId,
                        ),
                    }"
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__color
                    "
                    @click="onPagesInCalendarColorPickerHandler"
                ></button>
            </div>
        </div>
        <div v-if="!$accessControl.readOnlyAccess">
            <div
                v-for="integration in gCalIntegrations"
                :key="integration.id"
                class="calendar-settings-modal__body__visibility__account"
            >
                <div
                    class="
                        calendar-settings-modal__body__visibility__account__title-wrapper
                    "
                >
                    <div
                        class="
                            calendar-settings-modal__body__visibility__account__title
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
                            calendar-settings-modal__body__visibility__account__toggle-all
                        "
                        @click="toggleSelectAll(integration.id)"
                    >
                        {{
                            allCalendarsSelected(integration.id) ? 'Uns' : 'S'
                        }}elect all
                    </button>
                </div>
                <div
                    v-for="(
                        calendar, index
                    ) in integration.data.calendars.filter(
                        cal => !cal.isAcreom,
                    )"
                    :key="calendar.id"
                    class="
                        calendar-settings-modal__body__visibility__account__calendar
                    "
                >
                    <div
                        class="
                            calendar-settings-modal__body__visibility__account__calendar__title
                        "
                    >
                        <ACheck
                            :value="calendar.selected"
                            @change="
                                updateCalendarVisibility(
                                    $event,
                                    calendar.id,
                                    integration.id,
                                )
                            "
                        />
                        <div
                            class="
                                calendar-settings-modal__body__visibility__account__calendar__title__text
                            "
                            @click="
                                updateCalendarVisibility(
                                    !calendar.selected,
                                    calendar.id,
                                    integration.id,
                                )
                            "
                        >
                            {{ calendar.summary }}
                        </div>
                    </div>
                    <button
                        :ref="`colorPickerButtonGoogle_${integration.id}`"
                        :style="{
                            background: calendar.acreomColorId
                                ? computeColorHex(calendar.acreomColorId)
                                : calendar.displayColor ||
                                  calendar.backgroundColor,
                        }"
                        class="
                            calendar-settings-modal__body__visibility__account__calendar__color
                        "
                        @click="
                            onColorPickerHandler(
                                index,
                                calendar,
                                integration.id,
                                'Google',
                            )
                        "
                    ></button>
                </div>
            </div>
        </div>
        <div
            v-for="(integration, index) in icsIntegrations"
            :key="integration.id"
            class="calendar-settings-modal__body__visibility__account"
        >
            <div
                class="
                    calendar-settings-modal__body__visibility__account__title
                "
            >
                {{ integration.data.calendar.name }}
            </div>
            <div
                class="
                    calendar-settings-modal__body__visibility__account__calendar
                "
            >
                <div
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__title
                    "
                >
                    <ACheck
                        :value="integration.data.calendar.state === 'visible'"
                        @change="
                            updateICSCalendarVisibility(
                                $event,
                                integration.data.calendar.id,
                                integration.id,
                            )
                        "
                    />
                    <div
                        class="
                            calendar-settings-modal__body__visibility__account__calendar__title__text
                        "
                        @click="
                            updateICSCalendarVisibility(
                                integration.data.calendar.state !== 'visible',
                                integration.data.calendar.id,
                                integration.id,
                            )
                        "
                    >
                        {{ integration.data.calendar.name }}
                    </div>
                </div>
                <button
                    :ref="`colorPickerButtonIcs_${integration.id}`"
                    :style="{
                        background: integration.data.calendar.acreomColorId
                            ? computeColorHex(
                                  integration.data.calendar.acreomColorId,
                              )
                            : integration.data.calendar.displayColor ||
                              integration.data.calendar.color,
                    }"
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__color
                    "
                    @click="
                        onColorPickerHandler(
                            0,
                            integration.data.calendar,
                            integration.id,
                            'Ics',
                        )
                    "
                ></button>
            </div>
        </div>
        <div
            v-for="integration in appleCalendarIntegrations"
            :key="integration.id"
            class="calendar-settings-modal__body__visibility__account"
        >
            <div
                class="
                    calendar-settings-modal__body__visibility__account__title-wrapper
                "
            >
                <div
                    class="
                        calendar-settings-modal__body__visibility__account__title
                    "
                >
                    {{ integration.data.name }}
                    <InterfaceAlertWarningTriangle
                        v-if="integration.data.access !== 3"
                        size="12"
                        class="icon has-tippy"
                        data-tippy-content="<div class='tooltip'>Apple Calendar requires full access to function properly</div>"
                        @click.native="openSystemPreferences"
                    />
                    <LoadingIcon
                        v-else-if="integration.data.state === 'loading'"
                        size="12"
                        class="icon"
                    />
                </div>
                <button
                    class="
                        calendar-settings-modal__body__visibility__account__toggle-all
                    "
                    @click="toggleSelectAll(integration.id)"
                >
                    {{
                        allCalendarsSelected(integration.id) ? 'Uns' : 'S'
                    }}elect all
                </button>
            </div>
            <div
                v-for="(calendar, index) in integration.data.calendars"
                :key="calendar.id"
                class="
                    calendar-settings-modal__body__visibility__account__calendar
                "
            >
                <div
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__title
                    "
                >
                    <ACheck
                        :value="calendar.selected"
                        @change="
                            updateCalendarVisibility(
                                $event,
                                calendar.id,
                                integration.id,
                            )
                        "
                    />
                    <div
                        class="
                            calendar-settings-modal__body__visibility__account__calendar__title__text
                        "
                        @click="
                            updateCalendarVisibility(
                                !calendar.selected,
                                calendar.id,
                                integration.id,
                            )
                        "
                    >
                        {{ calendar.name }}
                    </div>
                </div>
                <button
                    :ref="`colorPickerButtonApple_${integration.id}`"
                    :style="{
                        background: calendar.acreomColorId
                            ? computeColorHex(calendar.acreomColorId)
                            : calendar.displayColor,
                    }"
                    class="
                        calendar-settings-modal__body__visibility__account__calendar__color
                    "
                    @click="
                        onColorPickerHandler(
                            index,
                            calendar,
                            integration.id,
                            'Apple',
                        )
                    "
                ></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AColorPicker from '~/components/system/AColorPicker.vue';
import { APP_COLORS, Color, IntegrationType } from '~/constants';
import { IVault } from '~/workers/database/indexeddb/types';
import ACheck from '~/components/system/ACheck/ACheck.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { ThemeOptions } from '~/helpers/date';
import InterfaceAlertWarningTriangle from '~/components/streamline/InterfaceAlertWarningTriangle.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'CalendarVisibilitySettings',
    components: {
        InterfaceAlertWarningTriangle,
        ACheck,
        LoadingIcon,
    },
})
export default class CalendarVisibilitySettings extends Vue {
    @Prop()
    vault!: IVault;

    @Prop()
    source!: TrackingActionSource;

    $refs!: {
        colorPickerButtonIcs: HTMLButtonElement[];
        colorPickerButtonGoogle: HTMLButtonElement[];
        defaultCalendarColorPicker: HTMLButtonElement;
        tasksInCalendarColorPicker: HTMLButtonElement;
        pagesInCalendarColorPicker: HTMLButtonElement;
    };

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

    get appleCalendarIntegrations() {
        return this.integrations.filter(
            integration => integration.type === IntegrationType.APPLE_CALENDAR,
        );
    }

    computeColorHex(color: Color) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];

        return APP_COLORS[color][theme].COLOR;
    }

    updateTasksInCalendarVisibility(value: boolean) {
        const vaultId = this.vault.id;
        this.$store.dispatch('vaultSettings/updateTasksInCalendarConfig', {
            vaultId,
            value: { visible: value },
        });
        if (!this.source) return;
        if (value) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.SHOW_TASKS,
                source: this.source,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.HIDE_TASKS,
                source: this.source,
            });
        }
    }

    updatePagesInCalendarVisibility(value: boolean) {
        const vaultId = this.vault.id;
        this.$store.dispatch('vaultSettings/updatePagesInCalendarConfig', {
            vaultId,
            value: { visible: value },
        });
        if (!this.source) return;
        if (value) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.SHOW_PAGES,
                source: this.source,
            });
        } else {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.HIDE_PAGES,
                source: this.source,
            });
        }
    }

    updateICSCalendarVisibility(
        value: boolean,
        calendarId: string,
        integrationId: string,
    ) {
        this.$store.dispatch('integration/updateCalendar', {
            calendar: { id: calendarId, state: value ? 'visible' : 'hidden' },
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

    onColorPickerHandler(
        index: number,
        calendar: any,
        integrationId: string,
        integrationType: 'Ics' | 'Google' | 'Apple', // TODO: we have types for this
    ) {
        this.$dropdown.show({
            // @ts-ignore
            parent: this.$refs[
                `colorPickerButton${integrationType}_${integrationId}`
            ][index],
            component: AColorPicker,
            bind: {
                colors: APP_COLORS,
                value:
                    calendar?.acreomColorId ||
                    calendar?.displayColor ||
                    calendar?.backgroundColor,
            },
            on: {
                select: (value: Color) => {
                    this.$store.dispatch('integration/updateCalendar', {
                        calendar: { id: calendar.id, acreomColorId: value },
                        integrationId,
                    });
                },
            },
            popperOptions: {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [11, 0],
                        },
                    },
                ],
            },
        });
    }

    onPagesInCalendarColorPickerHandler() {
        this.$dropdown.show({
            // @ts-ignore
            parent: this.$refs.pagesInCalendarColorPicker,
            component: AColorPicker,
            bind: {
                colors: APP_COLORS,
                value: this.pagesInCalendarConfig.acreomColorId,
            },
            on: {
                select: (value: Color) => {
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
            popperOptions: {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [11, 0],
                        },
                    },
                ],
            },
        });
    }

    onTasksInCalendarColorPickerHandler() {
        this.$dropdown.show({
            // @ts-ignore
            parent: this.$refs.tasksInCalendarColorPicker,
            component: AColorPicker,
            bind: {
                colors: APP_COLORS,
                value: this.tasksInCalendarConfig.acreomColorId,
            },
            on: {
                select: (value: Color) => {
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
            popperOptions: {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [11, 0],
                        },
                    },
                ],
            },
        });
    }

    openSystemPreferences() {
        this.$vfm.show({
            component: () =>
                import('@/components/modal/AppleCalendarPermissions.vue'),
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
        integration.data.calendars.forEach((calendar: any) => {
            this.updateCalendarVisibility(
                toggleValue,
                calendar.id,
                integrationId,
            );
        });
        this.$tracking.trackEventV2(TrackingType.CALENDAR, {
            action: toggleValue
                ? TrackingAction.SELECT_ALL_CALENDARS
                : TrackingAction.UNSELECT_ALL_CALENDARS,
            source: this.source,
            sourceMeta: this.$tracking.resolveCalendarType(integration.type),
        });
    }
}
</script>

<style lang="scss" scoped>
.calendar-settings-modal__body__visibility {
    &__account {
        &:not(:last-of-type) {
            margin-bottom: 8px;
        }

        &__title-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        &__toggle-all {
            @include font12-500;

            color: var(--calendar-visibility-text-color);

            &:hover {
                color: var(--calendar-visibility-title-text-color__hover);
            }
        }

        &__title {
            font-weight: 500;
            font-size: 13px;
            line-height: 25px;
            color: var(--calendar-visibility-text-color);

            display: flex;
            align-items: center;

            .a-check {
                flex-shrink: 0;
            }

            .icon {
                margin-left: 8px;
            }

            p {
                @include ellipsis;
            }
        }

        &__calendar {
            &:not(:last-of-type) {
                margin-bottom: 8px;
            }

            display: flex;
            justify-content: space-between;
            align-items: center;

            &__title {
                font-weight: 500;
                font-size: 13px;
                line-height: 155.2%;
                color: var(--calendar-visibility-title-text-color);
                display: flex;
                align-items: center;
                @include ellipsis;
                width: 100%;

                &__text {
                    @include ellipsis;

                    color: var(--calendar-visibility-title-text-color);
                    padding-right: 5px;
                    width: 100%;

                    &:hover {
                        color: var(
                            --calendar-visibility-title-text-color__hover
                        );
                    }
                }

                .a-check {
                    flex-shrink: 0;
                    margin-right: 10px;
                }
            }

            &__color {
                flex-shrink: 0;
                outline: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
            }
        }
    }
}
</style>

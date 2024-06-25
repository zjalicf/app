<template>
    <div class="">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="bottom"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="calendar-settings-modal">
            <div class="calendar-settings-modal__header">
                <div class="calendar-settings-modal__header__title">
                    Calendars
                </div>
            </div>

            <div class="calendar-settings-modal__body">
                <div class="calendar-settings-modal__body__accounts">
                    <div
                        class="calendar-settings-modal__body__accounts__header"
                    >
                        <div
                            class="
                                calendar-settings-modal__body__accounts__header__title
                            "
                        >
                            <div>Calendar Sources</div>
                            <div
                                class="
                                    calendar-settings-modal__body__accounts__header__title__sync
                                "
                            >
                                Add and manage your calendar sources
                            </div>
                        </div>
                        <button
                            ref="addCalendarButton"
                            class="
                                calendar-settings-modal__body__accounts__header__button
                            "
                            :class="{ active: buttonActive }"
                            @click="onAddCalendarHandler"
                        >
                            Add Calendar
                        </button>
                    </div>

                    <div
                        v-if="integrations.length"
                        class="calendar-settings-modal__body__accounts__body"
                    >
                        <div
                            v-for="integration in integrations"
                            :key="integration.id"
                            class="
                                calendar-settings-modal__body__accounts__body__account
                            "
                        >
                            <div
                                class="
                                    calendar-settings-modal__body__accounts__body__account__title
                                "
                            >
                                {{ sectionName(integration) }}
                                <button
                                    v-if="
                                        !loadingIcsIds.includes(
                                            integration.id,
                                        ) &&
                                        [
                                            IntegrationType.ICS_CALENDAR,
                                            'apple_calendar',
                                        ].includes(integration.type)
                                    "
                                    class="refresh"
                                    @click="triggerIntegration(integration.id)"
                                >
                                    <RefreshIcon size="20" class="icon" />
                                </button>
                                <button
                                    v-else-if="
                                        loadingIcsIds.includes(
                                            integration.id,
                                        ) &&
                                        [
                                            IntegrationType.ICS_CALENDAR,
                                            'apple_calendar',
                                        ].includes(integration.type)
                                    "
                                    class="loading"
                                >
                                    <InterfaceAlertWarningTriangle
                                        v-if="
                                            integration.type ===
                                                'apple_calendar' &&
                                            integration.data.access !== 3
                                        "
                                        size="12"
                                        class="icon has-tippy"
                                        data-tippy-content="<div class='tooltip'>Apple Calendar requires full access to function properly</div>"
                                        @click.native="openSystemPreferences"
                                    />
                                    <LoadingIcon
                                        v-else
                                        class="icon"
                                        size="12"
                                    />
                                </button>
                            </div>
                            <div
                                class="
                                    calendar-settings-modal__body__accounts__body__account__actions
                                "
                            >
                                <button
                                    @click="disconnectIntegration(integration)"
                                >
                                    <XIcon size="20" class="icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="calendar-settings-modal__body__divider"></div>
                <div class="calendar-settings-modal__body__visibility">
                    <div
                        class="
                            calendar-settings-modal__body__visibility__header
                        "
                    >
                        <div
                            class="
                                calendar-settings-modal__body__visibility__header__title
                            "
                        >
                            Display
                        </div>
                        <div
                            class="
                                calendar-settings-modal__body__visibility__header__subtitle
                            "
                        >
                            Select which calendars should be visible in app
                        </div>
                    </div>
                    <div
                        class="
                            calendar-settings-modal__body__visibility__wrapper
                        "
                    >
                        <CalendarVisibilitySettings
                            :vault="vault"
                            :source="TrackingActionSource.SETTINGS"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    RefreshIcon,
    XIcon,
} from '@vue-hero-icons/solid';
import CButton from '@/components/CButton.vue';
import NewCalendarDropdown from '~/components/settings/NewCalendarDropdown.vue';
import CalendarVisibilitySettings from '~/components/calendar/CalendarVisibilitySettings.vue';
import {
    APP_COLORS,
    Color,
    IntegrationsActions,
    IntegrationType,
    ServiceKey,
} from '~/constants';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { ThemeOptions } from '~/helpers/date';
import InterfaceAlertWarningTriangle from '~/components/streamline/InterfaceAlertWarningTriangle.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'VaultCalendarSettings',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        InterfaceAlertWarningTriangle,
        LoadingIcon,
        CalendarVisibilitySettings,
        CButton,
        XIcon,
        RefreshIcon,
        ChevronUpIcon,
        ChevronDownIcon,
    },
})
export default class VaultCalendarSettings extends Vue {
    defaultCalendarButtonActive: boolean = false;
    buttonActive: boolean = false;
    loadingIcsIds: string[] = [];

    $refs!: {
        addCalendarButton: HTMLElement;
        picker: HTMLElement;
    };

    get IntegrationType() {
        return IntegrationType;
    }

    sectionName(integration: any) {
        return (
            integration.data.googleAccountEmail ??
            integration.data.name ??
            integration.data.calendar?.name
        );
    }

    get value() {
        const vaultId = this.$store.getters['vault/active'].id;
        const activeVault = this.$store.getters['vault/byId'](vaultId);
        if (this.$accessControl.readOnlyAccess) {
            return {
                ...this.$store.getters['vaultSettings/defaultCalendar'],
                name: activeVault.name || 'Untitled',
            };
        }

        const { calendarId, integrationId } =
            this.$store.getters['vault/defaultCalendar'];

        return (
            this.$store.getters['integration/calendarById'](
                calendarId,
                integrationId,
            ) || {
                ...this.$store.getters['vaultSettings/defaultCalendar'],
                name: activeVault.name || 'Untitled',
            }
        );
    }

    computeColorHex(color: Color) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];

        return APP_COLORS[color][theme].COLOR;
    }

    get writeableIntegrations() {
        const type = IntegrationType.GOOGLE_CALENDAR;
        return this.$store.getters['integration/byType'](type);
    }

    get vault() {
        return this.$store.getters['vault/active'];
    }

    triggerIntegration(id: string) {
        this.loadingIcsIds.push(id);

        setTimeout(() => {
            this.loadingIcsIds = this.loadingIcsIds.filter(_id => id !== _id);
        }, 2000);

        const vaultId = this.vault.id;
        this.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            IntegrationsActions.MANUAL_RUN,
            { id, vaultId },
        );
    }

    async disconnectIntegration(integration: any) {
        await this.$store.dispatch('integration/delete', integration);
        const calendarType = this.$tracking.resolveCalendarType(
            integration.type,
        );
        this.$tracking.trackEventV2(TrackingType.CALENDAR, {
            action: TrackingAction.REMOVE_CALENDAR,
            sourceMeta: calendarType,
        });
    }

    onAddCalendarHandler() {
        this.buttonActive = true;

        this.$dropdown.show({
            component: NewCalendarDropdown,
            bind: {
                vault: this.vault,
            },
            parent: this.$refs.addCalendarButton,
            popperOptions: {
                placement: 'bottom-end',
            },
            onClose: () => {
                this.buttonActive = false;
            },
        });
    }

    get integrations() {
        return (this.$store.getters['integration/list'] as any[]).filter(
            integration =>
                [
                    IntegrationType.ICS_CALENDAR,
                    IntegrationType.GOOGLE_CALENDAR,
                    IntegrationType.APPLE_CALENDAR,
                ].includes(integration.type) &&
                (!this.$accessControl.readOnlyAccess ||
                    integration.type !== IntegrationType.GOOGLE_CALENDAR),
        );
    }

    @Watch('integrations')
    onIntegrationsUpdated(newValue: any[], oldValue: any[]) {
        if (newValue.length <= oldValue.length) return;
        const oldIds = oldValue.map(integration => integration.id);
        const newIds = newValue.map(integration => integration.id);
        const changedId = oldIds
            .filter(x => !newIds.includes(x))
            .concat(newIds.filter(x => !oldIds.includes(x)));
        const changedIntegration = newValue.find(
            integration => integration.id === changedId[0],
        );
        if (
            changedIntegration &&
            changedIntegration.type === IntegrationType.GOOGLE_CALENDAR
        ) {
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.ADD_CALENDAR,
                sourceMeta: TrackingActionSourceMeta.GOOGLE_CALENDAR,
            });
        }
    }

    openSystemPreferences() {
        this.$vfm.show({
            component: () =>
                import('@/components/modal/AppleCalendarPermissions.vue'),
        });
    }
}
</script>

<style lang="scss" scoped>
.calendar-settings-modal {
    margin: 0 auto;
    cursor: default;
    user-select: none;

    &__header {
        display: flex;
        align-items: center;
        padding: 30px 30px 0;
        justify-content: space-between;
        margin-bottom: 20px;

        &__title {
            @include font14-600;
            color: var(--settings-modal-title-color);
        }
    }

    &__body {
        &__default-calendar {
            padding: 0 30px;

            &__title {
                @include font12-600;
                color: var(--settings-modal-title-color);
            }

            &__subtitle {
                @include font12-500;
                margin-top: 4px;
                color: var(--settings-modal-option-description-color);
            }

            &__picker {
                @include font12-500;
                outline: none;
                margin-top: 18px;
                padding: 4px 10px;
                background: var(--settings-modal-calendar-picker-bg-color);
                border-radius: 6px;
                color: var(--settings-modal-calendar-picker);
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 252px;

                &__value {
                    display: flex;
                    align-items: center;

                    p {
                        max-width: 200px;
                        @include ellipsis;
                    }
                }

                &__arrow {
                    .icon {
                        @include animateBackgroundColor;
                        color: var(--settings-modal-calendar-picker-icon-color);
                    }
                }

                &:hover,
                &.active {
                    background: var(
                        --settings-modal-calendar-picker-bg-color__hover
                    );

                    .icon {
                        color: var(
                            --settings-modal-calendar-picker-icon-color__hover
                        );
                    }
                }

                span {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                    margin-right: 8px;
                }
            }
        }

        &__accounts {
            border-radius: 6px;
            padding: 0 30px;
            margin: 8px 0 0;

            &__header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                &__title {
                    @include font12-600;
                    color: var(--settings-modal-title-color);

                    &__sync {
                        @include font12-500;
                        margin-top: 4px;
                        color: var(--settings-modal-option-description-color);
                    }
                }

                &__button {
                    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
                    border-radius: 6px;
                    padding: 5px 11px;
                    @include font12-500;
                    color: var(--settings-modal-button-primary-text-color);
                    background: var(--settings-modal-button-primary-bg-color);
                    outline: none;

                    &:hover,
                    &.active {
                        background: var(
                            --settings-modal-button-primary-bg-color__hover
                        );
                        color: var(
                            --settings-modal-button-primary-text-color__hover
                        );
                    }

                    .icon {
                        margin-right: 4px;
                    }
                }
            }

            &__body {
                margin-top: 18px;
                background: var(--settings-modal-notifications-bg-color);
                border-radius: 10px;
                padding: 12px 12px 12px 16px;

                &__account {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    &__title {
                        @include font12-500;
                        color: var(--settings-modal-title-color);
                        display: flex;
                        align-items: center;

                        button {
                            outline: none;
                            color: var(
                                --settings-modal-calendar-remove-button-color
                            );

                            &:not(.loading) {
                                padding: 4px;

                                &:hover {
                                    color: var(
                                        --settings-modal-calendar-remove-button-color__hover
                                    );
                                }
                            }

                            margin-left: 4px;
                        }
                    }

                    &__actions {
                        display: flex;
                        align-items: center;

                        button {
                            outline: none;
                            color: var(
                                --settings-modal-calendar-remove-button-color
                            );

                            &:not(.loading) {
                                padding: 4px;

                                &:hover {
                                    color: var(
                                        --settings-modal-calendar-remove-button-color__hover
                                    );
                                }
                            }

                            &.refresh {
                                margin-right: 6px;
                            }
                        }
                    }
                }
            }
        }

        &__divider {
            margin: 18px 30px 18px;
            height: 1px;
            background: var(--tab-divider-color);
        }

        &__visibility {
            padding: 0 30px 30px;

            &__wrapper {
                margin-top: 18px;
                background: var(--settings-modal-notifications-bg-color);
                border-radius: 10px;
                padding: 12px 16px;
            }

            &__header {
                margin-bottom: 7px;

                &__title {
                    @include font12-600;
                    color: var(--settings-modal-title-color);
                }

                &__subtitle {
                    @include font12-500;
                    margin-top: 4px;
                    color: var(--settings-modal-option-description-color);
                }
            }
        }
    }
}
</style>

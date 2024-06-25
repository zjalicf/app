<template>
    <div class="preferences">
        <div v-if="!$utils.isMobile" class="preferences__title">
            Preferences
        </div>
        <div class="preferences--wrapper">
            <label
                v-if="!$utils.isMobile"
                class="preferences--wrapper--spellcheck"
                :class="{ mobile: $utils.isMobile }"
            >
                <div class="preferences--wrapper--spellcheck--title">
                    Spellcheck
                </div>
                <div class="preferences--wrapper-spellcheck--toggle">
                    <CSwitch
                        :value="
                            $store.getters['appSettings/editorOptions']
                                .spellcheck
                        "
                        @input="updateSpellcheck"
                    />
                </div>
            </label>
            <label
                v-if="!$utils.isMobile"
                :class="{ mobile: $utils.isMobile }"
                class="preferences--wrapper--spellcheck"
            >
                <div class="preferences--wrapper--spellcheck--title">
                    Show Completed Tasks In Agenda
                </div>
                <div class="preferences--wrapper-spellcheck--toggle">
                    <CSwitch
                        id="dailyDocDateSuggestion"
                        :value="
                            $store.getters['appSettings/editorOptions']
                                .agendaShowCompleted
                        "
                        @input="updateDailyDocDateSuggestion"
                    />
                </div>
            </label>
            <div
                :class="{ mobile: $utils.isMobile }"
                class="preferences--wrapper--weekdays"
            >
                <div class="preferences--wrapper--weekdays--title">
                    Display Time Format
                </div>
                <div class="preferences--wrapper--weekdays--select">
                    <ASelect
                        :items="timeFormatOptions"
                        :value="
                            $store.getters['appSettings/dateTimeOptions']
                                .timeFormat
                        "
                        :width="125"
                        check-placement="end"
                        @change="updateTimeFormat"
                    />
                </div>
            </div>
            <div class="preferences--wrapper--weekdays">
                <div class="preferences--wrapper--weekdays--title">
                    Date Format
                </div>
                <div class="preferences--wrapper--weekdays--select">
                    <ASelect
                        :items="dateFormatOptions"
                        :value="
                            $store.getters['appSettings/dateTimeOptions']
                                .dateFormat
                        "
                        :width="125"
                        check-placement="end"
                        @change="updateDateFormat"
                    />
                </div>
            </div>
            <div v-if="!$utils.isMobile" class="preferences--wrapper--weekdays">
                <div class="preferences--wrapper--weekdays--title">
                    Start Week on
                </div>
                <div class="preferences--wrapper--weekdays--select">
                    <ASelect
                        :items="weekdayOptions"
                        :value="
                            $store.getters['appSettings/calendarOptions']
                                .weekdayStart
                        "
                        :width="125"
                        check-placement="end"
                        @change="updateWeekdayStart"
                    />
                </div>
            </div>
            <label
                v-if="$config.platform === 'desktop'"
                class="preferences--wrapper--tray"
            >
                <div
                    class="
                        preferences--wrapper--tray--title
                        preferences--wrapper--tray--title__has-tooltip
                    "
                >
                    Enable Quick Capture
                </div>
                <div class="preferences--wrapper-tray--toggle">
                    <CSwitch
                        id="quick-capture"
                        :value="
                            $store.getters['appSettings/quickCaptureOptions']
                                .allowQuickCapture
                        "
                        @input="updateQuickCapture"
                    />
                </div>
            </label>
            <label
                v-if="$config.platform === 'desktop' && $config.os !== 'linux'"
                class="preferences--wrapper--tray"
            >
                <div class="preferences--wrapper--tray--title">
                    Keep acreom in Tray
                </div>
                <div class="preferences--wrapper-tray--toggle">
                    <CSwitch
                        :value="
                            $store.getters['appSettings/platformOptions']
                                .windowsTray
                        "
                        @input="updateTray"
                    />
                </div>
            </label>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DateFormat, TimeFormat } from '~/helpers/date';
import CSwitch from '~/components/CSwitch.vue';
import { EditorNarrowIcon, EditorWideIcon } from '~/components/icons';
import { SafeElectronWindow } from '~/@types';
import ASelect from '~/components/ASelect.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'Preferences',
    components: {
        ASelect,
        CSwitch,
        EditorNarrowIcon,
        EditorWideIcon,
    },
})
export default class Preferences extends Vue {
    weekdayOptions: any = [
        {
            id: 0,
            label: 'Sunday',
        },
        {
            id: 1,
            label: 'Monday',
        },
        {
            id: 2,
            label: 'Tuesday',
        },
        {
            id: 3,
            label: 'Wednesday',
        },
        {
            id: 4,
            label: 'Thursday',
        },
        {
            id: 5,
            label: 'Friday',
        },
        {
            id: 6,
            label: 'Saturday',
        },
    ];

    timeFormatOptions: any = [
        {
            id: TimeFormat.HOUR_12,
            label: 'AM/PM',
        },
        {
            id: TimeFormat.HOUR_24,
            label: '24 Hour',
        },
    ];

    dateFormatOptions: any = [
        {
            id: DateFormat.EU,
            label: 'DD/MM/YYYY',
        },
        {
            id: DateFormat.US,
            label: 'MM/DD/YYYY',
        },
    ];

    get isWindows() {
        return this.$config.os === 'windows';
    }

    updateWeekdayStart(value: number) {
        this.$store.dispatch('appSettings/updateCalendarOptions', {
            weekdayStart: value,
        });
    }

    updateTimeFormat(value: TimeFormat) {
        this.$store.dispatch('appSettings/updateDateTimeOptions', {
            timeFormat: value,
        });
    }

    updateDateFormat(value: DateFormat) {
        this.$store.dispatch('appSettings/updateDateTimeOptions', {
            dateFormat: value,
        });
    }

    updateDailyDocDateSuggestion(value: boolean) {
        const action = value
            ? TrackingAction.SHOW_COMPLETED_TASKS_IN_AGENDA
            : TrackingAction.HIDE_COMPLETED_TASKS_IN_AGENDA;

        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action,
        });

        this.$store.dispatch('appSettings/updateEditorOptions', {
            agendaShowCompleted: value,
        });
    }

    updateSpellcheck(value: boolean) {
        this.$store.dispatch('appSettings/updateEditorOptions', {
            spellcheck: value,
        });
    }

    updateTray(value: boolean) {
        (window as SafeElectronWindow)?.electron?.setTray?.(value);
        this.$store.dispatch('appSettings/updatePlatformOptions', {
            windowsTray: value,
        });
    }

    updateQuickCapture(value: boolean) {
        const action = value
            ? TrackingAction.ENABLE_QUICK_CAPTURE
            : TrackingAction.DISABLE_QUICK_CAPTURE;

        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action,
        });

        this.$store.dispatch('appSettings/updateQuickCaptureOptions', {
            allowQuickCapture: value,
        });
    }
}
</script>

<style lang="scss" scoped>
.preferences {
    color: var(--settings-modal-title-color);
    user-select: none;
    cursor: default;
    padding: 30px;

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
    }

    &--wrapper {
        margin-top: 20px;

        &__title {
            @include font12-600;
        }

        & &--weekdays {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;

            &--select {
                width: 125px;
            }

            &--title {
                @include font12-600;
            }
        }

        &--default-tags {
            margin-top: 5px;
            padding-top: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        &--spellcheck {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &--title {
                @include font12-600;
                color: var(--settings-modal-title-color);
            }
        }

        &--tray {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &--title {
                @include font12-600;

                &__has-tooltip {
                    display: grid;
                    grid-template-columns: 0.6fr 0.8fr;
                    justify-content: flex-start;
                    width: 100%;
                }

                &--tooltip {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
            }
        }

        &--editor {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;

            &--buttons {
                display: flex;
                flex-direction: column;
                align-content: center;
                align-items: center;
                justify-content: center;
                margin-top: 10px;
                font-weight: 400;
                font-size: 13px;
                line-height: 18px;

                &--text {
                    @include font12-500;
                    color: var(--settings-modal-preferences-button-text);

                    &.has-focus {
                        color: var(
                            --settings-modal-preferences-button-text__active
                        );
                    }
                }

                &--button {
                    @include font12-500;
                    outline: none;
                    margin-bottom: 5px;
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    align-items: center;
                    flex-direction: column;
                    border-radius: 9px;
                    cursor: default;
                    width: 130px;
                    height: 110px;
                    background: var(
                        --settings-modal-preferences-button-bg-color
                    );

                    .icon {
                        margin-bottom: 2px;
                        color: var(
                            --settings-modal-preferences-button-icon-color
                        );
                    }

                    &:hover {
                        .icon {
                            color: var(
                                --settings-modal-preferences-button-icon-color__hover
                            );
                        }
                    }

                    &.has-focus {
                        background: var(
                            --settings-modal-preferences-button-bg-color__active
                        );
                        user-select: none;
                        border: 2px solid var(--accent-color);

                        .icon {
                            color: var(
                                --settings-modal-preferences-button-icon-color__active
                            );
                        }
                    }
                }
            }
        }
    }
}
</style>

<template>
    <div class="preferences">
        <MobileSettingsSection>
            <template #title>Display</template>
            <template #buttons>
                <MobileSettingsButton @click="onSelectTimeFormat">
                    <div class="mobile-settings-button__title">Time Format</div>
                    <div class="mobile-settings-button__value">
                        {{ timeFormat }}
                        <AcreomChevronDown
                            class="mobile-settings-button__icon"
                        />
                    </div>
                </MobileSettingsButton>
                <MobileSettingsButton @click="onSelectDateFormat">
                    <div class="mobile-settings-button__title">Date Format</div>
                    <div class="mobile-settings-button__value">
                        {{ dateFormat }}
                        <AcreomChevronDown
                            class="mobile-settings-button__icon"
                        />
                    </div>
                </MobileSettingsButton>
            </template>
        </MobileSettingsSection>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { DateFormat, TimeFormat } from '~/helpers/date';
import DropdownPane from '~/components/mobile/preferences/panes/DropdownPane.vue';
import MobileSettingsSection from '~/components/mobile/preferences/navigation/MobileSettingsSection.vue';
import MobileSettingsButton from '~/components/mobile/preferences/navigation/MobileSettingsButton.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import AcreomChevronDown from '~/components/icons/AcreomChevronDown.vue';

@Component({
    name: 'MobilePreferences',
    components: {
        AcreomChevronDown,
        AcreomChevronRight,
        MobileSettingsButton,
        MobileSettingsSection,
    },
})
export default class MobilePreferences extends Vue {
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

    get dateFormat() {
        return this.dateFormatOptions.find(
            (option: any) =>
                option.id ===
                this.$store.getters['appSettings/dateTimeOptions'].dateFormat,
        ).label;
    }

    get timeFormat() {
        return this.timeFormatOptions.find(
            (option: any) =>
                option.id ===
                this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        ).label;
    }

    onSelectTimeFormat() {
        this.$pane.show({
            component: DropdownPane,
            bind: {
                title: 'Display Time Format',
                options: this.timeFormatOptions,
                value: this.$store.getters['appSettings/dateTimeOptions']
                    .timeFormat,
            },
            on: {
                select: (value: string) => {
                    this.$pane.hide();
                    this.$store.dispatch('appSettings/updateDateTimeOptions', {
                        timeFormat: value,
                    });
                },
            },
            type: 'picker',
            options: {
                fitHeight: true,
            },
        });
    }

    onSelectDateFormat() {
        this.$pane.show({
            component: DropdownPane,
            bind: {
                title: 'Date Format',
                options: this.dateFormatOptions,
                value: this.$store.getters['appSettings/dateTimeOptions']
                    .dateFormat,
            },
            on: {
                select: (value: string) => {
                    this.$pane.hide();
                    this.$store.dispatch('appSettings/updateDateTimeOptions', {
                        dateFormat: value,
                    });
                },
            },
            type: 'picker',
            options: {
                fitHeight: true,
            },
        });
    }
}
</script>

<style lang="scss" scoped>
.preferences {
    color: var(--settings-modal-title-color);
    user-select: none;
    cursor: default;
    padding: 18px;

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
    }

    &--wrapper {
        margin-top: 20px;

        &__title {
            @include font12-600;
        }

        &--weekdays {
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
    }
}
</style>

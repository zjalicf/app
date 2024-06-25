<template>
    <div class="notifications-default-tasks-setting">
        <div
            class="notifications-default-tasks-setting__title"
            :title="vaultName"
        >
            <p>{{ vaultName }} (Tasks)</p>
        </div>
        <CDropDownSimple
            ref="dropDown"
            position="right"
            :read-only-disable="true"
        >
            <template #default>
                <button>{{ valueText }}</button>
            </template>
            <template #dropdown="{ close }">
                <div class="notifications-default-tasks-setting__dropdown">
                    <button
                        :class="{ active: defaultReminderValue === null }"
                        @click="updateDefaultReminderValue(null, close)"
                    >
                        <CheckIcon class="icon" size="20" />
                        <div>No alert</div>
                    </button>
                    <button
                        :class="{ active: defaultReminderValue === 0 }"
                        @click="updateDefaultReminderValue(0, close)"
                    >
                        <CheckIcon class="icon" size="20" />
                        <div>At start of event</div>
                    </button>
                    <button
                        :class="{ active: defaultReminderValue === 5 }"
                        @click="updateDefaultReminderValue(5, close)"
                    >
                        <CheckIcon class="icon" size="20" />
                        <div>5 min <span> before</span></div>
                    </button>
                    <button
                        :class="{ active: defaultReminderValue === 10 }"
                        @click="updateDefaultReminderValue(10, close)"
                    >
                        <CheckIcon class="icon" size="20" />
                        <div>10 min <span> before</span></div>
                    </button>
                    <button
                        :class="{ active: defaultReminderValue === 30 }"
                        @click="updateDefaultReminderValue(30, close)"
                    >
                        <CheckIcon class="icon" size="20" />
                        <div>30 min <span> before</span></div>
                    </button>
                    <button
                        :class="{ active: defaultReminderValue === 60 }"
                        @click="updateDefaultReminderValue(60, close)"
                    >
                        <CheckIcon class="icon" size="20" />
                        <div>1 hour <span> before</span></div>
                    </button>
                </div>
            </template>
        </CDropDownSimple>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { CheckIcon } from '@vue-hero-icons/solid';
import CDropDownSimple from '~/components/CDropDownSimple.vue';

@Component({
    name: 'NotificationDefaultTasksSetting',
    components: {
        CheckIcon,
        CDropDownSimple,
    },
})
export default class NotificationDefaultTasksSetting extends Vue {
    get tasksInCalendarConfig() {
        return this.$store.getters['vaultSettings/tasksInCalendarConfig'];
    }

    get vaultName() {
        const id = this.$store.getters['vault/active'].id;
        return this.$store.getters['vault/byId'](id).name;
    }

    get defaultReminderValue() {
        if (!this.tasksInCalendarConfig.defaultReminders.length) {
            return null;
        }

        return this.tasksInCalendarConfig.defaultReminders[0].minutes;
    }

    get valueText() {
        const value = this.defaultReminderValue;
        if (value === null) return 'No alert';
        if (value === 0) return 'At start of event';
        if (value === 60) return '1 hour before';
        return `${value} min before`;
    }

    updateDefaultReminderValue(val: number | null, close: any) {
        close();

        const vaultId = this.$store.getters['vault/active'].id;

        if (val === null) {
            this.$store.dispatch('vaultSettings/updateTasksInCalendarConfig', {
                vaultId,
                value: {
                    defaultReminders: [],
                },
            });

            return;
        }

        this.$store.dispatch('vaultSettings/updateTasksInCalendarConfig', {
            vaultId,
            value: {
                defaultReminders: [{ method: 'popup', minutes: val }],
            },
        });
    }
}
</script>

<style lang="scss" scoped>
.notifications-default-tasks-setting {
    :deep(.c-select--menu) {
        padding: 0px;
    }

    :deep(.c-select--selected) {
        padding: 4px 8px;
        justify-content: flex-end;
    }
}
.notifications-default-tasks-setting {
    display: grid;
    grid-template-columns: 325px 130px;
    align-items: center;

    &__title {
        font-weight: 500;
        font-size: 13px;
        line-height: 155.2%;
        color: var(--settings-modal-title-color);
        p {
            @include ellipsis;
        }
    }

    button {
        outline: none;
    }

    &__dropdown {
        width: 180px;

        button {
            @include font12-500;
            display: flex;
            align-items: center;
            padding: 5px;
            width: 100%;

            span {
                color: var(--settings-modal-notifications-dropdown-span-color);
            }

            .icon {
                display: none;
                margin-right: 6px;
            }

            &:not(.active) {
                padding-left: 31px;
            }

            &.active {
                .icon {
                    display: block;
                }
            }

            &:hover {
                background: var(
                    --settings-modal-notifications-dropdown-bg-color__hover
                );
                border: 2px solid var(--accent-color);
                border-radius: 8px;
                padding: 3px;

                &:not(.active) {
                    padding-left: 29px;
                }

                span {
                    color: var(
                        --settings-modal-notifications-dropdown-span-color__hover
                    );
                }
            }
        }
    }
}
</style>

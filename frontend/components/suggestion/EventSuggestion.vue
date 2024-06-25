<template>
    <div :class="{ active, quickadd: !icon }" class="event-suggestion">
        <div v-if="icon" class="event-suggestion--icon">
            <CalendarIcon size="20" class="icon" />
        </div>
        <div class="event-suggestion--text" :class="!icon ? 'no-icon' : null">
            <div class="event-suggestion--text--title">
                <p :class="{ narrow: icon }">{{ text }}</p>
            </div>
            <div v-if="showDate" class="event-suggestion--text--time">
                {{ dateString }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { CalendarIcon } from '@vue-hero-icons/solid';
import { formatRelativeToDate } from '~/helpers';

@Component({
    components: {
        CalendarIcon,
    },
})
export default class Suggestion extends Vue {
    @Prop({ default: '' })
    text!: string;

    @Prop({ default: false })
    active!: boolean;

    @Prop({ default: '' })
    date!: any;

    @Prop({ default: true })
    icon!: boolean;

    @Prop({ default: true })
    showDate!: boolean;

    get dateString() {
        const now = new Date();
        return formatRelativeToDate(
            this.date,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }
}
</script>

<style scoped lang="scss">
.event-suggestion {
    display: flex;
    align-items: flex-start;
    padding: 5px 14px 5px;
    cursor: default;

    &.quickadd {
        //margin: 0px 6px;
        padding: 5px 6px;
    }

    &.active {
        border-radius: 6px;
        padding: 3px 12px 3px;
        border: 2px solid var(--accent-color);
        background: var(--event-suggestion-bg-color__active);

        .event-suggestion--text--title,
        .event-suggestion--icon .icon {
            color: var(--suggestion-text-color) !important;
        }

        .event-suggestion--text--time {
            color: var(--suggestion-extra-color) !important;
        }

        &.quickadd {
            //margin: 0px 6px;
            padding: 3px 4px 3px;
        }
    }

    &--icon {
        margin-right: 8px;

        .icon {
            color: var(--event-suggestion-icon-color);
        }
    }

    &--text {
        &.no-icon {
            padding-left: 31px;
        }
        &--title {
            p {
                @include ellipsis;
                max-width: 490px;
                &.narrow {
                    max-width: 310px;
                }
            }
            line-height: 17px;
            font-weight: 500;
            font-size: 12px;
            color: var(--suggestion-text-color);
        }

        &--time {
            font-weight: 500;
            font-size: 12px;
            line-height: 17px;
            color: var(--event-suggestion-time-color);
        }
    }
}
</style>

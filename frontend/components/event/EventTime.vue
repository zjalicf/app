<template>
    <div class="event-time">
        <div v-if="rruleText && showDate">Repeats {{ rruleText }} since</div>
        {{ formattedTime.text }}
        <span v-if="duration">• {{ duration }}</span>
        <div v-if="rruleText && !showDate" class="event-dropdown__time__repeat">
            Repeats {{ rruleText }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IEvent } from '~/@types';

@Component({
    name: 'EventTime',
})
export default class EventTime extends Vue {
    @Prop({ required: true })
    event!: Partial<IEvent> & { startObject: any; endObject: any };

    @Prop({ default: false })
    showDate!: boolean;

    get duration() {
        return this.$utils.event.getEventDuration({
            start: this.event.startObject,
            end: this.event.endObject,
        });
    }

    get formattedTime() {
        return this.$utils.event.getEventFormattedTime(
            {
                start: this.event.startObject,
                end: this.event.endObject,
            },
            this.showDate,
        );
    }

    get rruleText() {
        return this.$utils.event.getEventRruleText({
            ...this.event,
            start: this.event.startObject,
            end: this.event.endObject,
        });
    }
}
</script>
<style lang="scss" scoped>
.event-time {
    @include font12-400;
}
</style>

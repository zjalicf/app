<template>
    <div class="timeline-current">
        <div
            class="timeline-current--click"
            @click.prevent.stop="$emit('open')"
        ></div>
        <TimelineTimed :event="event" />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { IEvent } from '~/@types';
import { ITask } from '~/components/task/model';
import TimelineTimed from '~/components/mobile/common/TimelineTimed.vue';

@Component({
    name: 'TimelineCurrentView',
    components: {
        TimelineTimed,
    },
})
export default class TimelineCurrentView extends Vue {
    @Prop({
        required: true,
    })
    event!: IEvent | ITask;
}
</script>

<style lang="scss" scoped>
.timeline {
    position: relative;

    &--overlay {
        height: 100%;
        width: 100%;
        z-index: 100;
        position: absolute;
        top: 0;
        left: 0;
    }

    &--allday {
    }

    &--timed {
    }
}
</style>

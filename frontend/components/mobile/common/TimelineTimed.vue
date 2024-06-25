<template>
    <button class="timeline-timed" @click="openEvent">
        <div
            class="timeline-timed--time"
            :style="{
                color,
            }"
        >
            {{ time }}
        </div>
        <div class="timeline-timed--name">
            <p>
                {{ text }}
            </p>
        </div>
        <div v-if="event.recurrentId" class="timeline-timed--repeating">
            <InterfaceArrowsSynchronize class="icon" size="12" />
        </div>
    </button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { formatRelativeToDate, ThemeOptions } from '~/helpers/date';
import { APP_COLORS, Color } from '~/constants';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';

@Component({
    name: 'TimelineTimed',
    components: { InterfaceArrowsSynchronize },
})
export default class TimelineTimed extends Vue {
    @Prop({
        required: true,
    })
    event!: any;

    get color() {
        if (this.event.type === 'task') return this.taskColor;
        if (this.event.type === 'page') return this.pageColor;
        if (this.event.type === 'event') return this.calendarColor;

        return this.computeColorHex(Color.TURQUOISE);
    }

    get time() {
        return formatRelativeToDate(
            this.event,
            new Date(),
            false,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    get calendarColor() {
        const calendar = this.$store.getters['integration/getCalendarByEvent'](
            this.event,
        );

        if (!calendar) return this.computeColorHex(Color.TURQUOISE);

        if (calendar.acreomColorId)
            return this.computeColorHex(calendar.acreomColorId);

        if (calendar.color) return calendar.color;

        return this.computeColorHex(Color.TURQUOISE);
    }

    get taskColor() {
        const colorId =
            this.$store.getters['vaultSettings/tasksInCalendarConfig']
                .acreomColorId;

        return this.computeColorHex(colorId);
    }

    get pageColor() {
        const colorId =
            this.$store.getters['vaultSettings/pagesInCalendarConfig']
                .acreomColorId;
        return this.computeColorHex(colorId);
    }

    get text() {
        if (this.event.type === 'task') {
            return this.$entities.task.getSanitizedTaskText(this.event.text);
        }
        return (
            this.event.summary ||
            this.event.text ||
            this.event.title ||
            'Untitled'
        );
    }

    computeColorHex(color: Color) {
        const theme: ThemeOptions.DARK | ThemeOptions.LIGHT =
            this.$store.getters['appSettings/theme'];

        return APP_COLORS[color][theme].COLOR;
    }

    openEvent() {
        if (this.$utils.isMobile) return;
        this.$vfm.show({
            component: () => import('~/components/event/modal/EventModal.vue'),
            bind: {
                event: this.event,
            },
        });
    }
}
</script>

<style lang="scss" scoped>
.timeline-timed {
    display: flex;
    align-items: center;
    overflow: hidden;

    &--time {
        font-size: 13px;
        font-weight: 500;
        line-height: 155.2%;
        margin-right: 5px;
        text-align: left;
        flex-shrink: 0;
    }

    &--name {
        overflow: hidden;
        width: 100%;
        p {
            @include ellipsis;
            font-size: 13px;
            font-weight: 500;
            line-height: 155.2%;
            width: 100%;
        }
    }

    &--repeating {
        margin-left: 5px;
        color: $blueGrey500;
    }
}
</style>

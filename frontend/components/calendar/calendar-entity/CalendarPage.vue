<template>
    <div
        class="calendar-page"
        :style="{
            'background-color': getPageColorOpacity(0.333333333),
            'border-left': `6px solid ${getPageColorOpacity(0.7)} !important`,
            color: getPageColorOpacity(1),
        }"
    >
        <span
            ><DocumentIcon class="icon jira-icon" :document="event" size="11" />
            <strong
                :title="`${event.name || event.text}` || 'Untitled'"
                :style="{
                    '-webkit-line-clamp': getLineClamp(event),
                    alignItems: 'flex-end',
                    display:
                        getFormattedTime(event).type === 'start'
                            ? 'flex !important'
                            : 'block',
                }"
                :class="{
                    nowrap: getFormattedTime(event).type === 'start',
                }"
                >{{ (event.title.length && event.title) || 'Untitled'
                }}<span v-if="getFormattedTime(event).type === 'start'"
                    >, {{ getFormattedTime(event).text }}</span
                ></strong
            ></span
        >
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import CalendarEntityMixin from '~/components/calendar/calendar-entity/CalendarEntityMixin.vue';

@Component({
    name: 'CalendarPage',
    components: { DocumentIcon },
})
export default class CalendarPage extends CalendarEntityMixin {
    getPageColorOpacity(opacity: number) {
        return this.$utils.calendar.getPageColorOpacity(opacity);
    }
}
</script>
<style lang="scss" scoped>
.jira-icon {
    margin-right: 4px;
    margin-left: 2px;
}

.calendar-page {
    user-select: none;

    span {
        width: 100%;
        display: flex;
        align-items: flex-start;
    }

    .icon {
        margin-top: 3px;
        margin-right: 3px;
        flex-shrink: 0;
    }

    &.completed {
        opacity: 0.4;

        div {
            text-decoration: line-through;
        }
    }
}
</style>

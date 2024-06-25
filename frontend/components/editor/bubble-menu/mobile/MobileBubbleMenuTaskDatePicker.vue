<template>
    <div class="mobile-bubble-menu-task-date-picker">
        <button
            v-if="hasDate"
            contenteditable="false"
            @click.prevent.stop="showDateDropdown"
        >
            <InterfaceCalendar class="icon" />
            {{ formattedDate }}
        </button>
        <button
            v-else
            contenteditable="false"
            @click.prevent.stop="showDateDropdown"
        >
            <InterfaceCalendar class="icon" />
            Set Date
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import { formatRelativeToDate } from '~/helpers';

@Component({
    name: 'MobileBubbleMenuTaskDatePicker',
    components: { InterfaceCalendar },
})
export default class MobileBubbleMenuTaskDatePicker extends Vue {
    @Prop({ default: null })
    taskId!: string | null;

    get task() {
        if (!this.taskId) return null;
        return this.$entities.task.byId(this.taskId);
    }

    get hasDate() {
        if (!this.task) return false;
        // cant have start and not have end
        return !!this.task.start || (!!this.task.start && !!this.task.end);
    }

    get formattedDate() {
        return formatRelativeToDate(
            this.task,
            new Date(),
            false,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    showDateDropdown() {
        if (!this.taskId) return;
        this.$nuxt.$emit(`task-mobile-dropdown-${this.taskId}`);
    }
}
</script>
<style lang="scss" scoped>
.mobile-bubble-menu-task-date-picker {
    button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px 17px;
        font-size: 16px;
        line-height: 20px;
    }
}
</style>

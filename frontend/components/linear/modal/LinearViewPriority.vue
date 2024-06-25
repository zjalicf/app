<template>
    <div
        class="linear-view-priority"
        :class="{ active: active }"
        @click.prevent.stop="openDropdown"
    >
        <LinearPriorityIcon :priority="priority" />
        <div>{{ priority.label }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearPriorityIcon from '~/components/linear/icons/LinearPriorityIcon.vue';

@Component({
    name: 'LinearViewPriority',
    components: {
        LinearPriorityIcon,
        LinearStateIcon,
    },
})
export default class LinearViewPriority extends Vue {
    @Prop({ required: true })
    priority!: any;

    active: boolean = false;

    openDropdown() {
        this.active = true;
        this.$dropdown.show({
            name: 'linear-priority-dropdown',
            parent: this.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearPriorityDropdown.vue'
                ) as any,
            bind: {
                priorityId: this.priority.id,
            },
            on: {
                change: (priority: any) => {
                    this.$dropdown.hide('linear-priority-dropdown');
                    this.$emit('change', priority);
                },
                close: () => {
                    this.$dropdown.hide('linear-priority-dropdown');
                },
            },
            onClose: () => {
                this.active = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-view-priority {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: fit-content;
    padding: 2px 8px;
    border-radius: 6px;

    &:hover,
    &.active {
        background: var(--github-checks-summary-background__hover);
    }
}
</style>

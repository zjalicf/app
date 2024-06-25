<template>
    <div class="linear-issue__priority">
        <component :is="priorityComponent" :size="size"></component>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'LinearPriorityIcon',
    components: {},
})
export default class LinearPriorityIcon extends Vue {
    @Prop({ required: true, default: 0 })
    priority: any;

    @Prop({ required: false, default: 16 })
    size: any;

    get priorityComponent() {
        const priority = this.priority.id.split('/').pop()!;
        switch (priority) {
            case '1':
                return () =>
                    import('~/components/linear/icons/UrgentPriorityIcon.vue');
            case '2':
                return () =>
                    import('~/components/linear/icons/HighPriorityIcon.vue');
            case '3':
                return () =>
                    import('~/components/linear/icons/MediumPriorityIcon.vue');
            case '4':
                return () =>
                    import('~/components/linear/icons/LowPriorityIcon.vue');
            default:
                return () =>
                    import('~/components/linear/icons/NoPriorityIcon.vue');
        }
    }
}
</script>
<style lang="scss" scoped>
.linear-issue__priority {
}
</style>

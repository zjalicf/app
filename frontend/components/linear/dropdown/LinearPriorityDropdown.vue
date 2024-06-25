<template>
    <ADropDown
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="search"
        :multi="false"
        :clear="false"
        check-placement="end"
        search-placeholder="Search priorities"
        :close-on-update="true"
        @change="handlePriorityChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import LinearPriorityIcon from '~/components/linear/icons/LinearPriorityIcon.vue';

@Component({
    name: 'LinearPriorityDropdown',
    components: { ADropDown },
})
export default class LinearPriorityDropdown extends Vue {
    @Prop({ required: true })
    priorityId!: string;

    @Prop({ default: true })
    search!: boolean;

    get selectedValue() {
        return this.priorityId;
    }

    get teamId(): string {
        return this.$entities.linear.parseId(this.priorityId).teamId!;
    }

    get priorities() {
        return this.$entities.linear.linearPriorities;
    }

    get items() {
        return this.priorities.map((priority: any) => ({
            id: priority?.id,
            label: priority?.label,
            icon: {
                icon: LinearPriorityIcon,
                bind: {
                    priority,
                },
            },
        }));
    }

    handlePriorityChange(id: string) {
        this.$emit('change', this.$entities.linear.getById(id));
    }
}
</script>
<style lang="scss" scoped></style>

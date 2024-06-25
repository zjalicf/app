<template>
    <ADropDown
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="search"
        :multi="false"
        :clear="false"
        check-placement="end"
        search-placeholder="Search cycles"
        :close-on-update="true"
        @change="handleCycleChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isAfter, isBefore } from 'date-fns';
import ADropDown from '~/components/ADropDown.vue';

@Component({
    name: 'LinearCycleDropdown',
    components: { ADropDown },
})
export default class LinearCycleDropdown extends Vue {
    @Prop({ required: true })
    cycleId!: string;

    @Prop({ default: true })
    search!: boolean;

    get selectedValue() {
        return this.cycleId;
    }

    get teamId(): string {
        return this.$entities.linear.parseId(this.cycleId).teamId!;
    }

    get cycles() {
        return this.$entities.linear.teamCycles(this.teamId);
    }

    get items() {
        const cycles = this.cycles
            .sort((a: any, b: any) => b.number - a.number)
            .map((cycle: any) => ({
                ...cycle,
                id: cycle?.id,
                label: cycle?.name ?? `Cycle ${cycle?.number}`,
            }));

        const activeCycle = cycles.find((cycle: any) => {
            return (
                isAfter(new Date(), new Date(cycle.startsAt)) &&
                isBefore(new Date(), new Date(cycle.endsAt))
            );
        });

        if (!activeCycle) {
            return cycles;
        }

        return [
            { ...activeCycle, label: activeCycle.label + ' (Active)' },
            ...cycles.filter((cycle: any) => cycle.id !== activeCycle.id),
        ];
    }

    handleCycleChange(id: string) {
        this.$emit('change', this.$entities.linear.getById(id));
    }
}
</script>
<style lang="scss" scoped></style>

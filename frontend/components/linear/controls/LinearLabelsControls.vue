<template>
    <ASelect
        :items="items"
        :value="selectedValues"
        :search="true"
        :width="130"
        :multi="true"
        :multiselect-icons="true"
        :clear="true"
        search-placeholder="Search labels"
        check-placement="start"
        placeholder="Select labels"
        @change="handleLabelsChange($event)"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'LinearLabelsControls',
    components: { ASelect, ADropDown },
})
export default class LinearLabelsControls extends Vue {
    @Prop({ required: true })
    viewId!: string;

    get viewDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get teamId() {
        return this.$entities.linear.parseId(this.viewDefinition.teamId).id;
    }

    get selectedValues() {
        return (
            this.viewDefinition.filters.find(
                (filter: any) => filter.property === 'labels',
            )?.value ?? []
        );
    }

    get allLabels() {
        return this.$entities.linear.teamLabels(this.teamId);
    }

    get items() {
        return this.allLabels.map((label: any) => ({
            id: label?.id,
            label: label?.name,
            icon: {
                icon: LinearLabelIcon,
                bind: {
                    color: label?.color,
                },
            },
        }));
    }

    handleLabelsChange(ids: string[]) {
        const filters = this.viewDefinition.filters;
        if (!ids?.length) {
            this.$emit('update', {
                filters: filters.filter(
                    (filter: any) => filter.property !== 'labels',
                ),
            });
            return;
        }

        const labelsFilter = filters.find(
            (filter: any) => filter.property === 'labels',
        );
        if (!labelsFilter) {
            this.$emit('update', {
                filters: [
                    ...filters,
                    {
                        property: 'labels',
                        operation: 'in',
                        value: ids,
                    },
                ],
            });
            return;
        }

        this.$emit('update', {
            filters: filters.map((filter: any) =>
                filter.property === 'labels'
                    ? { ...filter, value: ids }
                    : filter,
            ),
        });
    }
}
</script>
<style lang="scss" scoped></style>

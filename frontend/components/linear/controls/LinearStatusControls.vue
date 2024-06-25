<template>
    <ASelect
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="true"
        :multi="false"
        :clear="true"
        :width="130"
        check-placement="start"
        search-placeholder="Search status"
        placeholder="Select status"
        @change="handleStatusChange($event)"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import ASelect from '~/components/ASelect.vue';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    name: 'LinearStatusControls',
    components: { ASelect, ADropDown },
})
export default class LinearStatusControls extends Vue {
    @Prop({ required: true })
    viewId!: string;

    get viewDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get teamId() {
        return this.$entities.linear.parseId(this.viewDefinition.teamId).id;
    }

    get selectedValue() {
        return this.viewDefinition.filters.find(
            (filter: any) => filter.property === 'state',
        )?.value;
    }

    get statuses() {
        return this.$entities.linear.teamStates(this.teamId);
    }

    get items() {
        return this.statuses.map((status: any) => ({
            id: status?.id,
            label: status?.name,
            icon: {
                icon: LinearStateIcon,
                bind: {
                    state: status,
                },
            },
        }));
    }

    handleStatusChange(id: string) {
        const filters = this.viewDefinition.filters;
        if (!id) {
            this.$emit('update', {
                filters: filters.filter(
                    (filter: any) => filter.property !== 'state',
                ),
            });
            return;
        }

        const propertyFilter = filters.find(
            (filter: any) => filter.property === 'state',
        );
        if (!propertyFilter) {
            this.$emit('update', {
                filters: [
                    ...filters,
                    {
                        property: 'state',
                        operation: 'eq',
                        value: id,
                    },
                ],
            });
            return;
        }

        this.$emit('update', {
            filters: filters.map((filter: any) =>
                filter.property === 'state' ? { ...filter, value: id } : filter,
            ),
        });
    }
}
</script>
<style lang="scss" scoped></style>

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
        search-placeholder="Search assignee"
        placeholder="Select assignee"
        @change="handleAssigneeChange($event)"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import ASelect from '~/components/ASelect.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';

@Component({
    name: 'LinearAssigneeControls',
    components: { ASelect, ADropDown },
})
export default class LinearAssigneeControls extends Vue {
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
            (filter: any) => filter.property === 'assignee',
        )?.value;
    }

    get users() {
        return this.$entities.linear.teamUsers(this.teamId);
    }

    get items() {
        return [
            { id: null, label: 'Unassigned' },
            ...this.users.map((user: any) => ({
                id: user?.id,
                label: user?.displayName,
                icon: {
                    icon: LinearUserIcon,
                    bind: {
                        user,
                    },
                    size: 16,
                },
            })),
        ];
    }

    handleAssigneeChange(id: string) {
        const filters = this.viewDefinition.filters;
        if (!id) {
            this.$emit('update', {
                filters: filters.filter(
                    (filter: any) => filter.property !== 'assignee',
                ),
            });
            return;
        }

        const propertyFilter = filters.find(
            (filter: any) => filter.property === 'assignee',
        );
        if (!propertyFilter) {
            this.$emit('update', {
                filters: [
                    ...filters,
                    {
                        property: 'assignee',
                        operation: 'eq',
                        value: id,
                    },
                ],
            });
            return;
        }

        this.$emit('update', {
            filters: filters.map((filter: any) =>
                filter.property === 'assignee'
                    ? { ...filter, value: id }
                    : filter,
            ),
        });
    }
}
</script>
<style lang="scss" scoped></style>

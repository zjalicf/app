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
        search-placeholder="Search projects"
        placeholder="Select project"
        @change="handleProjectChange($event)"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import ASelect from '~/components/ASelect.vue';

@Component({
    name: 'LinearProjectControls',
    components: { ASelect, ADropDown },
})
export default class LinearProjectControls extends Vue {
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
            (filter: any) => filter.property === 'project',
        )?.value;
    }

    get projects() {
        return this.$entities.linear.teamProjects(this.teamId);
    }

    get items() {
        return this.projects.map((project: any) => ({
            id: project?.id,
            label: project?.name,
        }));
    }

    handleProjectChange(id: string) {
        const filters = this.viewDefinition.filters;
        if (!id) {
            this.$emit('update', {
                filters: filters.filter(
                    (filter: any) => filter.property !== 'project',
                ),
            });
            return;
        }

        const labelsFilter = filters.find(
            (filter: any) => filter.property === 'project',
        );
        if (!labelsFilter) {
            this.$emit('update', {
                filters: [
                    ...filters,
                    {
                        property: 'project',
                        operation: 'eq',
                        value: id,
                    },
                ],
            });
            return;
        }

        this.$emit('update', {
            filters: filters.map((filter: any) =>
                filter.property === 'project'
                    ? { ...filter, value: id }
                    : filter,
            ),
        });
    }
}
</script>
<style lang="scss" scoped></style>

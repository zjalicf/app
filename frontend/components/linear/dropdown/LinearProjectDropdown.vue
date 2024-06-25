<template>
    <ADropDown
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="search"
        :multi="false"
        :clear="false"
        check-placement="end"
        search-placeholder="Search projects"
        :close-on-update="true"
        @change="handlePriorityChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';

@Component({
    name: 'LinearPriorityDropdown',
    components: { ADropDown },
})
export default class LinearPriorityDropdown extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    projectId!: string;

    @Prop({ default: true })
    search!: boolean;

    get selectedValue() {
        return this.projectId;
    }

    get projects() {
        return this.$entities.linear.teamProjects(this.teamId);
    }

    get items() {
        return [
            { id: null, label: 'No Project' },
            ...this.projects.map((project: any) => ({
                id: project?.id,
                label: project?.name,
            })),
        ];
    }

    handlePriorityChange(id: string) {
        this.$emit('change', this.$entities.linear.getById(id));
    }
}
</script>
<style lang="scss" scoped></style>

<template>
    <ADropDown
        :items="items"
        :value="selectedValues"
        :styled="true"
        :search="search"
        :multi="true"
        :multiselect-icons="true"
        :clear="false"
        check-placement="start"
        search-placeholder="Search labels"
        @change="handleLabelsChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';

@Component({
    name: 'LinearLabelsDropdown',
    components: { ADropDown },
})
export default class LinearLabelsDropdown extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    labels!: any[];

    @Prop({ default: true })
    search!: boolean;

    get selectedValues() {
        return this.labels?.map?.(({ id }: any) => id) ?? [];
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
        this.$emit(
            'change',
            ids.map((id: string) => this.$entities.linear.getById(id)),
        );
    }
}
</script>
<style lang="scss" scoped></style>

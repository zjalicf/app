<template>
    <ASelect
        :items="items"
        :value="selectedValue"
        :styled="true"
        :multi="false"
        :clear="false"
        :width="130"
        check-placement="start"
        @change="handleOptionClick($event)"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import ASelect from '~/components/ASelect.vue';
import { capitalize } from '~/helpers/util';
import { LinearGroupByOptions } from '~/components/linear/constants';

@Component({
    name: 'LinearGroupByControls',
    components: { ASelect, ADropDown },
})
export default class LinearGroupByControls extends Vue {
    @Prop({ required: true })
    viewId!: string;

    get viewDefinition() {
        return this.$entities.linear.getViewDefinition(this.viewId);
    }

    get selectedValue() {
        return this.viewDefinition.groupBy;
    }

    get items() {
        return Object.values(LinearGroupByOptions).map((option: any) => ({
            id: option,
            label: capitalize(option),
        })) as any[];
    }

    handleOptionClick(id: string) {
        this.$emit('update', {
            groupBy: id,
        });
    }
}
</script>
<style lang="scss" scoped></style>

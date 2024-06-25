<template>
    <ADropDown
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="search"
        :multi="false"
        :clear="false"
        check-placement="end"
        search-placeholder="Search statuses"
        :close-on-update="true"
        @change="handleStateChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    name: 'LinearStateDropdown',
    components: { ADropDown },
})
export default class LinearStateDropdown extends Vue {
    @Prop({ required: true })
    stateId!: string;

    @Prop({ default: true })
    search!: boolean;

    get selectedValue() {
        return this.stateId;
    }

    get teamId(): string {
        return this.$entities.linear.parseId(this.stateId).teamId!;
    }

    get states() {
        return this.$entities.linear.teamStates(this.teamId);
    }

    get items() {
        return this.states.map((state: any) => ({
            id: state?.id,
            label: state?.name,
            icon: {
                icon: LinearStateIcon,
                bind: {
                    state,
                },
            },
        }));
    }

    handleStateChange(id: string) {
        this.$emit('change', this.$entities.linear.getById(id));
    }
}
</script>
<style lang="scss" scoped></style>

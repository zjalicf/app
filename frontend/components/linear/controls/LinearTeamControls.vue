<template>
    <ASelect
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="false"
        :multi="false"
        :clear="false"
        :width="130"
        check-placement="start"
        search-placeholder="Search team"
        placeholder="Select team"
        @change="handleTeamChange($event)"
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

    get selectedValue() {
        return this.viewDefinition.teamId;
    }

    get teams() {
        return this.$entities.linear.teams;
    }

    get items() {
        return this.teams.map((team: any) => ({
            id: team?.id,
            label: team?.name,
        }));
    }

    handleTeamChange(id: string) {
        this.$emit('update', {
            teamId: id,
        });
    }
}
</script>
<style lang="scss" scoped></style>

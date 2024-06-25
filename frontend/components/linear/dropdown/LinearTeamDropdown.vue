<template>
    <ADropDown
        :items="items"
        :value="selectedValue"
        :styled="true"
        :search="false"
        :multi="false"
        :clear="false"
        check-placement="start"
        search-placeholder="Search teams"
        :close-on-update="true"
        @change="handleTeamChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';

@Component({
    name: 'LinearCycleDropdown',
    components: { ADropDown },
})
export default class LinearCycleDropdown extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ default: true })
    search!: boolean;

    get selectedValue() {
        return this.teamId;
    }

    get teams() {
        const integration = this.$entities.linear.getIntegration();
        const teams = integration.data.teams ?? [];
        return this.$entities.linear.teams.filter((team: any) =>
            teams.includes(team.id),
        );
    }

    get items() {
        return this.teams.map((team: any) => ({
            id: team?.id,
            label: team?.name,
        }));
    }

    handleTeamChange(id: string) {
        this.$emit('change', id);
    }
}
</script>
<style lang="scss" scoped></style>

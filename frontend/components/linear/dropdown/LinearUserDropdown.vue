<template>
    <ADropDown
        :styled="true"
        :items="items"
        :value="selectedValue"
        :search="search"
        :multi="false"
        :clear="false"
        check-placement="end"
        search-placeholder="Search users"
        :close-on-update="true"
        @change="handleUserChange($event)"
        @close="$emit('close')"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';

@Component({
    name: 'LinearUserDropdown',
    components: { ADropDown },
})
export default class LinearUserDropdown extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    userId!: string;

    @Prop({ default: true })
    search!: boolean;

    get selectedValue() {
        return this.userId;
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

    handleUserChange(id: string) {
        this.$emit('change', this.$entities.linear.getById(id) ?? null);
    }
}
</script>
<style lang="scss" scoped></style>

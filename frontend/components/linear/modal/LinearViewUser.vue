<template>
    <div
        class="linear-view-user"
        :class="{ active: active }"
        @click.prevent.stop="openDropdown"
    >
        <LinearUserIcon :user="user" :size="16" fon-size="11" />
        <div>{{ displayName }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';

@Component({
    name: 'LinearViewUser',
    components: {
        LinearUserIcon,
        LinearStateIcon,
    },
})
export default class LinearViewUser extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    user!: any;

    active: boolean = false;

    get displayName() {
        return this.user?.displayName || 'Unassigned';
    }

    openDropdown() {
        this.active = true;
        this.$dropdown.show({
            name: 'linear-user-dropdown',
            parent: this.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearUserDropdown.vue'
                ) as any,
            bind: {
                teamId: this.teamId,
                userId: this.user?.id ?? null,
            },
            on: {
                change: (user: any) => {
                    this.$dropdown.hide('linear-user-dropdown');
                    this.$emit('change', user);
                },
                close: () => {
                    this.$dropdown.hide('linear-user-dropdown');
                },
            },
            onClose: () => {
                this.active = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-view-user {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: fit-content;
    padding: 2px 8px;
    border-radius: 6px;

    &:hover,
    &.active {
        background: var(--github-checks-summary-background__hover);
    }
}
</style>

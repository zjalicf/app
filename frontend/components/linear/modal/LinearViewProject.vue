<template>
    <div
        class="linear-view-project"
        :class="{ active: active }"
        @click.prevent.stop="openDropdown"
    >
        <InterfaceDashboardLayoutSquare />
        <div>{{ projectName }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';

@Component({
    name: 'LinearViewProject',
    components: {
        InterfaceDashboardLayoutSquare,
        LinearStateIcon,
    },
})
export default class LinearViewProject extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    project!: any;

    active: boolean = false;

    get projectName() {
        return this.project?.name ?? 'No Project';
    }

    openDropdown() {
        this.active = true;
        this.$dropdown.show({
            name: 'linear-project-dropdown',
            parent: this.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearProjectDropdown.vue'
                ) as any,
            bind: {
                teamId: this.teamId,
                projectId: this.project?.id ?? null,
            },
            on: {
                change: (project: any) => {
                    this.$dropdown.hide('linear-project-dropdown');
                    this.$emit('change', project);
                },
                close: () => {
                    this.$dropdown.hide('linear-project-dropdown');
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
.linear-view-project {
    display: flex;
    align-items: center;
    gap: 12px;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 6px;
    flex-shrink: 0;

    &:hover,
    &.active {
        background: var(--github-checks-summary-background__hover);
    }
}
</style>

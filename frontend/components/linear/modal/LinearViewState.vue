<template>
    <div
        ref="state"
        class="linear-view-state"
        :class="{ active: active }"
        @click.prevent.stop="openDropdown"
    >
        <LinearStateIcon :state="state" />
        <div>{{ state.name }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    name: 'LinearViewState',
    components: {
        LinearStateIcon,
    },
})
export default class LinearViewState extends Vue {
    @Prop({ required: true })
    state!: any;

    active: boolean = false;

    openDropdown() {
        this.active = true;
        this.$dropdown.show({
            name: 'linear-state-dropdown',
            parent: this.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearStateDropdown.vue'
                ) as any,
            bind: {
                stateId: `${this.state.id}`,
            },
            on: {
                change: (state: any) => {
                    this.$dropdown.hide('linear-state-dropdown');
                    this.$emit('change', state);
                },
                close: () => {
                    this.$dropdown.hide('linear-state-dropdown');
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
.linear-view-state {
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

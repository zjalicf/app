<template>
    <div class="linear-controls">
        <LoadingIcon v-if="reloading" size="14" />
        <LinearSearch v-if="search" @search="$emit('search', $event)" />
        <button
            ref="linearControls"
            :class="{ active: active === 'controls' }"
            @click="openLinearControlsDropdown"
        >
            <InterfaceSettingSliderVertical size="14" />
        </button>
        <button
            ref="viewOptions"
            :class="{ active: active === 'options' }"
            @click="openViewOptions"
        >
            <InterfaceSettingMenuHorizontal class="icon" />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RefreshIcon } from '@vue-hero-icons/solid';
import InterfaceSettingSliderVertical from '~/components/streamline/InterfaceSettingSliderVertical.vue';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import LinearSearch from '~/components/linear/app/LinearSearch.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import IntegrationViewDropdown from '~/components/integrations/views/IntegrationViewDropdown.vue';

@Component({
    name: 'LinearControls',
    components: {
        InterfaceSettingMenuHorizontal,
        InterfaceArrowsSynchronize,
        LoadingIcon,
        RefreshIcon,
        LinearSearch,
        InterfaceSearch,
        InterfaceSettingSliderVertical,
    },
})
export default class LinearControls extends Vue {
    @Prop()
    viewId!: string;

    @Prop({ default: false })
    search!: boolean;

    @Prop({ default: false })
    reloading!: boolean;

    active: string = 'none';

    $refs!: {
        linearControls: HTMLElement;
        viewOptions: HTMLElement;
    };

    openViewOptions() {
        const view = this.$entities.linear
            .getIntegrationViews()
            .find(({ id }) => id === this.viewId);

        if (!view) return;

        this.active = 'options';
        this.$dropdown.show({
            component: IntegrationViewDropdown,
            name: 'view-dropdown',
            parent: this.$refs.viewOptions,
            bind: {
                isDefault: view.default,
            },
            on: {
                edit: () => {
                    this.$emit('edit', this.viewId);
                    this.$dropdown.hide('view-dropdown');
                },
                delete: () => {
                    this.$emit('delete', this.viewId);
                    this.$dropdown.hide('view-dropdown');
                },
                reload: () => {
                    this.$emit('reload', this.viewId);
                    this.$dropdown.hide('view-dropdown');
                },
                duplicate: () => {
                    this.$emit('duplicate', this.viewId);
                    this.$dropdown.hide('view-dropdown');
                },
            },
            onClose: () => {
                this.active = 'none';
            },
        });
    }

    openLinearControlsDropdown() {
        this.active = 'controls';
        this.$dropdown.show({
            parent: this.$refs.linearControls,
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearControlsDropdown.vue'
                ) as any,
            retainFocus: true,
            bind: {
                viewId: this.viewId,
            },
            on: {
                update: (data: any) => {
                    this.$emit('update', data);
                },
            },
            onClose: () => {
                this.active = 'none';
            },
            popperOptions: {
                placement: 'bottom-end',
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: auto;

    button {
        color: var(--tab-controls-icon-color);
        padding: 7px;
        border-radius: 6px;
        line-height: 14px;

        &:hover,
        &.active {
            background: var(--tab-controls-bg-color__hover);
            color: var(--tab-controls-icon-color__hover);
        }
    }
}
</style>

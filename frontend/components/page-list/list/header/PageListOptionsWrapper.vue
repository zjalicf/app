<template>
    <button
        ref="viewOptionsButton"
        class="view-options-wrapper"
        :class="{ active: dropdownVisible }"
        @click="onDropdownHandler"
    >
        <InterfaceSettingMenuHorizontal class="icon" />
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';

@Component({
    name: 'PageListOptionsWrapper',
    components: { InterfaceSettingMenuHorizontal },
})
export default class PageListOptionsWrapper extends Vue {
    @Prop({ required: true })
    dropdownConfig!: any;

    $refs!: {
        viewOptionsButton: HTMLButtonElement;
    };

    dropdownVisible = false;

    onDropdownHandler() {
        this.dropdownVisible = true;
        const { component, on, bind } = this.dropdownConfig;
        this.$dropdown.show({
            component,
            parent: this.$refs.viewOptionsButton,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            bind,
            on,
            onClose: () => {
                this.dropdownVisible = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.view-options-wrapper {
    padding: 7px;
    border-radius: 6px;
    color: var(--tab-controls-icon-color);

    &:hover,
    &.active {
        color: var(--tab-controls-icon-color__hover);
        background: var(--tab-controls-bg-color__hover);
    }
}
</style>

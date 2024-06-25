<template>
    <div class="linear-context-menu">
        <DropdownButton @click="openLinearSettings">
            <InterfaceSettingCog class="icon" />
            Linear Settings
        </DropdownButton>
        <slot name="sidebar-options" />
        <slot name="tab-options" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';

@Component({
    name: 'LinearAppContextMenu',
    components: {
        InterfaceSettingCog,
        DropdownButton,
    },
})
export default class LinearAppContextMenu extends Vue {
    openLinearSettings() {
        this.$emit('close');
        this.$entities.linear.openSettings();
    }
}
</script>

<style lang="scss" scoped>
.linear-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;

    &--title {
        @include font10-700;
        padding: 3px 8px 0;
        color: var(--context-menu-section-title);
        text-transform: uppercase;
    }

    &--left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &--right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        :deep(.tooltip-keys--button) {
            background: none;
            color: var(--context-menu-tooltip-keys-color);
        }
    }

    &--button {
        justify-content: space-between;
    }
}
</style>

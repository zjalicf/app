<template>
    <button
        tabindex="-1"
        :data-tippy-content="`<div class='tooltip'>New Filter</div>`"
        class="integration-view-menu-item has-tippy"
        :class="{ active, icon }"
        @click="$emit('click')"
    >
        <slot />
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'IntegrationViewMenuItem',
})
export default class IntegrationViewMenuItem extends Vue {
    @Prop({ default: false })
    active!: boolean;

    @Prop({ default: false })
    icon!: boolean;
}
</script>
<style lang="scss" scoped>
.integration-view-menu-item {
    @include font14-600;
    @include ellipsis;
    padding: 3px 8px;
    border-radius: 8px;
    color: var(--integration-view-menu-text-color);
    display: block;
    max-width: 210px;

    &.icon {
        padding: 8px;
    }

    &:hover,
    &.active {
        color: var(--integration-view-menu-text-color__hover);
        background: var(--integration-view-menu-bg-color__hover);
    }
}
</style>

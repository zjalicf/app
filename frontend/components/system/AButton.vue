<template>
    <button
        class="a-button"
        :disabled="disabled"
        @click="$emit('click', $event)"
    >
        <slot />
    </button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    name: 'AButton',
})
export default class AButton extends Vue {
    @Prop({
        default: false,
    })
    disabled!: boolean;
}
</script>

<style lang="scss" scoped>
.a-button {
    outline: none;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    padding: 6px 16px;
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
    color: var(--a-button-text-color);
    background: var(--a-button-bg-color);
}
</style>

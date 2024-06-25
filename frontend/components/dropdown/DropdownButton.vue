<template>
    <button
        :tabindex="tabindex"
        @mouseenter="onMouseEnter"
        @click="$emit('click', $event)"
    >
        <slot />
    </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'DropdownButton',
    components: {},
})
export default class DropdownButton extends Vue {
    @Prop({
        default: 0,
    })
    tabindex!: number;

    onMouseEnter(event: any) {
        this.$nuxt.$emit('dropdown-button-hover');
        this.$emit('mouseenter', event);
    }
}
</script>

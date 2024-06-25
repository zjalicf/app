<template>
    <div class="entity-view-row">
        <div class="entity-view-row__title">
            <slot name="title"></slot>
        </div>
        <div class="entity-view-row__content">
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'EntityViewRow',
})
export default class EntityViewRow extends Vue {}
</script>
<style lang="scss" scoped>
.entity-view-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    align-items: flex-start;
    margin-bottom: 12px;

    &__title {
        @include font10-700;
        text-transform: uppercase;
        color: var(--github-view-row-title-color);
        padding: 5px 0px;
    }
}
</style>

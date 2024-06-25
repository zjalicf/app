<template>
    <div class="github-view-row">
        <div class="github-view-row__title">
            <slot name="title"></slot>
        </div>
        <div class="github-view-row__content">
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'GithubViewRow',
})
export default class GithubViewRow extends Vue {}
</script>
<style lang="scss" scoped>
.github-view-row {
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

<template>
    <div class="entity-view-title" :class="[viewContext]">
        {{ title }}
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { GithubSymbols } from '~/components/github/github';

@Component({
    name: 'GithubViewTitle',
})
export default class GithubViewTitle extends Vue {
    @Prop({ required: true })
    title!: string;

    @Inject(GithubSymbols.VIEW_CONTEXT)
    viewContext!: string;
}
</script>
<style lang="scss" scoped>
.entity-view-title {
    font-size: 22px;
    font-weight: 700;
    line-height: 155.2%;
    color: var(--github-view-title-color);
    margin-bottom: 20px;

    &.panel {
        font-size: 18px;
    }
}
</style>

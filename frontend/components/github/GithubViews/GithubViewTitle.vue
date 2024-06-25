<template>
    <div class="github-view-title" :class="[viewContext]">
        {{ entity.title }}
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import {
    GithubIssue,
    GithubPullRequest,
    GithubSymbols,
} from '~/components/github/github';

@Component({
    name: 'GithubViewTitle',
})
export default class GithubViewTitle extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    @Inject(GithubSymbols.VIEW_CONTEXT)
    viewContext!: string;
}
</script>
<style lang="scss" scoped>
.github-view-title {
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

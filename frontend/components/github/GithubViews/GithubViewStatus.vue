<template>
    <div class="github-view-status">
        <div class="github-view-status__icon">
            <GithubEntityIcon :entity="entity" />
        </div>
        <div class="github-view-status__text">
            {{ entity.state }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';

@Component({
    name: 'GithubViewStatus',
    components: { GithubEntityIcon },
})
export default class GithubViewStatus extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;
}
</script>
<style lang="scss" scoped>
.github-view-status {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    padding: 4px 0px;

    &__text {
        @include font12-500;
        text-transform: capitalize;
        color: var(--github-property-text-color);
    }
    &__icon {
        padding: 1px;
    }
}
</style>

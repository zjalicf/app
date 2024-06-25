<template>
    <div class="github-suggestion" :class="{ active }">
        <GithubEntityIcon class="icon" :entity="entity" />
        <p>
            {{ $entities.github.getRepositoryName(entity) }}
            <span>{{ entity.title }}</span> #{{ entity.number }}
        </p>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';

@Component({
    name: 'GithubSuggestion',
    components: { GithubEntityIcon },
})
export default class GithubSuggestion extends Vue {
    @Prop({ required: true })
    entity!: GithubIssue | GithubPullRequest;

    @Prop({ default: false })
    active!: boolean;
}
</script>
<style lang="scss" scoped>
.github-suggestion {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    //color: var(--editor-extension-jira-suggestion-text-color);

    &.active {
        padding: 4px 8px;
        border: 2px solid var(--accent-color);
        background: var(--editor-extension-jira-suggestion-bg-color__active);
        color: var(--editor-extension-jira-suggestion-text-color__active);
        margin: 0;

        p,
        span {
            color: var(--editor-extension-jira-suggestion-text-color__active);
        }
    }

    .icon {
        flex-shrink: 0;
    }

    p {
        @include ellipsis;
        @include font12-500;
        color: var(--editor-extension-jira-suggestion-title-text-color);

        span {
            color: var(--editor-extension-jira-suggestion-text-color);
        }
    }
}
</style>

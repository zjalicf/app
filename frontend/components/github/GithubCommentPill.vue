<template>
    <div class="github-comment-pill">
        <div class="github-comment-pill__icon">
            <MailChatBubbleTextSquare class="icon" size="12" />
        </div>
        <div class="github-comment-pill__count">
            {{ entity.comments }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import MailChatBubbleTextSquare from '~/components/streamline/MailChatBubbleTextSquare.vue';

@Component({
    name: 'GithubCommentPill',
    components: { MailChatBubbleTextSquare },
})
export default class GithubCommentPill extends Vue {
    @Prop({ required: true })
    entity!: GithubIssue | GithubPullRequest;
}
</script>
<style lang="scss" scoped>
.github-comment-pill {
    @include font12-500;
    border: 1px solid $blueGrey500-16;
    border-radius: 31px;
    color: $blueGrey400;
    padding: 2px 8px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 6px;

    &__icon {
        flex-shrink: 0;
    }
}
</style>

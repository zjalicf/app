<template>
    <div class="github-view-comment">
        <input
            v-model="message"
            :disabled="loading"
            type="text"
            placeholder="Leave a comment"
        />
        <div class="github-view-comment__footer">
            <CButton
                :disabled="loading"
                type="primary"
                size="small"
                @click="submit"
                >Comment
            </CButton>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import {
    GithubIssue,
    GithubPullRequest,
    GithubSymbols,
} from '~/components/github/github';
import CButton from '~/components/CButton.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'GithubViewComment',
    components: { CButton },
})
export default class GithubViewComment extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    @Inject(GithubSymbols.TRACKING_ACTION_SOURCE)
    trackingSource!: TrackingActionSource;

    message: string = '';
    loading: boolean = false;

    async submit() {
        if (!this.message.trim()) return;

        this.loading = true;
        const comment = await this.$entities.github.postComment(
            this.entity,
            this.message,
        );

        if (comment !== null) {
            this.message = '';

            this.$tracking.trackEventV2(TrackingType.GITHUB, {
                action: TrackingAction.ADD_COMMENT,
                source: this.trackingSource,
            });
        } else {
            // TODO: github
        }
        this.loading = false;
    }
}
</script>
<style lang="scss" scoped>
.github-view-comment {
    border-radius: 8px;
    border: 1px solid var(--github-comment-border-color);
    background: var(--github-comment-backround-color);
    box-shadow: var(--github-comment-box-shadow);
    margin-top: 16px;

    input {
        display: block;
        width: 100%;
        outline: none;
        padding: 8px 16px;
    }

    &__footer {
        display: flex;
        justify-content: flex-end;
        padding: 4px 16px 16px;
    }
}
</style>

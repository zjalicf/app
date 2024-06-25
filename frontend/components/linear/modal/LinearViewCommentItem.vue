<template>
    <div class="linear-issue-comment">
        <div class="linear-issue-comment__content">
            <div class="linear-issue-comment__content__header">
                <div class="linear-issue-comment__content__header__name">
                    {{ actorName }} <span>commented</span>
                </div>
                <div class="linear-issue-comment__content__header__date">
                    {{ formattedDateTime }}
                </div>
            </div>
            <div class="linear-issue-comment__content__body">
                <BasicEditor :value="content" />
            </div>
            <div class="linear-issue-comment__content__divider"></div>
            <div
                v-if="item.childComments"
                class="linear-issue-comment__content__replies"
            >
                <LinearViewNestedCommentItem
                    v-for="comment in item.childComments"
                    :key="comment.id"
                    :issue-id="issueId"
                    :item="comment"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistanceToNowStrict } from 'date-fns';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';
import BasicEditor from '~/components/linear/modal/LinearDescriptionEditor.vue';
import LinearViewNestedCommentItem from '~/components/linear/modal/LinearViewNestedCommentItem.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';

@Component({
    name: 'LinearViewCommentItem',
    components: {
        LinearUserIcon,
        LinearViewNestedCommentItem,
        BasicEditor,
        LinearLabelIcon,
        LinearStateIcon,
    },
})
export default class LinearViewCommentItem extends Vue {
    @Prop({ required: true })
    issueId!: string;

    @Prop({ default: null })
    item!: any;

    get actorName() {
        return this.actor?.displayName ?? this.actor.name;
    }

    get actor() {
        if (this.item.botActor) {
            return this.item.botActor;
        }
        return this.$entities.linear.getById(this.item.userId);
    }

    get content() {
        return JSON.parse(this.item.bodyData);
    }

    get formattedDateTime() {
        const date = new Date(this.item.createdAt);
        return formatDistanceToNowStrict(date, {
            addSuffix: true,
            includeSeconds: true,
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-issue-comment {
    background: var(--github-comment-backround-color);
    border: 1px solid var(--github-comment-border-color);
    border-radius: 8px;
    padding: 11px 21px;
    width: 100%;
    display: flex;
    gap: 4px;
    justify-content: flex-start;
    align-items: flex-start;

    &__icon {
        margin-right: 6px;
    }

    &__content {
        border-radius: 6px;
        width: 100%;
        &__header {
            @include font14-500;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 8px;

            &__name {
                @include font12-700;
                color: var(--github-timeline-author-color);

                span {
                    @include font12-400;
                    color: var(--github-timeline-text-color);
                    font-weight: 400;
                }
            }

            &__date {
                @include font12-400;
                color: var(--github-timeline-date-color);
                font-weight: 400;
                position: relative;
                white-space: nowrap;
            }
        }
        &__body {
            :deep(table th),
            :deep(table td) {
                border: 1px solid var(--editor-table-border-color);
                padding: 3px 7px;
            }

            :deep(h1) {
                font-weight: bold;
                font-size: 20px;
                margin-bottom: 1rem;
            }

            :deep(h2) {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 1rem;
            }

            :deep(h3) {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 1rem;
            }

            :deep(h4) {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 1rem;
            }

            :deep(h5) {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 1rem;
            }

            :deep(*) {
                font-size: 14px;
            }

            :deep(h6) {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 1rem;
            }

            :deep(a) {
                color: var(--accent-color);

                &:hover {
                    text-decoration: underline;
                }
            }

            :deep(code),
            :deep(pre) {
                background: var(--editor-code-bg-color);
            }

            :deep(pre) {
                padding: 4px 8px;
                border-radius: 6px;
                overflow: auto;
            }

            :deep(hr) {
                margin: 14px 0;
                border-color: var(--editor-hr-color);
            }
        }
    }
}
</style>

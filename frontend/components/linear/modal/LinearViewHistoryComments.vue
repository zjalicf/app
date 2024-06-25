<template>
    <div class="linear-issue-activity">
        <div class="linear-issue-activity__options">
            <button
                class="linear-issue-activity__options__item"
                :class="{ active: displayOptions === 'comments' }"
                @click="displayOptions = 'comments'"
            >
                Comments
            </button>
            <button
                class="linear-issue-activity__options__item"
                :class="{ active: displayOptions === 'history' }"
                @click="displayOptions = 'history'"
            >
                History
            </button>
            <button
                class="linear-issue-activity__options__item"
                :class="{ active: displayOptions === 'all' }"
                @click="displayOptions = 'all'"
            >
                All
            </button>
        </div>
        <div class="linear-issue-activity__wrapper">
            <div
                v-for="item in items"
                :key="item.id"
                class="linear-issue-activity__wrapper__item"
            >
                <LinearViewHistoryItem
                    v-if="item.type === 'history'"
                    :issue-id="issueId"
                    :item="item"
                />
                <LinearViewCommentItem
                    v-else
                    :issue-id="issueId"
                    :item="item"
                />
            </div>
            <div
                v-if="!items.length"
                class="linear-issue-activity__wrapper__empty"
            >
                No {{ displayOptions }} yet.
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';
import LinearViewHistoryItem from '~/components/linear/modal/LinearViewHistoryItem.vue';
import LinearViewCommentItem from '~/components/linear/modal/LinearViewCommentItem.vue';

@Component({
    name: 'LinearViewHistoryComments',
    components: {
        LinearViewCommentItem,
        LinearViewHistoryItem,
        LinearLabelIcon,
        LinearStateIcon,
    },
})
export default class LinearViewLabels extends Vue {
    @Prop({ required: true })
    issueId!: string;

    @Prop({ required: true })
    history!: any[];

    @Prop({ required: true })
    comments!: any[];

    displayOptions: string = 'comments';

    get items() {
        if (this.displayOptions === 'all') {
            return this.sort([...this.issueHistory, ...this.issueComments]);
        }
        if (this.displayOptions === 'comments') {
            return this.sort(this.issueComments);
        }
        if (this.displayOptions === 'history') {
            return this.sort(this.issueHistory);
        }
        return [];
    }

    sort(items: any[]) {
        if (!items) return items;
        return items.sort((a, b) => {
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        });
    }

    get issueHistory() {
        const issue = this.$entities.linear.getById(this.issueId);
        const creation = {
            actorId: issue.creator,
            creation: true,
            createdAt: issue.createdAt,
        };
        return [creation, ...this.history].map(item => {
            return {
                ...item,
                type: 'history',
            };
        });
    }

    get issueComments() {
        const childComments = this.comments.reduce((acc, item) => {
            if (!item.parent?.id) return acc;
            if (!acc[item.parent.id]) {
                acc[item.parent.id] = [];
            }

            acc[item.parent.id].push(item);
            return acc;
        }, {} as any);

        return this.comments
            .filter(comment => !comment.parent?.id)
            .map(item => {
                return {
                    ...item,
                    childComments: this.sort(childComments[item.id]) || [],
                    type: 'comment',
                };
            });
    }
}
</script>
<style lang="scss" scoped>
.linear-issue-activity {
    &__options {
        display: flex;
        width: 100%;
        align-items: flex-start;
        margin-bottom: 16px;

        &__item {
            @include font12-500;
            text-transform: capitalize;
            padding: 2px 4px;
            color: var(--jira-activity-button-text-color);
            background: var(--jira-activity-button-bg-color);
            border-radius: 4px;

            &:hover,
            &.active {
                color: var(--jira-activity-button-text-color__hover);
                background: var(--jira-activity-button-bg-color__hover);
            }

            &:not(:last-of-type) {
                margin-right: 8px;
            }
        }
    }

    &__wrapper {
        &__item {
            display: flex;
            align-items: center;
            padding: 8px 0;
        }

        &__empty {
            @include font12-500;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>

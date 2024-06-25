<template>
    <div class="github-labels-pill">
        <div v-if="shortPills" class="github-labels-pill__label">
            {{ labelsAmount }} labels
        </div>
        <div v-else class="github-labels-pill__wrapper">
            <div
                v-for="label in entity.labels"
                :key="label.id"
                class="github-labels-pill__label"
            >
                <span :style="{ background: `#${label.color}` }"></span>
                {{ label.name }}
            </div>
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

@Component({
    name: 'GithubLabelsPill',
})
export default class GithubLabelsPill extends Vue {
    @Prop({ required: true })
    entity!: GithubIssue | GithubPullRequest;

    @Inject({ from: GithubSymbols.VIEW_CONTEXT, default: 'list' })
    viewContext!: string;

    get labelsAmount() {
        return this.entity.labels.length;
    }

    get shortPills() {
        return this.viewContext === 'list' && this.labelsAmount > 2;
    }
}
</script>
<style lang="scss" scoped>
.github-labels-pill {
    //display: flex;
    //align-items: center;
    //gap: 4px;

    &__wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 4px;

        .modal & {
            flex-wrap: wrap;
        }
    }

    &__label {
        @include font12-500;
        border: 1px solid var(--github-timeline-label-border-color);
        border-radius: 31px;
        padding: 2px 8px;
        text-align: center;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        color: var(--app-text-color);

        .modal & {
            background: var(--github-timeline-label-background);
        }

        span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }
    }
}
</style>

<template>
    <div
        class="github-entity-preview"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
        @click="$emit('click')"
    >
        <div class="github-entity-preview__header">
            <span>{{ $entities.github.getRepositoryName(entity) }}</span>
            <span>{{ date }}</span>
        </div>
        <div class="github-entity-preview__title">
            {{ entity?.title }}
        </div>
        <div class="github-entity-preview__footer">
            <GithubViewStatus :entity="entity" />
            <GithubCommentPill v-if="entity.comments" :entity="entity" />
        </div>
        <div
            v-if="entity.labels.length > 0"
            class="github-entity-preview__labels"
        >
            <GithubLabelsPill :entity="entity" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import GithubPanel from '~/components/github/GithubPanel.vue';
import GithubIssueView from '~/components/github/GithubIssueView.vue';
import GithubPullRequestView from '~/components/github/GithubPullRequestView.vue';
import GithubViewStatus from '~/components/github/GithubViews/GithubViewStatus.vue';
import GithubCommentPill from '~/components/github/GithubCommentPill.vue';
import GithubLabelsPill from '~/components/github/GithubLabelsPill.vue';
import { GithubSymbols } from '~/components/github/github';

@Component({
    name: 'GithubEntityPreview',
    components: {
        GithubLabelsPill,
        GithubCommentPill,
        GithubViewStatus,
        GithubPullRequestView,
        GithubIssueView,
        GithubPanel,
    },
})
export default class GithubEntityPreview extends Vue {
    @Prop({ required: true })
    id!: string;

    @Provide(GithubSymbols.VIEW_CONTEXT)
    viewContext: string = 'preview';

    get entity() {
        return this.$entities.github.getById(this.id);
    }

    get date() {
        if (!this.entity?.updated_at) return '';
        return formatDistance(new Date(this.entity.updated_at), new Date(), {
            addSuffix: true,
        });
    }

    handleMouseOver() {
        this.$emit('enter');
    }

    handleMouseLeave() {
        this.$emit('leave');
    }
}
</script>
<style lang="scss" scoped>
.github-entity-preview {
    @include frostedGlassBackground;
    border-radius: 8px;
    padding: 10px 15px;
    min-width: 230px;
    max-width: 500px;
    cursor: default;
    position: relative;

    &__header {
        display: flex;
        justify-content: space-between;
        @include font12-400;
        color: var(--github-view-header-number-color);
    }

    &__title {
        @include font14-600;
        color: var(--github-view-title-color);
        margin-bottom: 6px;
    }

    &__footer {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    &__labels {
        margin-top: 6px;
    }
}
</style>

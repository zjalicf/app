<template>
    <component
        :is="entityIconComponent"
        v-bind="{ entity: entityData, size }"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import { isGithubPullRequest } from '~/plugins/entities/github';
import GithubPullRequestIcon from '~/components/github/GithubPullRequestIcon.vue';
import GithubIssueIcon from '~/components/github/GithubIssueIcon.vue';

@Component({
    name: 'GithubEntityIcon',
})
export default class GithubEntityIcon extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    @Prop({ required: false, default: null })
    entityId!: string | null;

    @Prop({ required: false, default: '14' })
    size: any;

    get entityData() {
        if (this.entityId) {
            return this.$entities.github.getById(this.entityId);
        }

        return this.entity;
    }

    get entityIconComponent() {
        if (!this.entityData) return;
        if (isGithubPullRequest(this.entityData)) {
            return GithubPullRequestIcon;
        }

        return GithubIssueIcon;
    }
}
</script>
<style lang="scss" scoped>
.gi {
}
</style>

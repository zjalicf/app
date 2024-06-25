<template>
    <div class="github-view-assignees">
        <GithubViewAssignee
            v-for="assignee in assignees"
            :key="assignee.id"
            :assignee="assignee"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import uniqBy from 'lodash/uniqBy';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import GithubViewAssignee from '~/components/github/GithubViews/GithubViewAssignee.vue';

@Component({
    name: 'GithubViewAssignees',
    components: { GithubViewAssignee },
})
export default class GithubViewAssignees extends Vue {
    @Prop({ required: true })
    entity!: GithubPullRequest | GithubIssue;

    get assignees() {
        const assignees = [];
        if (this.entity.assignee) assignees.push(this.entity.assignee);

        if (this.entity.assignees && this.entity.assignees.length) {
            assignees.push(...this.entity.assignees);
        }

        return uniqBy(assignees, 'id');
    }
}
</script>
<style lang="scss" scoped>
.github-view-assignees {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 4px 0px;
}
</style>

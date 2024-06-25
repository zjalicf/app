<template>
    <div class="issue-type">
        <img class="jira-issue--type" :src="iconUrl" :alt="issueType.name" />
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import InterfaceRemove1 from '~/components/streamline/InterfaceRemove1.vue';

@Component({
    name: 'IssueType',
    components: { InterfaceRemove1, InterfaceUserCircle },
})
export default class IssueType extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;

    @Prop({ required: false, default: null })
    entityId!: string | null;

    get issueType() {
        let entity = this.entity;
        if (this.entityId) {
            entity = this.$entities.jira.getById(this.entityId);
        }
        return entity.properties.issuetype;
    }

    get iconUrl() {
        return this.$entities.jira.getJiraAvatarUrl(this.issueType.iconUrl);
    }
}
</script>
<style lang="scss" scoped>
.issue-type {
    flex-shrink: 0;
    user-select: none;

    img {
        width: 16px;
        height: 16px;
    }
}
</style>

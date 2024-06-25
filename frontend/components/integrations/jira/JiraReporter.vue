<template>
    <div class="jira-reporter">
        <UserIcon
            class="jira-reporter--icon"
            :user="entity.properties.reporter"
        />
        <span class="jira-reporter--text">
            {{
                entity.properties.reporter
                    ? entity.properties.reporter.displayName
                    : 'Unknown'
            }}</span
        >
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import UserIcon from '~/components/integrations/jira/UserIcon.vue';

@Component({
    name: 'JiraReporter',
    components: { UserIcon },
})
export default class JiraReporter extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;
}
</script>
<style lang="scss" scoped>
.jira-reporter {
    @include font12-500;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    flex-wrap: wrap;
    color: var(--jira-reporter-text-color);

    &--icon {
        margin-right: 4px;
    }

    &--text {
        @include inputMetaStyles;
        user-select: text;
    }
}
</style>

<template>
    <JiraIssueComponent :entity-id="entityId" :context-menu-open="false" />
</template>

<script>
import JiraIssueComponent from '~/components/editor/extensions/apps/JiraIssue.vue';

export default {
    components: {
        JiraIssueComponent,
    },
    data() {
        return {
            entityId: null,
        };
    },
    mounted() {
        const { id } = this.$attrs;
        this.entityId = id;
    },
};
</script>

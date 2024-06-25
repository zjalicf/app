<template>
    <div class="jira-priority-picker">
        <ASelect
            :items="assigneesByEntity"
            :value="assignee"
            :width="150"
            :search="true"
            search-placeholder="Search assignee"
            check-placement="end"
            placeholder="No Assignee"
            @change="$emit('change', { id: $event })"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';

@Component({
    name: 'JiraAssigneePicker',
    components: { ASelect },
})
export default class JiraAssigneePicker extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;
}
</script>
<style lang="scss" scoped>
.jira-priority-picker {
}
</style>

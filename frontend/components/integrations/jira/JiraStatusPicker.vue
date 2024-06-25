<template>
    <div class="jira-status-picker">
        <ASelect
            :items="statusesByEntity"
            :value="status.id"
            :width="150"
            :search="true"
            search-placeholder="Search status"
            check-placement="end"
            @change="$emit('change', { transitionId: $event })"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';

@Component({
    name: 'JiraStatusPicker',
    components: { ASelect },
})
export default class JiraStatusPicker extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;
}
</script>
<style lang="scss" scoped>
.jira-status-picker {
}
</style>

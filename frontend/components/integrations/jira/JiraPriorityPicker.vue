<template>
    <div class="jira-priority-picker">
        <ASelect
            :items="prioritiesByEntity"
            :value="priority"
            :width="150"
            check-placement="end"
            @change="$emit('change', { id: $event })"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';

@Component({
    name: 'JiraPriorityPicker',
    components: { ASelect },
})
export default class JiraPriorityPicker extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;
}
</script>
<style lang="scss" scoped>
.jira-priority-picker {
}
</style>

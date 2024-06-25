<template>
    <div class="jira-label-picker">
        <ASelect
            :items="labelsByEntity"
            :multi="true"
            :show-arrow="false"
            :value="labels"
            :width="150"
            :placeholder="'Select Labels'"
            :search="true"
            :emit-on-close="true"
            search-placeholder="Search labels"
            @change="$emit('change', { labels: $event })"
            @close="$emit('close')"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';

@Component({
    name: 'JiraLabelPicker',
    components: { ASelect },
})
export default class JiraLabelPicker extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;
}
</script>
<style lang="scss" scoped>
.jira-label-picker {
}
</style>

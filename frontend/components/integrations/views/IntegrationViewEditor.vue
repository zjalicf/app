<template>
    <div class="integration-view-editor">
        <LinearEditViewHeader
            :view-id="viewId"
            @cancel="$emit('cancel')"
            @delete-view="$emit('delete-view', $event)"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearEditViewHeader from '~/components/linear/app/LinearEditViewHeader.vue';

@Component({
    name: 'IntegrationViewEditor',
    components: { LinearEditViewHeader },
})
export default class IntegrationViewEditor extends Vue {
    @Prop({ required: true })
    viewId!: string;
}
</script>
<style lang="scss" scoped>
.integration-view-editor {
}
</style>

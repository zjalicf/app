<template>
    <LinearDescriptionEditor :ydoc="description" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';
import LinearDescriptionEditor from '~/components/linear/modal/LinearDescriptionEditor.vue';

@Component({
    name: 'LinearViewLabels',
    components: {
        LinearDescriptionEditor,
        LinearLabelIcon,
        LinearStateIcon,
    },
})
export default class LinearViewLabels extends Vue {
    @Prop({ default: '' })
    description!: string;
}
</script>
<style lang="scss" scoped>
.linear-issue-view {
    &__description {
    }
}
</style>

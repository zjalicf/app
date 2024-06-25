<template>
    <button class="page-adder" :class="{ active: clicked }" @click="onClick">
        <InterfaceAdd1 class="icon" size="14" />
        Add Page
    </button>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { GroupingOptions } from '~/constants';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'MobilePageAdder',
    components: {
        InterfaceAdd1,
    },
})
export default class MobilePageAdder extends Vue {
    @Prop({ required: true })
    groupId!: string | null;

    @Prop({ required: true })
    groupBy!: GroupingOptions | null;

    @Prop({
        required: true,
    })
    level!: number;

    @Prop({ required: true })
    trackingType!: any;

    clicked: boolean = false;

    async onClick() {
        this.clicked = true;
        await this.$pane.hideAll();
        let pageStatus = null;
        let projectId = null;
        if (this.groupBy === GroupingOptions.PAGE_STATUS) {
            pageStatus = this.groupId;
        }
        if (this.groupBy === GroupingOptions.FOLDER) {
            projectId = this.groupId;
        }
        if (this.$route.name === 'mobile-project-id' && this.$route.params.id) {
            projectId = this.$route.params.id;
        }
        await this.$router.push({
            path: `/mobile/documents/new`,
            query: {
                pageStatus,
                project: projectId,
                level: `${this.level + 1}`,
            },
        });
        if (!this.trackingType) return;
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: this.trackingType,
        });
    }
}
</script>
<style lang="scss" scoped>
.page-adder {
    border-radius: 6px;
    color: var(--page-list-adder-color);
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 12px;

    font-weight: 400;
    font-size: 16px;
    line-height: 20px;

    &.active {
        background: var(--page-list-adder-background__hover);
        border-radius: 6px;
        color: $white;
    }
}
</style>

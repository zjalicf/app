<template>
    <button class="mobile-page-section-header">
        <component
            :is="icon"
            v-if="groupBy === GroupingOptions.PAGE_STATUS"
            class="icon"
            size="16"
            :style="{ color: workflowIconColor }"
        />
        <div v-else-if="icon" class="mobile-page-section-header__custom-icon">
            <span>{{ icon }}</span>
        </div>
        <div v-else class="mobile-page-section-header__icon">
            <InterfaceFolder class="icon" size="14" />
        </div>
        {{ sectionName }}
        <span class="mobile-page-section-header__counter">{{ count }}</span>
    </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';
import { GroupingOptions } from '~/constants';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';

@Component({
    name: 'MobilePageSectionHeader',
    computed: {
        GroupingOptions() {
            return GroupingOptions;
        },
    },
    components: {
        InterfaceFolder,
        InterfaceGeometricTriangle,
    },
})
export default class MobilePageSectionHeader extends Vue {
    @Prop()
    sectionId!: string;

    @Prop()
    sectionName!: any;

    @Prop()
    count!: number;

    @Prop()
    groupBy!: GroupingOptions;

    get workflowIconColor() {
        // @ts-ignore
        return this.$utils.page.getWorkflowIcon(this.sectionId).color;
    }

    get icon() {
        if (this.groupBy === GroupingOptions.PAGE_STATUS) {
            // @ts-ignore
            return this.$utils.page.getWorkflowIcon(this.sectionId).icon;
        }
        if (this.groupBy === GroupingOptions.FOLDER) {
            return this.$entities.folder.getIcon(this.sectionId);
        }
        return null;
    }
}
</script>

<style scoped lang="scss">
.mobile-page-section-header {
    color: var(--page-status-header-color);
    padding: 20px 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
    cursor: default;

    width: 100%;
    position: relative;

    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    &:after {
        content: '';
        width: calc(100% - 24px);
        height: 1px;
        margin: 0 12px;
        background: var(--page-status-header-border-color);
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .icon {
        color: var(--page-status-header-icon-color);
    }

    &__counter {
        @include font14-500;
        border-radius: 11.5px;
        background: var(--page-status-header-page-counter-background);
        padding: 0px 7px;
        text-align: center;
        color: var(--page-status-header-page-counter-text-color);
    }

    &__icon {
        pointer-events: none;
        padding: 1px;
        flex-shrink: 0;
        color: var(--sidebar-icon-color);
    }

    &__custom-icon {
        pointer-events: none;
        flex-shrink: 0;
        color: var(--sidebar-icon-color);
    }
}
</style>

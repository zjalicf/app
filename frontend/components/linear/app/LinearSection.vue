<template>
    <div class="linear-section" :class="{ selected }">
        <div class="linear-section__collapse">
            <InterfaceGeometricTriangle
                v-if="!section.collapsed"
                size="6"
                style="transform: rotate(180deg)"
                class="collapse-icon"
            />
            <InterfaceGeometricTriangle
                v-else
                size="6"
                style="transform: rotate(90deg)"
                class="collapse-icon"
            />
        </div>
        <div class="linear-section__wrapper">
            <LinearStateIcon
                v-if="section.groupBy === GroupByOptions.STATUS"
                :state="section"
            />
            <LinearPriorityIcon
                v-if="section.groupBy === GroupByOptions.PRIORITY"
                :priority="section"
            />
            <InterfaceDashboardLayoutSquare
                v-if="section.groupBy === GroupByOptions.PROJECT"
                :size="'14'"
            />
            <div class="linear-section__name">
                {{ section.displayName ?? section.name }}
            </div>
            <div class="linear-section__count">
                {{ section.issueCount }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import { LinearGroupByOptions } from '~/components/linear/constants';
import LinearPriorityIcon from '~/components/linear/icons/LinearPriorityIcon.vue';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';

@Component({
    name: 'LinearSection',
    components: {
        InterfaceGeometricTriangle,
        InterfaceDashboardLayoutSquare,
        LinearUserIcon,
        LinearPriorityIcon,
        LinearStateIcon,
    },
})
export default class LinearSection extends Vue {
    @Prop({ required: true, default: null })
    section: any;

    @Prop({ required: true, default: false })
    selected!: boolean;

    GroupByOptions = LinearGroupByOptions;
}
</script>
<style lang="scss" scoped>
.linear-section {
    width: 100%;
    padding: 8px 0px;
    border-bottom: 1px solid var(--page-status-header-border-color);
    user-select: none;
    display: flex;
    align-items: center;

    &__collapse {
        margin-right: 8px;
        color: var(--task-tab-collapse-button-color);
        flex-shrink: 0;
    }

    &__wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &.selected {
        .header--name {
            color: var(--jira-section-header-text-color__active);
        }

        .header--status {
            filter: brightness(120%);
        }

        .collapse-icon {
            color: var(--jira-section-header-text-color__active);
        }
    }

    &__name {
        display: flex;
        align-items: center;
        @include font14-600;
        color: var(--page-status-header-color);
    }

    &__count {
        user-select: none;
        @include font12-700;
        border-radius: 11.5px;
        background: var(--page-status-header-page-counter-background);
        padding: 0px 7px;
        text-align: center;
        color: var(--page-status-header-page-counter-text-color);
    }
}
</style>

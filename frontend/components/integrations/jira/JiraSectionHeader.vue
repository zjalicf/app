<template>
    <div
        class="header"
        :class="{ focused }"
        @click="$emit('collapse', jiraGroup.groupId)"
    >
        <div class="header--collapse">
            <InterfaceGeometricTriangle
                v-if="!jiraGroup.collapsed"
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
        <div class="header--wrapper">
            <component
                :is="jiraGroup.icon.icon"
                :style="{ color: jiraGroup.icon.color }"
                class="header--status"
            />
            <div class="header--name">
                {{ jiraGroup.name }}
            </div>
            <div class="header--count">
                {{ jiraGroup.issuesCount }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';

@Component({
    name: 'JiraSectionHeader',
    components: { InterfaceGeometricTriangle },
})
export default class JiraSectionHeader extends Vue {
    @Prop({
        default: null,
    })
    jiraGroup!: any;

    @Prop({
        default: false,
    })
    collapsible!: boolean;

    @Prop({
        default: false,
    })
    focused!: boolean;
}
</script>
<style lang="scss" scoped>
.header {
    @include font14-600;
    height: 100%;
    width: 100%;
    padding: 8px 0px;
    border-bottom: 1px solid var(--page-status-header-border-color);

    display: flex;
    align-items: center;
    justify-content: flex-start;

    user-select: none;
    cursor: default;

    &--collapse {
        display: flex;
        align-items: center;
        margin-right: 8px;

        .collapse-icon {
            flex-shrink: 0;
            color: var(--task-tab-collapse-button-color);
        }
    }

    &.focused {
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

    &--wrapper {
        display: flex;
        align-items: center;
        width: 100%;

        //padding-bottom: 7px;
    }

    &--status {
        margin-right: 8px;
    }

    &--name {
        color: var(--page-status-header-color);
        margin-right: 8px;
    }

    &--count {
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

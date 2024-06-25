<template>
    <div class="github-section-header" @click="$emit('collapse', group.id)">
        <div class="github-section-header--collapse">
            <InterfaceGeometricTriangle
                v-if="!group.collapsed"
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
        <div class="github-section-header--wrapper">
            <div class="github-section-header--name">
                {{ group.name }}
            </div>
            <div class="github-section-header--count">
                {{ group.count }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceGeometricTriangle from '~/components/streamline/InterfaceGeometricTriangle.vue';

//
// {
//     isHeader: true,
//         id: group,
//     name: capitalize(group),
//     groupId: group,
//     issuesCount: 0,
//     isSelectable: true,
//     collapsed: this.isCollapsible && !!collapsed[group],
// };

@Component({
    name: 'GithubSectionHeader',
    components: { InterfaceGeometricTriangle },
})
export default class GithubSectionHeader extends Vue {
    @Prop({
        default: null,
    })
    group!: any;
}
</script>
<style lang="scss" scoped>
.github-section-header {
    @include font14-600;
    height: 100%;
    width: 100%;
    border-bottom: 1px solid var(--page-status-header-border-color);
    padding: 8px 0px;

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

    &--wrapper {
        display: flex;
        align-items: center;
        width: 100%;
    }

    &--name {
        color: var(--page-status-header-color);
        margin-right: 8px;
    }

    &--count {
        @include font12-700;
        border-radius: 11.5px;
        background: var(--page-status-header-page-counter-background);
        padding: 0px 7px;
        text-align: center;
        color: var(--page-status-header-page-counter-text-color);
    }
}
</style>

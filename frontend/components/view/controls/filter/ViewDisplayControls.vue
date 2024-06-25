<template>
    <div class="view-display-controls">
        <div class="view-display-controls__section__title">Display</div>
        <PageGroupBy
            v-if="showGroupOptions"
            class="view-display-controls__item"
            :view-options="viewOptions"
            :entity-id="entityId"
            @update="$emit('update', $event)"
        />
        <PageSortBy
            class="view-display-controls__item"
            :view-options="viewOptions"
            @update="$emit('update', $event)"
        />
        <PageShowTasks
            class="view-display-controls__item"
            :view-options="viewOptions"
            @update="$emit('update', $event)"
        />
        <PageHideCompletedTasks
            v-if="viewOptions.showTasks"
            class="view-display-controls__item"
            :view-options="viewOptions"
            @update="$emit('update', $event)"
        />
        <div class="view-display-controls__section">
            <div class="view-display-controls__section__title">
                DISPLAY PROPERTIES
            </div>
            <PageDisplayProperties
                :view-options="viewOptions"
                :entity-id="entityId"
                @update="$emit('update', $event)"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import PageSortBy from '~/components/view/controls/display/PageSortBy.vue';
import PageDisplayProperties from '~/components/view/controls/display/PageDisplayProperties.vue';
import PageGroupBy from '~/components/view/controls/display/PageGroupBy.vue';
import PageShowTasks from '~/components/view/controls/display/PageShowTasks.vue';
import PageHideCompletedTasks from '~/components/view/controls/filter/PageHideCompletedTasks.vue';
import { PageListSymbols } from '~/constants/symbols';
import { PageListType } from '~/constants';

@Component({
    name: 'PageListControlsDropdown',
    components: {
        PageHideCompletedTasks,
        PageShowTasks,
        PageGroupBy,
        PageDisplayProperties,
        PageSortBy,
    },
})
export default class PageListControlsDropdown extends Vue {
    @Prop({})
    tabId!: string;

    @Prop({})
    entityId!: string;

    @Prop({ default: true })
    showGroupOptions!: boolean;

    @Inject(PageListSymbols.TYPE)
    pageListType!: PageListType;

    get view() {
        return this.$entities.view.getViewById(this.entityId);
    }

    get viewOptions() {
        return this.$utils.pageList.getPageListViewOptions(
            this.pageListType,
            this.entityId,
        );
    }
}
</script>
<style lang="scss" scoped>
.view-display-controls {
    &__item {
        margin-bottom: 10px;
    }

    &__section {
        &__title {
            @include font10-700;
            padding: 0 0 8px;
            color: var(--dropdown-button-text-color);
        }
    }
}
</style>

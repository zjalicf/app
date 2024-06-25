<template>
    <div class="view-header">
        <div class="view-header__title">
            <ViewIcon :id="entityId" size="24" class="icon" />
            <h1>{{ name }}</h1>
        </div>
        <PageListOptionsWrapper
            v-if="!$entities.view.isDefaultView(entityId)"
            :dropdown-config="dropdownConfig"
        />
    </div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';
import ViewIcon from '~/components/view/ViewIcon.vue';
import PageListOptionsWrapper from '~/components/page-list/list/header/PageListOptionsWrapper.vue';
import ViewOptionsDropdown from '~/components/view/ViewOptionsDropdown.vue';

@Component({
    name: 'ViewHeader',
    computed: {},
    components: { PageListOptionsWrapper, ViewIcon },
})
export default class ViewHeader extends Vue {
    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    dropdownConfig = {
        component: ViewOptionsDropdown,
        on: {
            edit: () =>
                this.$entities.view.update({
                    id: this.entityId,
                    editing: true,
                }),
            delete: () => this.$entities.view.deleteView(this.entityId),
        },
    };

    get name() {
        return this.$entities.view.getViewName(this.entityId);
    }
}
</script>
<style lang="scss" scoped>
.view-header {
    display: flex;
    align-items: center;
    overflow: hidden;

    &__title {
        overflow: hidden;
        color: var(--tab-title-text-color);
        font-weight: bold;
        font-size: 26px;
        line-height: 40px;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 6px;
        border-radius: 6px;
        margin-right: 6px;
        width: 100%;

        h1 {
            @include ellipsis;
        }
        .icon {
            color: var(--header-all-pages-icon-color);
            flex-shrink: 0;
        }
    }
}
</style>

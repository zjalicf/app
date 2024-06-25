<template>
    <div class="mobile-view page">
        <MobileViewHeader :view="view" />
        <MobilePageListWrapper
            :pages="pages"
            :display-options="$entities.view.getViewOptions(view.id)"
            :page-list-type="view.type"
            :empty-text="emptyText"
            :traking-type="trackingType"
            :level="level"
        />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IView } from '~/components/view/model';
import MobilePageListWrapper from '~/components/mobile/common/page-list/MobilePageListWrapper.vue';
import MobileViewHeader from '~/components/mobile/common/headers/MobileViewHeader.vue';
import { ViewType } from '~/constants';
import { Tab } from '~/@types/app';

@Component({
    name: 'mobile-view',
    layout: 'mobile',
    computed: {},
    components: { MobileViewHeader, MobilePageListWrapper },
    asyncData({ route, $entities }) {
        const view = $entities.view.getViewById(route.params.id);
        return { view };
    },
})
export default class View extends Vue {
    view!: IView;

    get trackingType() {
        if (!this.view) return null;
        return this.$tracking._resolveViewSource({
            entityId: this.view.id,
        } as Tab);
    }

    get level() {
        if (!this.$route.query.level) return null;
        return +this.$route.query.level + 1;
    }

    get viewDefinition() {
        if (this.view.type === ViewType.ALL_PAGES) {
            return [
                {
                    combine: 'and',
                    definition: [
                        {
                            property: 'dailyDoc',
                            operation: 'isNotSet',
                        },
                        ...this.view.definition,
                    ],
                },
            ];
        }
        return this.view.definition;
    }

    get pages() {
        return this.$entities.view.getPagesByDefinition(this.viewDefinition);
    }

    get emptyText() {
        if (this.view.type === ViewType.ALL_PAGES) {
            return 'No pages found';
        }
        if (this.view.type === ViewType.ACTIVE) {
            return 'No active pages found';
        }
        if (this.view.type === ViewType.ARCHIVE) {
            return 'No archived pages found';
        }
        return 'No pages found';
    }
}
</script>
<style lang="scss" scoped>
.mobile-view {
    background: var(--app-mobile-bg-color);
    width: 100%;
    height: $pageHeight;
}
</style>

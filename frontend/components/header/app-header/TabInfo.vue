<template>
    <div class="tab-info no-drag">
        <button class="tab-info--wrapper" @click="openSearch">
            <p>{{ title }}</p>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { format, startOfDay } from 'date-fns';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';
import { TabType } from '~/constants';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import SearchComponent from '~/components/search/SearchComponent.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'TabInfo',
    components: {
        SearchComponent,
        InterfaceSettingMenuHorizontal,
        InterfaceSearch,
    },
})
export default class TabInfo extends Vue {
    get document() {
        return (
            (this.activeTab.type === TabType.DOCUMENT &&
                this.$store.getters['document/byId'](
                    this.activeTab.entityId,
                )) ??
            this.$store.getters['document/byClip'](this.activeTab.entityId)
        );
    }

    get clipData() {
        return this.$store.getters['integrationData/byId'](
            this.activeTab?.entityId,
        );
    }

    get title() {
        switch (this.activeTab?.type) {
            case TabType.DOCUMENT:
                return this.document?.title?.length > 0
                    ? this.document.title
                    : this.clipData
                    ? this.clipData.text
                    : 'Untitled';

            case TabType.MY_DAY:
                return `My Day - ${format(
                    this.activeTab.data.date,
                    'EEEE, LLL d, yyyy',
                )}`;
            case TabType.JIRA_APP:
                return 'Jira';
            case TabType.GITHUB_APP:
                return 'Github';
            case TabType.VIEW:
                return this.$entities.view.getViewName(this.activeTab.entityId);
            case TabType.LINEAR_APP:
                return this.$entities.linear.getViewDefinition(
                    this.activeTab.data?.activeTab,
                )?.name
                    ? `Linear - ${
                          this.$entities.linear.getViewDefinition(
                              this.activeTab.data?.activeTab,
                          )?.name
                      }`
                    : 'Linear';
            case TabType.PROJECT:
                return this.$entities.folder.getName(this.activeTab.entityId);
            default:
                return 'New Tab';
        }
    }

    get activeGroup() {
        return this.$store.getters['tabs/activeGroup'];
    }

    get activeTabId() {
        return this.activeGroup?.activeTab;
    }

    get activeTab() {
        return this.$store.getters['tabs/byId'](this.activeTabId);
    }

    get tabGroups() {
        return this.$store.getters['tabs/groups'];
    }

    openSearch() {
        this.$nuxt.$emit('open-search', {
            includeInteractions: true,
            source: TrackingActionSource.CLICK,
        });
    }
}
</script>
<style lang="scss" scoped>
.tab-info {
    width: 100%;

    &--wrapper {
        margin: 3px;
        width: calc(100% - 6px);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: var(--navigation-info-color);
        user-select: none;
        font-weight: 500;
        font-size: 13px;
        line-height: 20px;
        padding: 3px 13px 3px 13px;
        overflow: hidden;
        background: var(--navigation-info-bg-color);
        border: 1px solid var(--navigation-info-border-color);
        border-radius: 8px;
        filter: var(--navigation-info-filter);
        box-shadow: var(--navigation-info-box-shadow);

        &:hover {
            background: var(--navigation-info-bg-color__hover);
            border: 1px solid var(--navigation-info-border-color__hover);
            filter: none;
        }

        p {
            @include ellipsis;
            width: 100%;
            text-align: left;
        }
    }

    &--header {
        margin-right: 6px;
    }
}
</style>

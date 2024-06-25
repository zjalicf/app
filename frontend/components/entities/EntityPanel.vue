<template>
    <div
        class="entity-panel"
        :class="{
            'entity-panel--detached': shouldDetachPanel,
            'entity-panel__border-visible': borderVisible,
        }"
        @mousedown="$emit('focus-tab')"
    >
        <div class="entity-panel__wrapper">
            <component
                :is="_panelComponent"
                :key="id"
                :detached="shouldDetachPanel"
                :entity-id-prop="panelDataId"
                class="entity-panel__panel"
                @close="$emit('panel:close')"
                @open-mount="$emit('panel:mounted')"
                @heading:click="$emit('heading:click', $event)"
            />
        </div>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Vue,
    Watch,
} from 'vue-property-decorator';
import { v4 } from 'uuid';
import { TabSymbols } from '~/constants/symbols';
import { PANEL_DETACH_WIDTH, PanelTypes } from '~/constants';
import { isGithubEntity } from '~/plugins/entities/github';
import { JiraIntegrationDataType } from '~/constants/jira';
import PagePanel from '~/components/entities/page/PagePanel.vue';
import GithubPanel from '~/components/github/GithubPanel.vue';
import JiraPanel from '~/components/entities/jira/JiraPanel.vue';
import { GithubIntegrationDataType } from '~/components/github/github';
import MyDayPanel from '~/components/entities/my-day/MyDayPanel.vue';

@Component({
    name: 'EntityPanel',
})
export default class EntityPanel extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    @Inject(TabSymbols.TAB_GROUP_ID)
    groupId!: string;

    @InjectReactive(TabSymbols.TAB_WIDTH)
    tabWidth!: number;

    @InjectReactive(TabSymbols.ENTITY_TYPE)
    entityType!: string;

    _panelComponent: any = null;
    id: string = v4();

    @Watch('tabId')
    @Watch('entityId')
    @Watch('panelType', { immediate: true })
    handlePanelTypeChange() {
        let component: any = PagePanel;

        if (this.panelType === GithubIntegrationDataType.PR) {
            component = GithubPanel;
        } else if (this.panelType === JiraIntegrationDataType.ISSUE) {
            component = JiraPanel;
        } else if (this.panelType === PanelTypes.MY_DAY) {
            component = MyDayPanel;
        }

        this._panelComponent = component;
        this.id = v4();
    }

    get borderVisible() {
        return (
            this.panelType &&
            !isGithubEntity(this.panelType) &&
            this.panelType !== JiraIntegrationDataType.ISSUE
        );
    }

    get shouldDetachPanel() {
        return this.tabWidth < PANEL_DETACH_WIDTH;
    }

    get document() {
        return (
            this.$store.getters['document/byId'](this.entityId) ??
            this.$store.getters['document/byClip'](this.entityId) ??
            null
        );
    }

    get tab() {
        return this.$store.getters['tabs/byId'](this.tabId);
    }

    get panelType() {
        return this.$store.getters['tabs/byId'](this.tabId).data.panelType;
    }

    get panelDataId() {
        return (
            this.$store.getters['tabs/byId'](this.tabId).data?.panelData?.id ??
            null
        );
    }
}
</script>
<style lang="scss" scoped>
.entity-panel {
    //@include scrollbar(68px, 9px);
    height: $desktopContentHeight;

    overflow-y: hidden;
    overflow-x: hidden;
    border-left: 1px solid var(--tab-divider-color);

    &__border-visible {
        border-left: 1px solid var(--tab-divider-color);
        overflow-y: overlay;

        .entity-panel--wrapper {
            overflow-y: hidden;
        }
    }

    .tab-group__active & {
        @include scrollbar(102px, 9px);
    }

    &__wrapper {
        position: relative;
        width: 100%;
        height: 100%;

        padding-top: 34px;

        .tabs-content__single & {
            padding-top: 0px;
        }
    }

    &--detached {
        @include scrollbar(3px, 9px);
        overflow-y: overlay;
        overflow-x: hidden;
        position: absolute;
        z-index: 1;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        border: none;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 12px;

        top: 20px;
        background: var(--entities-panel-bg-color__detached);
    }

    &__backdrop {
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        border-radius: 12px;
    }
}
</style>

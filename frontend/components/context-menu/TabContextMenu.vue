<template>
    <div class="tab-context-menu">
        <DropdownButton
            v-if="invokeFrom !== 'tab'"
            tabindex="-1"
            @click="newTab"
        >
            <div class="tab-context-menu--left">
                <InterfaceAddSquare size="14" class="icon" />
                Open in new Tab
            </div>
            <div v-if="invokeFrom !== 'tab'" class="tab-context-menu--right">
                <TooltipKeys :keybind="'meta+click'" />
            </div>
        </DropdownButton>
        <DropdownButton class="empty-link" @click="split">
            <div class="tab-context-menu--left">
                <InterfaceLayoutTwoColumns class="icon" />
                Split Right
            </div>
            <div v-if="invokeFrom !== 'tab'" class="tab-context-menu--right">
                <TooltipKeys :keybind="'alt+click'" />
            </div>
        </DropdownButton>
        <DropdownButton
            v-if="!isSingleTab && invokeFrom === 'tab'"
            class="empty-link"
            @click="splitMoveRight"
        >
            <InterfaceArrowsMoveRight class="icon" />
            Split and Move Right
        </DropdownButton>
        <DropdownButton
            v-if="invokeFrom === 'tab'"
            class="tab-context-menu--button"
            @click="close"
        >
            <div class="tab-context-menu--left">
                <InterfaceDeleteSquare class="icon" />
                Close Tab
            </div>
            <div class="tab-context-menu--right">
                <TooltipKeys :keybind="'meta+w'" />
            </div>
        </DropdownButton>
        <DropdownButton
            v-if="invokeFrom === 'tab'"
            class="tab-context-menu--button"
            @click="closeOther"
            ><div class="tab-context-menu--left">
                <InterfaceDeleteSquare class="icon" />
                Close Other Tabs
            </div></DropdownButton
        >
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import InterfaceLayoutTwoColumns from '~/components/streamline/InterfaceLayoutTwoColumns.vue';
import InterfaceArrowsMoveRight from '~/components/streamline/InterfaceArrowsMoveRight.vue';
import { Tab, TabGroup } from '~/@types/app';
import InterfaceDeleteSquare from '~/components/streamline/InterfaceDeleteSquare.vue';
import InterfaceAddSquare from '~/components/streamline/InterfaceAddSquare.vue';
import TooltipKeys from '~/components/cheatsheet/TootipKeys.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'TabContextMenu',
    components: {
        DropdownButton,
        InterfaceAddSquare,
        InterfaceDeleteSquare,
        InterfaceLayoutTwoColumns,
        InterfaceArrowsMoveRight,
        TooltipKeys,
    },
})
export default class TabContextMenu extends Vue {
    @Prop({ required: true })
    tab!: Tab;

    @Prop({ default: null })
    group!: TabGroup;

    @Prop({ default: '' })
    invokeFrom!: string;

    get isSingleTab() {
        return this.group && this.group.tabs.length <= 1;
    }

    async split() {
        this.$emit('close');
        const newTab = { ...this.tab, id: v4() };
        await this.$store.dispatch('tabs/createNewTab', newTab);
        this.$tabs.splitRight(newTab, this.group, this.group);

        const sourceMeta = this.$tracking.resolveSourceFromTab(newTab);
        this.$tracking.trackEventV2(TrackingType.TABS, {
            action: TrackingAction.SPLIT,
            source: TrackingActionSource.CONTEXT_MENU,
            // @ts-ignore
            sourceMeta,
        });
    }

    async splitMoveRight() {
        this.$emit('close');
        const newTab = { ...this.tab, id: v4() };
        await this.$store.dispatch('tabs/createNewTab', newTab);
        await this.$tabs.closeTab(this.tab, this.group?.id);
        const group = await this.$tabs.splitRight(
            newTab,
            this.group,
            this.group,
        );
        await this.$tabs._activateTab(newTab, group?.id);

        const sourceMeta = this.$tracking.resolveSourceFromTab(newTab);
        this.$tracking.trackEventV2(TrackingType.TABS, {
            action: TrackingAction.SPLIT,
            source: TrackingActionSource.CONTEXT_MENU,
            // @ts-ignore
            sourceMeta,
        });
    }

    close() {
        this.$emit('close');
        this.$tabs.closeTab(this.tab, this.group.id);
    }

    closeOther() {
        this.$emit('close');
        this.$tabs.closeOtherTabs(this.tab);
    }

    newTab() {
        const sourceMeta = this.$tracking.resolveSourceFromTab(this.tab);
        this.$tracking.trackEventV2(TrackingType.TABS, {
            action: TrackingAction.OPEN_IN_NEW_TAB,
            source: TrackingActionSource.CONTEXT_MENU,
            // @ts-ignore
            sourceMeta,
        });
        this.$tabs.openTab(this.tab, this.group?.id ?? null, {
            openInNewTab: true,
        });
        this.$emit('close');
    }
}
</script>

<style lang="scss" scoped>
.tab-context-menu {
    @include contextMenu;
    padding: 0;
    min-width: 220px;

    &--left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &--right {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        :deep(.tooltip-keys--button) {
            background: none;
            color: var(--context-menu-tooltip-keys-color);
            margin-right: 0;
            padding-right: 0;
            height: 18px;
        }
    }

    &--button {
        justify-content: space-between;
    }
}
</style>

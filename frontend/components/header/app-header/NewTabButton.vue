<template>
    <div class="new-tab drag">
        <button class="no-drag" @click.prevent.stop="newTab">
            <tippy
                :content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.TABS_NEW,
                    )
                "
                :delay="[500, 20]"
                theme="tooltip"
                :touch="false"
            >
                <InterfaceAdd1 class="icon" size="14" />
            </tippy>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';

import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { TabType } from '~/constants';
import { TabGroup } from '~/@types/app';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'NewTabButton',
    components: {
        InterfaceAdd1,
    },
})
export default class NewTabButton extends Vue {
    get activeTab() {
        return this.$utils.navigation.activeTab;
    }

    get activeGroup(): TabGroup {
        return this.$store.getters['tabs/activeGroup'];
    }

    newTab(e: MouseEvent) {
        const exists = this.activeGroup.tabs.find(
            ({ type }) => type === TabType.NEW,
        );
        if (exists) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            this.$tabs.activateTab(exists, this.activeGroup.id);
            this.$nuxt.$emit('open-search', {
                source: TrackingActionSource.NEW_TAB,
            });
            return;
        }

        const tab = this.$tabs.createNewTabObject(v4(), TabType.NEW);
        this.$tabs.openTab(tab, this.activeGroup.id, {
            openInNewTab: true,
        });
        this.$nuxt.$emit('open-search', {
            source: TrackingActionSource.NEW_TAB,
        });
    }
}
</script>
<style lang="scss" scoped>
.new-tab {
    button {
        padding: 7px;
        color: var(--app-bg-icon-color);
        border-radius: 6px;

        &:hover {
            background: var(--app-bg-icon-bg-color__hover);
            color: var(--app-bg-icon-color__hover);
        }
    }
}
</style>

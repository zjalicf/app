<template>
    <div class="github-tab-context-menu">
        <DropdownButton @click="openGithubSettings">
            <InterfaceSettingCog class="icon" />
            Github Settings
        </DropdownButton>
        <slot name="sidebar-options" />
        <slot name="tab-options" />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'GithubTabContextMenu',
    components: { InterfaceSettingCog, DropdownButton },
})
export default class GithubTabContextMenu extends Vue {
    openGithubSettings() {
        this.$emit('close');
        this.$entities.github.openSettings(
            TrackingActionSource.GITHUB_BENTO_CONTEXT_MENU,
        );
    }
}
</script>
<style lang="scss" scoped>
.github-tab-context-menu {
    @include frostedGlassBackground;
    @include contextMenu;
}
</style>

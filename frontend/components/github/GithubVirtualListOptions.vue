<template>
    <button
        ref="button"
        class="github-virtual-list-options"
        :class="{ active }"
        @click="openOptions"
    >
        <InterfaceSettingSliderVertical />
    </button>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import InterfaceSettingSliderVertical from '~/components/streamline/InterfaceSettingSliderVertical.vue';
import GithubOptionsDropdown from '~/components/github/GithubOptionsDropdown.vue';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'GithubVirtualListOptions',
    components: { InterfaceSettingSliderVertical },
})
export default class GithubVirtualListOptions extends Vue {
    @Prop({ required: true })
    activeTab!: 'issues' | 'pulls' | 'recent';

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    active: boolean = false;
    $refs!: {
        button: HTMLButtonElement;
    };

    openOptions() {
        this.active = true;
        this.$dropdown.show({
            parent: this.$refs.button,
            component: GithubOptionsDropdown,
            popperOptions: {
                placement: 'bottom-end',
            },
            retainFocus: true,
            bind: {
                tabId: this.tabId,
            },
            on: {
                updateOptions: (options: any) => {
                    this.$emit('updateOptions', options);
                },
            },
            onClose: () => {
                this.active = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.github-virtual-list-options {
    padding: 7px;
    border-radius: 6px;
    color: var(--tab-controls-icon-color);

    &:hover,
    &.active {
        background: var(--tab-controls-bg-color__hover);
        color: var(--tab-controls-icon-color__hover);
    }
}
</style>

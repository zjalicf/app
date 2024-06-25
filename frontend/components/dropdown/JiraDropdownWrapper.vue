<template>
    <button ref="jiraDropdown" :class="{ active }" @click="openJiraDropdown">
        <InterfaceSettingSliderVertical size="14" />
    </button>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import InterfaceSettingSliderVertical from '~/components/streamline/InterfaceSettingSliderVertical.vue';
import JiraDropdown from '~/components/dropdown/JiraDropdown.vue';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'JiraDropdownWrapper',
    components: { InterfaceSettingSliderVertical },
})
export default class JiraDropdownWrapper extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    active: boolean = false;
    $refs!: {
        jiraDropdown: HTMLElement;
    };

    openJiraDropdown() {
        this.active = true;
        this.$dropdown.show({
            parent: this.$refs.jiraDropdown,
            component: JiraDropdown,
            retainFocus: true,
            bind: {
                tabId: this.tabId,
            },
            on: {
                update: (value: boolean) => {
                    this.$emit('update', value);
                },
            },
            onClose: () => {
                this.active = false;
            },
            popperOptions: {
                placement: 'bottom-end',
            },
        });
    }
}
</script>
<style lang="scss" scoped>
button {
    color: var(--tab-controls-icon-color);
    padding: 7px;
    border-radius: 6px;

    &:hover,
    &.active {
        background: var(--tab-controls-bg-color__hover);
        color: var(--tab-controls-icon-color__hover);
    }
}
</style>

<template>
    <div @mousedown="handleMouseDown">
        <transition name="fade-move">
            <div v-if="items.length > 0 && show" class="items">
                <button
                    v-for="(item, index) in items"
                    :key="index"
                    :data-e2e="`autocomplete-${item}`"
                    :class="{ active: index === selectedIndex }"
                    class="item"
                    @click="selectItem(index)"
                >
                    <InterfaceValidationCheck
                        v-if="item === 'Task'"
                        class="icon"
                        size="14"
                    />
                    <InterfaceContentFileAlternate
                        v-if="item === 'Link Page'"
                        class="icon"
                        size="14"
                    />
                    <ImagePictureLandscape1
                        v-if="item === 'Image'"
                        class="icon"
                        size="14"
                    />
                    <ProgrammingBrowserCode1
                        v-if="item === 'Code Block'"
                        class="icon"
                        size="14"
                    />
                    <ShoppingBusinessTable
                        v-if="item === 'Table'"
                        class="icon"
                        size="14"
                    />
                    <ClipboardListIcon
                        v-if="item === 'Checklist'"
                        class="icon"
                        size="14"
                    />
                    <ViewListIcon
                        v-if="item === 'Task List'"
                        class="icon"
                        size="14"
                    />
                    <MoneyCashierCalculator1
                        v-if="item === 'Equation'"
                        class="icon"
                        size="14"
                    />
                    <InterfaceEditSwatch
                        v-if="item === 'Template'"
                        class="icon"
                        size="14"
                    />
                    <MoneyGraphPieChart
                        v-if="item === 'Mermaid'"
                        class="icon"
                        size="14"
                    />
                    <JiraIcon
                        v-if="item === 'Jira Issue'"
                        class="icon"
                        size="14"
                    />
                    <LinearIconRound
                        v-if="item === 'Linear Issue'"
                        class="icon"
                        size="14"
                    />
                    <GithubIcon
                        v-if="item === 'Github Pull Request'"
                        class="icon"
                        size="14"
                    />
                    <GithubIcon
                        v-if="item === 'Github Issue'"
                        class="icon"
                        size="14"
                    />
                    <GithubIcon
                        v-if="item === 'Github Link'"
                        class="icon"
                        size="14"
                    />
                    <GithubIcon
                        v-if="item === 'Github Link Block'"
                        class="icon"
                        size="14"
                    />
                    <InterfaceAlertInformationCircle
                        v-if="item === 'Callout'"
                        class="icon"
                        size="14"
                    />
                    {{ item }}
                </button>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { ClipboardListIcon, ViewListIcon } from '@vue-hero-icons/solid';
import {
    ImageIcon,
    KaTeXDollarIcon,
    KaTeXBlockIcon,
    MermaidIcon,
} from '@/components/icons';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import ImagePictureLandscape1 from '~/components/streamline/ImagePictureLandscape1.vue';
import InterfaceEditSwatch from '~/components/streamline/InterfaceEditSwatch.vue';
import ProgrammingBrowserCode1 from '~/components/streamline/ProgrammingBrowserCode1.vue';
import ShoppingBusinessTable from '~/components/streamline/ShoppingBusinessTable.vue';
import MoneyCashierCalculator1 from '~/components/streamline/MoneyCashierCalculator1.vue';
import MoneyGraphPieChart from '~/components/streamline/MoneyGraphPieChart.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import { TrackingType } from '~/@types/tracking';
import LinearIconRound from '~/components/linear/icons/LinearIconRound.vue';

@Component({
    name: 'AutocompleteComponent',
    components: {
        LinearIconRound,
        GithubIcon,
        ClipboardListIcon,
        ImageIcon,
        ImagePictureLandscape1,
        InterfaceCalendar,
        InterfaceContentFileAlternate,
        InterfaceEditSwatch,
        InterfaceValidationCheck,
        JiraIcon,
        KaTeXBlockIcon,
        KaTeXDollarIcon,
        MermaidIcon,
        MoneyCashierCalculator1,
        MoneyGraphPieChart,
        ProgrammingBrowserCode1,
        ShoppingBusinessTable,
        ViewListIcon,
        InterfaceAlertInformationCircle,
    },
})
export default class AutocompleteComponent extends Vue {
    @Prop()
    items!: string[];

    show: boolean = false;
    @Prop()
    command!: (commandData: any) => void;

    selectedIndex: number = 0;

    mounted() {
        this.show = true;
    }

    @Watch('items')
    onItemsChanged() {
        this.selectedIndex = 0;
    }

    handleMouseDown(e: MouseEvent) {
        if (this.$nuxt.$utils.isMobile) {
            e.preventDefault();
        }
    }

    onKeyDown({ event }: any) {
        if (!this.items.length) return false;
        if (event.key === 'ArrowUp') {
            this.upHandler();
            return true;
        }
        if (event.key === 'ArrowDown') {
            this.downHandler();
            return true;
        }
        if (event.key === 'Enter') {
            this.enterHandler();
            return true;
        }
        return false;
    }

    selectIndex(index: number) {
        this.selectedIndex = index;
    }

    upHandler() {
        this.selectedIndex =
            (this.selectedIndex + this.items.length - 1) % this.items.length;
    }

    downHandler() {
        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    }

    enterHandler() {
        this.selectItem(this.selectedIndex);
    }

    selectItem(index: number) {
        const item = this.items[index];
        if (item) {
            this.command({ id: item });
            try {
                this.$nuxt.$tracking.trackEvent('editor', {
                    action: `insert-${item.toLowerCase().replace(' ', '-')}`,
                });
            } catch (e) {
                console.error(e);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.items {
    @include frostedGlassBackground;
    @include contextMenu;

    .mobile & {
        .item {
            padding: 6px 8px;
            min-width: 200px;
        }
    }
}
</style>

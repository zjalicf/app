<template>
    <div
        class="page-adder"
        :class="{ focused: focused || inputting, dragging }"
    >
        <button
            v-if="!inputting"
            class="page-adder__button"
            @click="onStartInput"
        >
            <InterfaceAdd1 class="icon" size="12" />
            Add Page
        </button>
        <div v-else class="page-adder__input-wrapper">
            <InterfaceAdd1 class="icon" size="12" />
            <input
                ref="input"
                v-model="newPageTitle"
                spellcheck="false"
                autocomplete="off"
                @keydown.enter="onNewPage"
                @keydown.esc="onInputCancel"
                @blur="onBlur"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { GroupingOptions, PageStatus, TabType } from '~/constants';
import { TabSymbols } from '~/constants/symbols';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'PageAdder',
    components: {
        InterfaceAdd1,
    },
})
export default class PageAdder extends Vue {
    @Prop()
    groupBy!: GroupingOptions;

    @Prop({ required: true })
    groupId!: PageStatus | string | null;

    @Prop({ default: false })
    focused!: boolean;

    @Prop({ default: false })
    dragging!: boolean;

    @Prop({ default: false })
    adderFocused!: boolean;

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    $refs!: {
        input: HTMLInputElement;
    };

    inputting: boolean = false;
    newPageTitle: string = '';

    get source() {
        return this.$tracking.resolveSourceFromTab(this.tabId);
    }

    get sourceMeta() {
        return this.$tracking.resolveSourceMetaFromTab(this.tabId);
    }

    onStartInput() {
        this.inputting = true;
        this.newPageTitle = '';
        this.$nextTick(() => this.$refs.input.focus());
        this.$emit('focused');
    }

    onBlur(event: FocusEvent) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        this.inputting = false;
        this.newPageTitle = '';
    }

    onInputCancel() {
        this.$refs.input.blur();
    }

    async onNewPage(event: KeyboardEvent) {
        if (!this.newPageTitle) {
            this.onInputCancel();
            return;
        }
        const page = {
            title: this.newPageTitle,
        } as any;
        if (this.groupBy === GroupingOptions.PAGE_STATUS) {
            page.pageStatus = this.groupId;
        }
        if (this.groupBy === GroupingOptions.FOLDER) {
            page.projectId = this.groupId;
        }
        const pageId = await this.$utils.page.newPage(page, {
            showNotification: true,
        });

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: this.source,
            sourceMeta: this.sourceMeta,
            entityId: pageId,
        });

        if (event.shiftKey) {
            this.$refs.input?.blur();
            const tab = this.$tabs.createNewTabObject(pageId, TabType.DOCUMENT);
            this.$tabs.openTab(tab);
        } else {
            this.$emit('new-page');
        }
    }

    mounted() {
        if (this.adderFocused) {
            this.onStartInput();
        }
    }
}
</script>
<style lang="scss" scoped>
.page-adder {
    font-weight: 500;
    font-size: 13px;
    line-height: 24px;
    border-radius: 6px;
    color: var(--page-list-adder-color);

    &:hover:not(.dragging),
    &.focused {
        background: var(--document-card-bg-color_hover);
    }

    &.focused {
        background: var(--page-list-adder-background__hover);
        border-radius: 6px;
    }

    &__button {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 4px 15px;

        .icon {
            color: var(--page-list-adder-icon-color);
        }

        &:hover:not(.dragging) {
            color: var(--page-list-adder-color__hover);

            .icon {
                color: var(--page-list-adder-icon-color__hover);
            }
        }
    }

    &__input-wrapper {
        @include inputMetaStyles;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--document-row-title-text-color);
        width: 100%;
        padding: 4px 15px;

        .icon {
            color: var(--page-list-adder-icon-color);
        }

        input {
            outline: none;
            width: 100%;
        }
    }
}
</style>

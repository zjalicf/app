<template>
    <div
        ref="viewEditor"
        class="view-edit-header"
        :class="{ 'single-tab': isSingleTab }"
    >
        <div class="view-edit-header__header">
            <div class="view-edit-header__header__wrapper">
                <input
                    ref="nameInput"
                    placeholder="Linear Filter Name"
                    :value="name"
                    @input="onInputName"
                    @keydown.enter="handleEnter"
                />
            </div>
        </div>
        <div class="view-edit-header__body">
            <div class="view-edit-header__body__banners">
                <LinearTeamFilter
                    v-if="teams.length > 1 && view.teamId"
                    :team-id="view.teamId"
                    @update="handleTeamUpdate"
                />
                <LinearFilterItem
                    v-for="(filter, index) in view.filters"
                    :key="index"
                    :view-id="view.id"
                    :team-id="view.teamId"
                    :property="filter.property"
                    :operation="filter.operation"
                    :value="filter.value"
                    :filters="view.filters"
                    @remove="removeFilter(index)"
                    @change="changeFilter(index, $event)"
                />
                <div
                    v-if="view.filters.length < 7"
                    class="view-edit-header__body__add-filter"
                    @click.stop.prevent="createFilter"
                >
                    + Add Filter
                </div>
            </div>
        </div>
        <div class="view-edit-header__footer">
            <div class="view-edit-header__footer__count">
                <!--                <LoadingIcon v-if="isLoading" size="14" />-->
            </div>
            <div class="view-edit-header__footer__actions">
                <LoadingIcon
                    v-if="isLoading"
                    size="14"
                    style="margin-right: 10px"
                />
                <CButton type="secondary" @click="onCancel">Cancel</CButton>
                <CButton type="primary" :disabled="isEmpty" @click="onSave"
                    >Save</CButton
                >
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    Component,
    Inject,
    InjectReactive,
    Prop,
    Vue,
    Watch,
} from 'vue-property-decorator';
import InterfaceContentFile from '~/components/streamline/InterfaceContentFile.vue';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';
import PageListControlsWrapper from '~/components/page-list/list/header/PageListControlsWrapper.vue';
import CButton from '~/components/CButton.vue';
import ViewIcon from '~/components/view/ViewIcon.vue';
import PageDefinitionControl from '~/components/view/controls/filter/PageDefinitionControl.vue';
import PageDefinitionControlBanner from '~/components/view/controls/filter/PageDefinitionControlBanner.vue';
import DefinitionBanner from '~/components/view/controls/filter/DefinitionBanner.vue';
import LinearControls from '~/components/linear/app/LinearControls.vue';
import LinearTeamFilter from '~/components/linear/filters/LinearTeamFilter.vue';
import LinearFilterItem from '~/components/linear/app/LinearFilterItem.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import { TabSymbols } from '~/constants/symbols';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { throttle } from '~/helpers';

@Component({
    name: 'LinearEditViewHeader',
    components: {
        LoadingIcon,
        InterfaceDeleteBin1,
        InterfaceDelete1,
        LinearFilterItem,
        LinearTeamFilter,
        LinearControls,
        DefinitionBanner,
        PageDefinitionControlBanner,
        PageDefinitionControl,
        ViewIcon,
        CButton,

        PageListControlsWrapper,
        InterfaceFileDouble,
        InterfaceContentFile,
    },
})
export default class LinearEditViewHeader extends Vue {
    @Inject(TabSymbols.TAB_DATA)
    tabId!: string;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: any) => void;

    @InjectReactive(TabSymbols.TAB_DATA)
    tabData!: Record<string, any>;

    @Prop({ required: true })
    viewId!: string;

    $refs!: {
        nameInput: HTMLInputElement;
        iconPicker: HTMLElement;
        viewEditor: HTMLElement;
    };

    name: string = '';
    resizeObserver: any = null;

    get isLoading() {
        return !!this.tabData.loading;
    }

    get view() {
        return this.tabData.editingView;
    }

    get isEmpty() {
        return this.name.trim().length === 0;
    }

    get teams() {
        const integration = this.$entities.linear.getIntegration();
        return integration.data.teams ?? [];
    }

    get isSingleTab() {
        return this.$store.getters['tabs/singleTabOpen'];
    }

    onInputName(event: Event) {
        this.name = (event.target as HTMLInputElement).value;
    }

    handleEnter(event: KeyboardEvent) {
        if (event.metaKey || event.ctrlKey) {
            this.onSave();
        }
    }

    handleUpdate(data: any) {
        this.updateTabData({
            editingView: {
                ...this.view,
                ...data,
            },
        });
    }

    deleteView() {
        this.$emit('delete-view', this.view.id);
    }

    temporaryTeamFilters: Record<string, any> = {};

    handleTeamUpdate(data: any) {
        this.temporaryTeamFilters[this.view.teamId] = this.view.filters;
        const filters = this.temporaryTeamFilters[data.teamId] ?? [];

        this.handleUpdate({
            ...data,
            filters,
        });
    }

    onSave() {
        this.$entities.linear.updateView(this.view.id, {
            ...this.view,
            name: this.name ?? 'New View',
        });
        this.updateTabData({
            editingView: null,
        });
    }

    onCancel() {
        this.$emit('cancel');
    }

    @Watch('view.filters')
    handleFilterChange() {
        const height = this.tabData[this.viewId] ?? 0;
        if (height === this.$el.scrollHeight) return;
        this.$nextTick(() => {
            this.updateTabData({
                [this.viewId]: this.$el.scrollHeight,
            });
        });
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key !== 'Escape') return;
        this.onCancel();
    }

    createFilter() {
        this.handleUpdate({
            filters: [
                ...this.view.filters,
                {
                    property: 'none',
                    operation: 'eq',
                    value: undefined,
                },
            ],
        });
    }

    removeFilter(index: number | string) {
        this.handleUpdate({
            filters: this.view.filters.filter(
                (_: any, i: number) => i !== Number(index),
            ),
        });
    }

    changeFilter(index: number | string, filter: any) {
        this.handleUpdate({
            filters: this.view.filters.map((f: any, i: number) =>
                i === Number(index) ? filter : f,
            ),
        });
    }

    beforeMount() {
        this.name = this.view.name;
        this.temporaryTeamFilters[this.view.teamId] = this.view.filters;
    }

    mounted() {
        this.updateTabData({
            [this.viewId]: this.$el.scrollHeight,
        });
        this.$refs.nameInput.focus({
            preventScroll: true,
        });
        document.addEventListener('keydown', this.handleKeyDown);

        // register resize observer
        const fps = throttle(requestAnimationFrame);

        let height = 0;

        this.resizeObserver = new ResizeObserver(entries => {
            fps(() => {
                const el = entries.length ? entries[0] : null;
                if (!el) return;
                const h = el.contentRect.height;
                if (h === height) return;
                height = h;
                this.updateTabData({
                    viewEditorHeight: height,
                });
            });
        });

        this.resizeObserver?.observe(this.$refs.viewEditor);
    }

    beforeDestroy() {
        document.removeEventListener('keydown', this.handleKeyDown);

        this.resizeObserver?.disconnect();

        // destroy resize observer
    }
}
</script>
<style lang="scss" scoped>
.view-edit-header {
    margin-top: 40px;
    padding: 13px;
    border-radius: 10px;
    border: 1px solid var(--tab-divider-color);
    position: relative;
    width: 100%;
    z-index: 1;
    background: var(--modal-bg-color);

    &::before {
        position: absolute;
        top: -11px;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 16px);
        height: 10px;
        background: var(--tab-bg-color);
        content: ' ';
    }

    &.single-tab {
        margin-top: 6px;
    }

    &__header {
        margin-bottom: 6px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &__wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;

            button {
                padding: 5px;
                border-radius: 3px;

                &:hover,
                &.active {
                    background: var(--tab-controls-bg-color__hover);
                }
            }

            input {
                @include font14-500;
                @include inputMetaStyles;
                width: 100%;
                color: var(--tab-title-text-color);
                outline: none;

                &::placeholder {
                    color: var(--c-input-placeholder-color);
                }
            }

            .icon {
                color: var(--header-all-pages-icon-color);
                flex-shrink: 0;
            }
        }
    }

    &__body {
        min-height: 36px;
        cursor: default;

        &__banners {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        &__add-filter {
            @include font12-500;
            color: var(--tab-meta-text-color);
            line-height: 26px;

            &:hover {
                color: var(--app-text-color);
            }
        }
    }

    &__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__count {
            display: flex;
            align-items: center;
            gap: 4px;
            padding-left: 4px;

            p {
                @include font12-500;
                color: var(--tab-meta-text-color);
                user-select: none;
            }
        }

        &__actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        &__delete {
            padding: 6px 6px 6px 6px;
            border-radius: 6px;
            color: var(--c-button-tertiary-text-color);
            line-height: 18px;

            &:hover {
                outline: none;
                background: var(--c-button-tertiary-bg-color);
                color: var(--c-button-tertiary-text-color__hover);

                svg {
                    fill: var(--c-button-tertiary-text-color__hover);
                }
            }
        }
    }
}
</style>

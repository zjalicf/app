<template>
    <div class="view-edit-header" :class="{ 'single-tab': isSingleTab }">
        <div class="view-edit-header__header">
            <div class="view-edit-header__header__wrapper">
                <button
                    ref="iconPicker"
                    :class="{ active: iconPickerOpen }"
                    @click="openViewIconPicker"
                >
                    <ViewIcon :id="entityId" font-size="14" />
                </button>
                <input
                    ref="nameInput"
                    placeholder="View Name"
                    :value="name"
                    @input="onInputName"
                    @keydown.enter="handleEnter"
                    @keydown.esc="onCancelHandler"
                />
            </div>
            <PageListControlsWrapper
                :full="true"
                :definition="temporaryViewDefinition"
                @update="handleDefinitionUpdate"
            />
        </div>
        <div class="view-edit-header__body">
            <div class="view-edit-header__body__banners">
                <DefinitionBanner
                    v-for="definition in interactiveDefinitions"
                    :key="definition.name"
                    :definition="definition"
                    @update="handleBannerUpdate"
                    @delete="handleRemoveDefinition(definition)"
                />
            </div>
        </div>
        <div class="view-edit-header__footer">
            <div class="view-edit-header__footer__count">
                <p>{{ count }} Page{{ count === 1 ? '' : 's' }}</p>
            </div>
            <div class="view-edit-header__footer__actions">
                <CButton type="secondary" @click="onCancelHandler"
                    >Cancel</CButton
                >
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
} from 'vue-property-decorator';
import InterfaceContentFile from '~/components/streamline/InterfaceContentFile.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';
import PageListControlsWrapper from '~/components/page-list/list/header/PageListControlsWrapper.vue';
import CButton from '~/components/CButton.vue';
import { IView } from '~/components/view/model';
import EmojiDropdown from '~/components/dropdown/EmojiDropdown.vue';
import ViewIcon from '~/components/view/ViewIcon.vue';
import PageDefinitionControl from '~/components/view/controls/filter/PageDefinitionControl.vue';
import PageDefinitionControlBanner from '~/components/view/controls/filter/PageDefinitionControlBanner.vue';
import DefinitionBanner from '~/components/view/controls/filter/DefinitionBanner.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'ViewEditHeader',
    components: {
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
export default class ViewEditHeader extends Vue {
    @Prop({ default: 0 })
    count!: number;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    iconPickerOpen: boolean = false;

    $refs!: {
        nameInput: HTMLInputElement;
        iconPicker: HTMLElement;
    };

    name: string = '';
    initialData: IView | null = null;
    saved: boolean = false;

    get tabData() {
        return this.$tabs.getTabData(this.tabId);
    }

    get isEmpty() {
        return this.name.trim().length === 0;
    }

    get interactiveDefinitions() {
        return this.temporaryViewDefinition.filter((definition: any) =>
            ['labels', 'projectId', 'tasks', 'project'].includes(
                definition.property,
            ),
        );
    }

    get temporaryViewDefinition() {
        if (this.tabData.temporaryViewDefinition?.length) {
            return this.tabData.temporaryViewDefinition;
        }
        return this.view?.definition[0]?.definition ?? [];
    }

    get view() {
        return this.$entities.view.getViewById(this.entityId);
    }

    get isSingleTab() {
        return this.$store.getters['tabs/singleTabOpen'];
    }

    openViewIconPicker() {
        this.iconPickerOpen = true;
        this.$dropdown.show({
            parent: this.$refs.iconPicker,
            component: EmojiDropdown,
            animate: false,
            retainFocus: true,
            backdrop: true,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                ],
            },
            bind: {},
            on: {
                change: (emoji: any) => {
                    this.changeIcon(emoji.data);
                },
            },
            onClose: () => {
                this.iconPickerOpen = false;
            },
        });
    }

    changeIcon(emoji: string) {
        this.$entities.view.update({
            id: this.entityId,
            emoji,
        });
    }

    handleDefinitionUpdate(val: any) {
        this.updateTabData({
            temporaryViewDefinition: val,
        });
    }

    handleBannerUpdate(val: any) {
        if (!val.value) {
            this.updateTabData({
                temporaryViewDefinition: this.temporaryViewDefinition.filter(
                    (definition: any) => definition.property !== val.property,
                ),
            });
            return;
        }
        this.updateTabData({
            temporaryViewDefinition: this.temporaryViewDefinition.map(
                (definition: any) => {
                    if (definition.property === val.property) {
                        return val;
                    }
                    return definition;
                },
            ),
        });
    }

    handleRemoveDefinition(definition: any) {
        this.updateTabData({
            temporaryViewDefinition: this.temporaryViewDefinition.filter(
                (def: any) => def.property !== definition.property,
            ),
        });
    }

    onInputName(event: Event) {
        this.name = (event.target as HTMLInputElement).value;
    }

    _onCancel() {
        this.$entities.view.update({ ...this.initialData, editing: false });
        this.updateTabData({
            temporaryViewDefinition: null,
        });
    }

    onCancelHandler() {
        this._onCancel();
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.CANCEL_EDIT_MODE,
            entityId: this.entityId,
        });
    }

    handleEnter(event: KeyboardEvent) {
        if (event.metaKey || event.ctrlKey) {
            this.onSave();
        }
    }

    onSave() {
        if (this.isEmpty) return;
        this.saved = true;
        // get the view we are editing, apply name, stop editing
        const view = {
            ...this.$entities.view.getViewById(this.entityId),
            name: this.name,
            editing: false,
            definition: [
                {
                    combine: 'and',
                    definition: this.temporaryViewDefinition?.length
                        ? [...this.temporaryViewDefinition]
                        : [],
                },
            ],
        } as IView;
        this.$entities.view.update(view);
        this.updateTabData({
            temporaryViewDefinition: null,
        });
        this.$tracking.trackEvent('view', {
            action: 'edit',
        });
        this.$tracking.trackEventV2(TrackingType.CUSTOM_VIEW, {
            action: TrackingAction.UPDATE,
            entityId: view.id,
        });
    }

    beforeDestroy() {
        if (this.saved) return;
        this._onCancel();
    }

    mounted() {
        const view = { ...this.$entities.view.getViewById(this.entityId) };
        if (view.name) {
            this.name = view.name;
        }
        this.updateTabData({
            temporaryViewDefinition: view.definition?.[0]?.definition ?? [],
        });
        this.initialData = view as IView;
        this.$refs.nameInput.focus({
            preventScroll: true,
        });
    }
}
</script>
<style lang="scss" scoped>
.view-edit-header {
    margin: 0 auto;
    padding: 13px;
    border-radius: 10px;
    border: 1px solid var(--frosted-glass-border-color);
    box-shadow: var(--frosted-glass-box-shadow);
    position: absolute;
    top: 42px;
    left: 8px;
    width: calc(100% - 16px);
    z-index: 1;
    background: var(--modal-bg-color);

    &.single-tab {
        top: 8px;
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

        &__banners {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
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
    }
}
</style>

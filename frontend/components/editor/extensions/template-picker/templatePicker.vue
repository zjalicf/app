<template>
    <node-view-wrapper as="span" style="white-space: nowrap">
        <img class="ProseMirror-separator" /><span
            v-if="open"
            ref="link"
            class="inline-document-link open"
            :class="{ 'has-focus': selected }"
            ><ColorSwatchIcon size="20" class="icon" /><span
                class="inline-document-link--wrapper"
                ><span
                    ref="shadow"
                    class="inline-document-link--shadow"
                    style="max-width: 473px !important; overflow: hidden"
                    >{{ shadowValue }}</span
                ><input
                    ref="input"
                    type="text"
                    :value="value"
                    style="width: 0; max-width: 473px !important"
                    :placeholder="placeholder"
                    @keydown.down.prevent="handleKeyDown"
                    @keydown.up.prevent="handleKeyUp"
                    @keydown.esc.prevent="removeLink"
                    @keydown.backspace.stop="handleBackspace"
                    @input="handleInput($event.target.value)"
                    @keydown.enter.shift.prevent.exact="
                        handleEnter(true, $event)
                    "
                    @keydown.enter.prevent.exact="handleEnter(false, $event)"
                    @keydown.tab.prevent="handleEnter(false, $event)"
                    @blur="handleBlur"
                />
            </span> </span
        ><img class="ProseMirror-separator" />
    </node-view-wrapper>
</template>

<script lang="ts">
import { Component, Inject, Watch } from 'vue-property-decorator';
import { Editor, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import { ColorSwatchIcon } from '@vue-hero-icons/solid';
import InlineDocumentSuggestions from '~/components/editor/extensions/inline-document-link/InlineDocumentLinkSuggestions.vue';
import DocumentLinkPreviewMixin from '~/mixins/DocumentLinkPreviewMixin.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TabType } from '~/constants';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'templatePicker',
    components: {
        NodeViewWrapper,
        ColorSwatchIcon,
    },
    props: nodeViewProps,
})
export default class templatePicker extends DocumentLinkPreviewMixin {
    open: boolean = true;
    node!: Node;
    getPos!: any;
    editor!: Editor;
    value: string = '';
    shadowValue: string = '';
    placeholder: string = 'Search templates';
    selectedIndex: number = 0;
    updateAttributes!: any;
    canBlur: boolean = true;
    deleteNode!: Function;

    $refs!: {
        shadow: HTMLSpanElement;
        input: HTMLInputElement;
        popup: HTMLDivElement;
        link: HTMLSpanElement;
    };

    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    get tabType() {
        const id = this.tabId as string;
        const tab = this.$entities.tab.byId(id);

        if (tab) {
            return tab.type;
        }

        return 'Unknown';
    }

    get document() {
        const { id } = this.node.attrs;
        return this.$store.getters[`document/byId`](id);
    }

    get documentId() {
        return this.document?.id;
    }

    handleBlur() {
        if (!this.canBlur) return;
        this.removeLink();
    }

    handleEnter(shift: boolean = false, event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        this.handleDocumentSelect(this.results[this.selectedIndex], shift);
    }

    handleClick() {
        this.canBlur = false;
        this.handleDocumentSelect(this.results[this.selectedIndex], false);
    }

    @TrackEvent(TrackingType.TEMPLATE, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.EDITOR,
    })
    goToTemplates() {
        this.$entities.view.openTemplates();
    }

    handleDocumentSelect({ id, _title }: any, _redirect: boolean = false) {
        const docId = id;
        if (id === 'new') {
            if (this.$utils.isMobile) {
                this.$router.push('/mobile/documents/new_template');
                return;
            }
            this.goToTemplates();
            this.removeLink();
        }

        const doc = this.$store.getters['document/byId'](docId);

        if (doc?.content?.length) {
            const preparedContent = this.$entities.page.prepareTemplate(
                doc.content,
            );
            this.replaceWithTemplate(preparedContent);
            if (this.tabType === 'Unknown') return;
            this.$tracking.trackEventV2(TrackingType.EDITOR, {
                action: TrackingAction.INSERT_TEMPLATE,
                source: TrackingActionSource.AUTOCOMPLETE,
                sourceMeta:
                    this.tabType === TabType.MY_DAY
                        ? TrackingActionSourceMeta.MY_DAY
                        : TrackingActionSourceMeta.PAGE,
            });
        }
    }

    get results() {
        return [
            ...this.$store.getters['document/templates']
                .filter(
                    (doc: any) =>
                        !this.value.trim().length ||
                        doc.title
                            ?.toLowerCase()
                            .startsWith(this.value.toLocaleLowerCase()),
                )
                .map((doc: any) => ({
                    ...doc,
                    title: doc.title || 'Untitled template',
                }))
                .slice(0, 5),
            ...this.createNewDoc,
        ];
    }

    get createNewDoc() {
        return [{ id: 'new', title: this.value.trim() }];
    }

    createPopper() {
        this.$dropdown.hideAll();
        this.$dropdown.show({
            parent: this.$refs.link,
            component: InlineDocumentSuggestions,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                modifiers: [
                    {
                        name: 'flip',
                        options: {
                            fallbackPlacements: ['top-start'],
                            boundary: document.getElementById('editor-wrapper'),
                        },
                    },
                ],
            },
            bind: {
                'selected-index': this.selectedIndex,
                results: this.results,
                template: true,
            },
            on: {
                select: () => {
                    this.handleClick();
                },
                'select:index': (index: number) => {
                    this.selectedIndex = index;
                },
            },
        });
    }

    @Watch('value')
    @Watch('selectedIndex')
    handleSelectedIndexChange() {
        this.createPopper();
    }

    @Watch('results')
    handleResultsChange(curr: any[]) {
        this.createPopper();
        if (this.selectedIndex >= curr.length && curr.length > 0) {
            this.selectedIndex = curr.length - 1;
        }
    }

    handleKeyDown() {
        if (this.results.length === 0) return;
        if (this.selectedIndex === this.results.length - 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex++;
        }
    }

    handleKeyUp() {
        if (this.results.length === 0) return;
        if (this.selectedIndex === 0) {
            this.selectedIndex = this.results.length - 1;
        } else {
            this.selectedIndex--;
        }
    }

    handleBackspace() {
        if (this.value === '') {
            this.removeLink();
        }
    }

    removeLink() {
        this.canBlur = false;
        this.$dropdown.hideAll();
        this.deleteNode();
        this.editor.commands.focus();
    }

    replaceWithTemplate(content: string) {
        this.canBlur = false;
        this.$dropdown.hideAll();

        const from = this.getPos();
        const to = from + this.node.nodeSize;

        this.editor
            .chain()
            .deleteRange({ from, to })
            .focus()
            .insertContent(content)
            .run();
    }

    handleInput(value: string) {
        this.shadowValue = value.length === 0 ? this.placeholder : value;
        this.value = value;
        this.recalculateHeight();
    }

    get id() {
        const id = this.node.attrs.id;
        return id;
    }

    recalculateHeight() {
        this.$nextTick(() => {
            const width = this.$refs.shadow.offsetWidth!;
            this.$refs.input.style.width = `${Math.min(width, 473)}px`;
        });
    }

    mounted() {
        const { value } = this.node.attrs;
        this.value = this.placeholder;
        this.shadowValue = value.length === 0 ? this.placeholder : value;

        if (
            this.node.attrs.id === 'new' &&
            this.editor.storage.groupId.value !==
                this.$store.getters['tabs/activeGroup'].id
        ) {
            return;
        }

        if (this.node.attrs.id === 'new') {
            this.open = true;

            this.$nextTick(() => {
                this.recalculateHeight();
                this.$refs.input.focus({
                    preventScroll: true,
                });
                this.value = value;
            });
        } else {
            this.open = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.has-focus[data-node-view-wrapper] .ProseMirror-separator,
.has-focus[data-node-view-wrapper] {
    user-select: none;
}

.inline-document-link {
    position: relative;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 2px 4px 2px 2px;
    cursor: default;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;

    &.open {
        padding-top: 2px;
    }

    &--wrapper {
        display: inline-flex;
    }

    &:hover:not(.open),
    &.has-focus {
        background: var(--editor-extension-document-link-bg-color__hover);
        user-select: none;
        border: 2px solid var(--accent-color);
        padding: 1px 2px 1px 0px;

        .icon {
            color: var(--editor-extension-document-link-icon-color__hover);
        }
    }

    &.archived {
        text-decoration: line-through;
    }

    &__archived-tooltip {
        visibility: hidden;
        text-size-adjust: auto;
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-left: -50%;
        z-index: 1;
    }

    &:hover &__archived-tooltip {
        visibility: visible;
    }

    > .icon {
        color: var(--editor-extension-document-link-icon-color);
        position: relative;
        top: -2px;
        display: inline;
        width: 20px;
        height: 20px;
        margin-right: 2px;
    }

    &--shadow {
        position: absolute;
        visibility: hidden;
        white-space: pre;
        overflow: visible;
    }

    input {
        outline: none;
        font-size: 16px;

        &::placeholder {
            color: var(--editor-extension-placeholder-color);
        }
    }
}
</style>

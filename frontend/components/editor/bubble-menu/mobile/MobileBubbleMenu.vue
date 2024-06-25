<template>
    <div class="mobile-bubble-menu" @mousedown.prevent>
        <div v-if="allowBubbleMenu" class="mobile-bubble-menu--default-options">
            <button
                v-if="table && !editingTask"
                ref="tableOptions"
                class="formatting"
                @mousedown.stop.prevent="openTableOptions"
            >
                <ShoppingBusinessTable size="14" />
            </button>
            <button
                v-if="!table && !editingTask"
                class="mark-button"
                @mousedown.stop.prevent="toggleTask"
            >
                <InterfaceValidationCheck size="14" />
            </button>
            <button
                v-if="!table && !editingTask"
                ref="insertOptions"
                class="formatting"
                @mousedown.stop.prevent="openInsertOptions"
            >
                <ImageFlash2 size="14" />
            </button>
            <button
                v-if="!editingTask"
                ref="textOptions"
                class="formatting"
                @mousedown.stop.prevent="openTextOptions"
            >
                <InterfaceTextFormattingFontSize size="14" />
            </button>
            <button
                v-if="!editingTask"
                ref="formatting"
                class="formatting"
                @mousedown.stop.prevent="openFormattingOptions"
            >
                <InterfaceTextFormattingTextStyle size="14" />
            </button>
            <div v-if="editingTask">
                <MobileBubbleMenuTaskDatePicker :task-id="taskId" />
            </div>
        </div>
        <div v-else></div>
        <div class="mobile-bubble-menu--navigation-arrows">
            <button
                class="undo-button"
                :class="{ disabled: !editor.can().undo() }"
                @mousedown.stop.prevent="editor.commands.undo()"
            >
                <InterfaceArrowsTurnBackwardAlternate size="14" />
            </button>
            <button
                class="redo-button"
                :class="{ disabled: !editor.can().redo() }"
                @mousedown.stop.prevent="editor.commands.redo()"
            >
                <InterfaceArrowsTurnForwardAlternate size="14" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Editor } from '@tiptap/vue-2';
import { Level } from '@tiptap/extension-heading';
import { v4 } from 'uuid';
import ImageFlash2 from '~/components/streamline/ImageFlash2.vue';
import InterfaceArrowsTurnBackwardAlternate from '~/components/streamline/InterfaceArrowsTurnBackwardAlternate.vue';
import InterfaceArrowsTurnForwardAlternate from '~/components/streamline/InterfaceArrowsTurnForwardAlternate.vue';
import InterfaceTextFormattingFontSize from '~/components/streamline/InterfaceTextFormattingFontSize.vue';
import ShoppingBusinessTable from '~/components/streamline/ShoppingBusinessTable.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceTextFormattingText from '~/components/streamline/InterfaceTextFormattingText.vue';
import InterfaceTextFormattingTextStyle from '~/components/streamline/InterfaceTextFormattingTextStyle.vue';
import FormattingOptions from '~/components/mobile/common/dropdown/mobile-bubble-menu/FormattingOptions.vue';
import TextOptions from '~/components/mobile/common/dropdown/mobile-bubble-menu/TextOptions.vue';
import InsertOptions from '~/components/mobile/common/dropdown/mobile-bubble-menu/InsertOptions.vue';
import TableOptions from '~/components/mobile/common/dropdown/mobile-bubble-menu/TableOptions.vue';
import InterfaceTextFormattingIndentIncrease from '~/components/streamline/InterfaceTextFormattingIndentIncrease.vue';
import InterfaceTextFormattingIndentDecrease from '~/components/streamline/InterfaceTextFormattingIndentDecrease.vue';
import { INLINE_TASK_NODE_NAME } from '~/components/editor/extensions/task-item';
import MobileBubbleMenuTaskDatePicker from '~/components/editor/bubble-menu/mobile/MobileBubbleMenuTaskDatePicker.vue';
import { generateTaskListFromSelection } from '~/helpers/editor';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MobileBubbleMenu',
    components: {
        MobileBubbleMenuTaskDatePicker,
        InterfaceTextFormattingIndentDecrease,
        InterfaceTextFormattingIndentIncrease,
        InterfaceTextFormattingTextStyle,
        InterfaceTextFormattingText,
        InterfaceValidationCheck,
        ShoppingBusinessTable,
        InterfaceTextFormattingFontSize,
        InterfaceArrowsTurnForwardAlternate,
        InterfaceArrowsTurnBackwardAlternate,
        ImageFlash2,
    },
})
export default class MobileBubbleMenu extends Vue {
    @Prop({
        required: true,
    })
    editor!: Editor;

    @Prop({
        required: true,
    })
    documentId!: string;

    formattingOpen: boolean = false;
    $refs!: {
        convertToMenuButton: HTMLButtonElement;
        formatting: HTMLButtonElement;
        textOptions: HTMLButtonElement;
        insertOptions: HTMLButtonElement;
        tableOptions: HTMLButtonElement;
    };

    get allowBubbleMenu() {
        return (
            this.editor &&
            !this.editor.isActive('image') &&
            !this.editor.isActive('codeBlock') &&
            !this.editor.isActive('imageComponent')
        );
    }

    get table() {
        return this.editor.isActive('table');
    }

    get editingTask() {
        return this.editor.isActive(INLINE_TASK_NODE_NAME);
    }

    get taskId() {
        return this.editor.view.state.selection.$head.parent.attrs.id;
    }

    openFormattingOptions() {
        this.$dropdown.show({
            component: FormattingOptions,
            parent: this.$refs.formatting,
            retainFocus: true,
            popperOptions: {
                placement: 'top-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            bind: {
                editor: this.editor,
            },
            on: {
                bold: () => this.toggleBold(),
                italic: () => this.toggleItalic(),
                underline: () => this.toggleUnderline(),
                strike: () => this.toggleStrike(),
                clear: () => this.toggleClear(),
                'increase-level': () => this.increaseLevel(),
                'decrease-level': () => this.decreaseLevel(),
            },
        });
    }

    openTextOptions() {
        this.$dropdown.show({
            component: TextOptions,
            parent: this.$refs.textOptions,
            retainFocus: true,
            popperOptions: {
                placement: 'top-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            bind: {
                editor: this.editor,
            },
            on: {
                paragraph: () => this.toggleParagraph(),
                heading1: () => this.toggleHeading(1),
                heading2: () => this.toggleHeading(2),
                heading3: () => this.toggleHeading(3),
                code: () => this.toggleCode(),
                superscript: () => this.handleSuperscript(),
                subscript: () => this.handleSubscript(),
            },
        });
    }

    openInsertOptions() {
        this.$dropdown.show({
            component: InsertOptions,
            parent: this.$refs.insertOptions,
            retainFocus: true,
            popperOptions: {
                placement: 'top-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            bind: {
                editor: this.editor,
            },
            on: {
                table: () => {
                    this.insertTable();
                    this.$dropdown.hideAll();
                },
                list: () => {
                    this.toggleList();
                    this.$dropdown.hideAll();
                },
                codeblock: () => {
                    this.toggleCodeBlock();
                    this.$dropdown.hideAll();
                },
                'page-link': () => {
                    this.insertPageLink();
                    this.$dropdown.hideAll();
                },
            },
        });
        this.formattingOpen = true;
    }

    openTableOptions() {
        this.$dropdown.show({
            component: TableOptions,
            parent: this.$refs.tableOptions,
            retainFocus: true,
            popperOptions: {
                placement: 'top-start',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            bind: {
                editor: this.editor,
            },
            on: {
                rowAbove: () =>
                    this.editor.chain().focus().addRowBefore().run(),
                rowBelow: () => this.editor.chain().focus().addRowAfter().run(),
                removeRow: () => this.editor.chain().focus().deleteRow().run(),
                columnBefore: () =>
                    this.editor.chain().focus().addColumnBefore().run(),
                columnAfter: () =>
                    this.editor.chain().focus().addColumnAfter().run(),
                removeColumn: () =>
                    this.editor.chain().focus().deleteColumn().run(),
                deleteTable: () => {
                    this.editor.chain().focus().deleteTable().run();
                    this.$dropdown.hideAll();
                },
            },
        });
    }

    get selectionLength() {
        const from = this.editor.view.state.selection.$anchor.pos;
        const to = this.editor.view.state.selection.$head.pos;

        return to - from;
    }

    insertTable() {
        this.editor.commands
            // @ts-ignore
            .insertTable({
                rows: 2,
                cols: 2,
                withHeaderRow: false,
            });
        this.$tracking.trackEventV2(TrackingType.EDITOR, {
            action: TrackingAction.INSERT_TABLE,
            source: TrackingActionSource.MOBILE_BUBBLE_MENU,
            sourceMeta:
                this.$router.currentRoute.name === 'index'
                    ? TrackingActionSourceMeta.MY_DAY
                    : TrackingActionSourceMeta.PAGE,
        });
    }

    insertPageLink() {
        const selection = this.editor.view.state.selection;
        const focusIndex = selection.from === 1 ? 0 : selection.from - 1;
        const node = this.editor.state.schema.nodes.inlineDocumentLink.create({
            value: '',
        });
        this.editor.chain().insertContentAt(focusIndex, node.toJSON()).run();
        this.$tracking.trackEventV2(TrackingType.EDITOR, {
            action: TrackingAction.INSERT_PAGE_LINK,
            source: TrackingActionSource.MOBILE_BUBBLE_MENU,
            sourceMeta:
                this.$router.currentRoute.name === 'index'
                    ? TrackingActionSourceMeta.MY_DAY
                    : TrackingActionSourceMeta.PAGE,
        });
    }

    toggleTask() {
        if (!this.editor) return;
        try {
            if (!this.selectionLength) {
                const selection = this.editor.view.state.selection;

                const task = this.$entities.task.createFromProperties({
                    id: v4(),
                    createdAt: new Date(),
                    completed: false,
                    start: null,
                    text: '',
                });

                this.editor
                    .chain()
                    .insertContentAt(
                        selection.to,
                        `<ul data-type="taskList">${task}</ul>`,
                    )
                    .run();

                const { content } = this.editor.view.state.selection.content();
                const name = content.firstChild?.type.name;
                if (name === 'paragraph' && content.firstChild?.text === '') {
                    this.editor.commands.deleteSelection();
                }
                this.$tracking.trackEventV2(TrackingType.EDITOR, {
                    action: TrackingAction.INSERT_TASK,
                    source: TrackingActionSource.MOBILE_BUBBLE_MENU,
                    sourceMeta:
                        this.$router.currentRoute.name === 'index'
                            ? TrackingActionSourceMeta.MY_DAY
                            : TrackingActionSourceMeta.PAGE,
                });

                return;
            }

            generateTaskListFromSelection(this.editor);
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleList() {
        try {
            this.editor.chain().toggleBulletList().focus().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    handleSuperscript() {
        try {
            this.editor.chain().focus().toggleSuperscript().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    handleSubscript() {
        try {
            this.editor.chain().focus().toggleSubscript().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleBold() {
        try {
            this.editor.chain().focus().toggleBold().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleItalic() {
        try {
            this.editor.chain().focus().toggleItalic().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleUnderline() {
        try {
            this.editor.chain().focus().toggleUnderline().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleStrike() {
        try {
            this.editor.chain().focus().toggleStrike().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleClear() {
        try {
            this.editor.chain().focus().unsetAllMarks().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    increaseLevel() {
        try {
            this.editor.chain().focus().sinkListItem('listItem').run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    decreaseLevel() {
        try {
            this.editor.chain().focus().liftListItem('listItem').run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleCodeBlock() {
        try {
            this.editor.chain().focus().toggleCodeBlock().run();
            this.$tracking.trackEventV2(TrackingType.EDITOR, {
                action: TrackingAction.INSERT_CODE_BLOCK,
                source: TrackingActionSource.MOBILE_BUBBLE_MENU,
                sourceMeta:
                    this.$router.currentRoute.name === 'index'
                        ? TrackingActionSourceMeta.MY_DAY
                        : TrackingActionSourceMeta.PAGE,
            });
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleCode() {
        try {
            this.editor.chain().focus().toggleCode().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleHeading(level: Level) {
        try {
            this.editor.chain().focus().toggleHeading({ level }).run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }

    toggleParagraph() {
        try {
            this.editor.chain().focus().setParagraph().run();
        } catch (error) {
            this.$sentry.captureException(error);
            console.log(error);
        }
    }
}
</script>
<style lang="scss" scoped>
.mobile-bubble-menu {
    height: var(--bubble-menu-height);
    background: var(--mobile-app-bg-color);
    border-top: 1px solid var(--tab-divider-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    padding: 0 10px;

    &--table-section {
        display: flex;
        align-items: center;
    }

    &--navigation-arrows {
        display: flex;
        align-items: center;
    }

    &--default-options {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    button {
        @include animateBackgroundColor;
        display: block;
        padding: 16px 17px;
        color: var(--mobile-bubble-menu-button-text-color);

        &:disabled {
            opacity: 0.4;
        }

        &.flash {
            padding: 15px;
        }

        span {
            display: block;
            font-size: 16px;
            line-height: 20px;
            width: 20px;
            height: 20px;
            font-weight: bold;
        }

        &:active {
            color: var(--mobile-bubble-menu-button-text-color__active);
        }
    }

    button.is-active {
        color: var(--mobile-bubble-menu-button-text-color__active);
    }

    .undo-button,
    .redo-button {
        &.disabled {
            color: var(--mobile-bubble-menu-button-text-color__disabled);
        }
    }

    .formatting-options,
    .default-options {
        display: flex;
        align-items: center;
    }
}
</style>

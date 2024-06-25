<template>
    <div class="editor" @click="editor.commands.focus()">
        <editor-content
            :editor="editor"
            spellcheck="false"
            autocomplete="off"
        />
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Label from './extensions/label';
import { default as UniqueID } from './extensions/unique-id';
import { default as QCTrailingNode } from './extensions/trailing-node';
import {
    default as TaskItem,
    INLINE_TASK_CONTENT_NAME,
} from './extensions/task-item';
import { v4 } from 'uuid';
import { default as ListItem } from './extensions/list-item';

export default {
    components: {
        EditorContent,
    },

    props: {
        value: {
            type: String,
            default: '',
        },
        isPageEditor: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            editor: null,
        };
    },

    watch: {
        value(value) {
            const isSame = this.editor.getHTML() === value;
            if (isSame) {
                return;
            }
            this.editor.commands.setContent(value, false);
        },
        isPageEditor(newVal) {
            this.editor.view.dispatch(this.editor.state.tr);
            const BoldExt = this.editor.extensionManager.extensions.find(
                ext => ext.name === INLINE_TASK_CONTENT_NAME,
            );
            BoldExt.options.myDay = !newVal;
        },
    },
    methods: {
        getPageTitle(doc) {
            const content = doc.content || [];
            if (content.length) {
                return this.editor.view
                    .nodeDOM(0)
                    .innerText.replaceAll('\n', '');
            }
            return '';
        },
    },
    computed: {
        extensions() {
            return [
                Link,
                Placeholder.configure({
                    placeholder: () =>
                        this.isPageEditor
                            ? 'Capture a New Page'
                            : 'Capture to My Day',
                }),
                StarterKit.configure({
                    hardBreak: false,
                }),
                UniqueID,
                QCTrailingNode,
                Label,
                TaskItem,
                ListItem,
            ];
        },
    },
    mounted() {
        this.editor = new Editor({
            content: this.value,
            extensions: this.extensions,
            autofocus: 'end',
            onUpdate: ({ transaction }) => {
                let payload = {
                    text: transaction.doc.textContent,
                    html: this.editor.getHTML(),
                };
                const json = this.editor.getJSON();
                if (this.isPageEditor) {
                    const title = this.getPageTitle(json);
                    payload = {
                        ...payload,
                        content: this.editor.getHTML(),
                        title,
                    };
                }
                const isEmpty = this.editor.isEmpty;
                this.$emit('input', payload, isEmpty);
            },
        });

        this.editor.commands.focus();

        window.electron.on('window-show', () => {
            this.editor.commands.focus();
        });

        window.electron.on('window-hide', () => {
            this.editor.commands.blur();
        });

        this.$nuxt.$on('new-task', () => {
            this.editor
                .chain()
                .insertContent(
                    `<ul data-type="taskList"><li><div data-type="taskItemContent" id="${v4()}" completed="false"></div></li></ul>`,
                )
                .run();

            window.electron.trackEvent('Quick Capture', {
                action: 'Add Task',
            });
        });

        this.$nuxt.$on('editor:focus', () => {
            this.editor.commands.focus();
        });
    },

    beforeDestroy() {
        this.editor.destroy();
        this.$nuxt.$off('new-task');
        this.$nuxt.$off('editor:focus');
    },
};
</script>
<style lang="scss" scoped>
.editor {
    @include noDrag;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before),
:deep(.ProseMirror h1.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    pointer-events: none;
    height: 0;
    color: $blueGrey700;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 175.2%;
}

:deep(.ProseMirror) {
    @include editorStyling;
    min-height: 150px;
    outline: none;
}
</style>

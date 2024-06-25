<template>
    <div>
        <editor-content
            class="editor"
            data-e2e="basic-editor-instance"
            :editor="editorInstance"
            spellcheck="false"
            autocomplete="off"
        />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    Editor as TipTapEditor,
    EditorContent,
    VueNodeViewRenderer,
} from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Link from '@tiptap/extension-link';
import * as Y from 'yjs';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { mergeAttributes, Node } from '@tiptap/core';
import ListItem from '@tiptap/extension-list-item';
import LinearEditorComponent from '~/components/editor/extensions/linear-link/LinearEditorComponent.vue';

@Component({
    name: 'LinearDescriptionEditor',
    components: {
        EditorContent,
    },
})
export default class LinearDescriptionEditor extends Vue {
    @Prop({ default: '' })
    value!: string;

    @Prop({ default: null })
    ydoc!: any;

    editorInstance: TipTapEditor | null = null;

    mounted() {
        const extensions = [
            StarterKit,
            Table,
            Image,
            Link,
            BulletList.extend({
                name: 'bullet_list',
            }),
            OrderedList.extend({
                name: 'ordered_list',
            }),
            ListItem.extend({
                name: 'list_item',
            }),
            TaskList.extend({
                name: 'todo_list',
            }).configure({
                itemTypeName: 'todo_item',
            }),
            Node.create({
                name: 'todo_item',
                addOptions() {
                    return {
                        HTMLAttributes: {},
                        taskListTypeName: 'todo_list',
                    };
                },
                addAttributes() {
                    return {
                        done: {
                            default: false,
                        },
                    };
                },
                renderHTML({ node, HTMLAttributes }) {
                    return [
                        'li',
                        {},
                        [
                            'label',
                            [
                                'input',
                                {
                                    disabled: true,
                                    type: 'checkbox',
                                    checked: HTMLAttributes.done
                                        ? 'checked'
                                        : null,
                                },
                            ],
                            ['span'],
                        ],
                        ['div', 0],
                    ];
                },
            }),
            Node.create({
                name: 'issueMention',
                group: 'inline',
                inline: true,
                draggable: false,
                addAttributes() {
                    return {
                        id: {
                            default: null,
                        },
                        href: {
                            default: null,
                        },
                        label: {
                            default: null,
                        },
                    };
                },
                renderHTML({ HTMLAttributes }) {
                    return ['issueMention', mergeAttributes(HTMLAttributes)];
                },
                addNodeView() {
                    return VueNodeViewRenderer(LinearEditorComponent, {});
                },
            }),
            Node.create({
                name: 'video',
                group: 'block',
                draggable: false,
                atom: true,
                addAttributes() {
                    return {
                        src: {
                            default: null,
                        },
                        title: {
                            default: null,
                        },
                    };
                },
                parseHTML() {
                    return [
                        {
                            tag: 'video',
                        },
                    ];
                },
                renderText({ node }) {
                    return `${node.attrs.title}`;
                },
                renderHTML({ HTMLAttributes }) {
                    return [
                        'a',
                        mergeAttributes({
                            target: '_blank',
                            rel: 'noopener noreferrer nofollow',
                            title: HTMLAttributes.title,
                            href: HTMLAttributes.src,
                        }),
                        HTMLAttributes.title,
                    ];
                },
            }),
            Node.create({
                name: 'suggestion_userMentions',
                group: 'inline',
                inline: true,
                atom: true,
                addAttributes() {
                    return {
                        id: {
                            default: null,
                        },
                        label: {
                            default: null,
                        },
                    };
                },
                parseHTML() {
                    return [
                        {
                            tag: 'span[data-type="suggestion_userMentions"]',
                        },
                    ];
                },
                renderText({ node }) {
                    return `@${node.attrs.label}`;
                },
                renderHTML({ HTMLAttributes }) {
                    return [
                        'span',
                        mergeAttributes({
                            'data-type': 'suggestion_userMentions',
                            style: 'font-weight: 600;',
                        }),
                        `@${HTMLAttributes.label}`,
                    ];
                },
            }),
            Node.create({
                name: 'file',
                group: 'block',
                inline: false,

                addAttributes() {
                    return {
                        href: {
                            default: null,
                        },
                        mimetype: {
                            default: null,
                        },
                        name: {
                            default: null,
                        },
                        size: {
                            default: null,
                        },
                    };
                },

                parseHTML() {
                    return [
                        {
                            tag: 'div',
                        },
                    ];
                },

                renderHTML({ HTMLAttributes }) {
                    return ['div', mergeAttributes(HTMLAttributes)];
                },
            }),
            TableRow,
            TableCell,
            TableHeader,
        ];
        if (this.ydoc) {
            const doc = this.parseToYdoc();
            const schema = TiptapTransformer.fromYdoc(doc);
            this.editorInstance = new TipTapEditor({
                content: schema.prosemirror,
                extensions,
                editable: false,
            });
            return;
        }
        this.editorInstance = new TipTapEditor({
            content: this.value,
            extensions,
            editable: false,
        });
    }

    parseToYdoc() {
        const doc = new Y.Doc();
        const binaryYDocString = atob(this.ydoc);
        // Create array buffer from binary string
        const arrayBuffer = new Uint8Array(binaryYDocString.length);
        for (let i = 0; i < binaryYDocString.length; i++) {
            arrayBuffer[i] = binaryYDocString.charCodeAt(i);
        }

        Y.applyUpdate(doc, arrayBuffer);
        return doc;
    }
}
</script>
<style lang="scss" scoped>
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    pointer-events: none;
    height: 0;
    color: var(--editor-placeholder-color);
    font-weight: normal;
    font-size: 16px;
    line-height: 175.2%;
}

:deep(.ProseMirror) {
    @include inputMetaStyles;
    @include editorStyling;
    user-select: text;
    cursor: text;

    img {
        cursor: default;
    }

    ul[data-type='todo_list'] {
        list-style: none;
        padding-left: 0;

        li {
            margin-left: 0;
            display: flex;
            gap: 4px;
        }
    }
}

@keyframes shine {
    to {
        background-position: calc(100% + 510px) 0;
    }
}
</style>

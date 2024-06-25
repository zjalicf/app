import { Editor as TipTapEditor } from '@tiptap/vue-2';
import { v4 } from 'uuid';
import { Selection } from '@tiptap/pm/state';
import { EditorContext } from '~/@types/app';

export class AssistantUtils {
    editor: TipTapEditor;
    context: EditorContext;

    constructor(editor: TipTapEditor, ctx: EditorContext) {
        this.editor = editor;
        this.context = ctx;
    }

    insertContentInBlockquote(
        id: string,
        incrementalContent: string,
        initialPosition: number,
    ) {
        // Exit early if the content is empty
        if (incrementalContent === '') return;
        const { doc } = this.editor.state;
        // Find the blockquote node by ID
        if (!this.context.utils) {
            return;
        }
        let { child: node, pos } = this.context.utils.findNode(
            doc,
            (node: any) =>
                node.attrs.id === id && node.type.name === 'blockquote',
        );
        // If the node doesn't exist or is not a blockquote, create a new blockquote node
        if (!node) {
            const blockquoteType = this.editor.schema.nodes.blockquote;
            const blockquoteAttrs = { id };
            node = blockquoteType.create(blockquoteAttrs);

            const atEnd = Selection.atEnd(doc);
            const validTextSelection = Selection.findFrom(atEnd.$to, -1, true);

            // Exit if blockquote creation fails
            if (!node) return;

            // Set the initial position for inserting the blockquote
            pos =
                initialPosition > doc.content.size
                    ? validTextSelection!.from
                    : initialPosition;

            this.editor.commands.insertContentAt(pos, {
                type: 'blockquote',
                attrs: {
                    id,
                },
                content: [
                    {
                        type: 'paragraph',
                    },
                ],
            });

            pos += 1;
        }

        const endPos = pos + node.nodeSize - 2; // -2 to exclude the opening and closing tags

        const blockquoteEnd = Selection.findFrom(
            this.editor.state.doc.resolve(pos! + node.nodeSize),
            -1,
            true,
        );

        this.editor.view.dispatch(
            this.editor.state.tr.insertText(
                incrementalContent,
                blockquoteEnd?.from || endPos,
            ),
        );
    }

    async makeSummary() {
        const selection = this.editor.view.state.selection;
        const textNodes: string[] = [];
        selection.content().content.descendants(node => {
            if (node.isText) {
                textNodes.push(node.text!);
            }
        });
        const text = textNodes.join(' ');
        const promptDefault =
            'summarize the following text into few sentences:\n';
        const prompt = promptDefault + text;

        const id = v4();
        const initialPosition = selection.to;

        this.editor.commands.insertContentAt(
            initialPosition,
            [
                {
                    type: 'paragraph',
                },
                {
                    type: 'blockquote',
                    attrs: {
                        id,
                    },
                    content: [
                        {
                            type: 'paragraph',
                        },
                    ],
                },
            ],
            {
                updateSelection: true,
                parseOptions: {
                    preserveWhitespace: 'full',
                },
            },
        );

        this.context.nuxt.$on(`assistant-summary-emit-${id}`, (data: any) => {
            if (data.type === 'end') {
                this.context.nuxt.$off(`assistant-summary-emit-${id}`);
                return;
            }
            if (data.type === 'content') {
                this.insertContentInBlockquote(
                    id,
                    data.content,
                    initialPosition,
                );
            }
        });
        await this.context.nuxt.$utils.assistant.generateSummary(prompt, id);
    }

    async makeMermaid() {
        const selection = this.editor.view.state.selection;
        const textNodes: string[] = [];
        selection.content().content.descendants(node => {
            if (node.isText) {
                textNodes.push(node.text!);
            }
        });
        const text = textNodes.join(' ');
        const nodeId = v4();

        this.editor.commands.insertContentAt(
            selection.to,
            [
                {
                    type: 'paragraph',
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Generated Flowchart:' }],
                },
                {
                    type: 'mermaid-component',
                    attrs: {
                        id: nodeId,
                        expression: 'graph TD\n\tA(Loading...)\n',
                    },
                },
                {
                    type: 'paragraph',
                },
            ],
            {
                updateSelection: true,
                parseOptions: {
                    preserveWhitespace: 'full',
                },
            },
        );
        const out = await this.context.nuxt.$utils.assistant.generateMermaid(
            text,
        );

        if (out?.match(/Not possible/)) {
            this.context.nuxt.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'Invalid input. Could not generate chart.',
                },
            });
            return;
        }
        const { doc } = this.editor.state;
        const { child: node, pos } = this.context.utils?.findNode(
            doc,
            (node: any) => {
                return (
                    node.attrs.id === nodeId &&
                    node.type.name === 'mermaid-component'
                );
            },
        )!;

        if (!node || this.editor.isDestroyed) return;

        this.editor
            .chain()
            .setNodeSelection(pos!)
            .deleteSelection()
            .insertContentAt(
                pos!,
                {
                    type: 'mermaid-component',
                    attrs: {
                        id: nodeId,
                        expression: out
                            .replace(`\`\`\`mermaid`, '')
                            .replace('```', ''),
                    },
                },
                {
                    updateSelection: true,
                    parseOptions: {
                        preserveWhitespace: 'full',
                    },
                },
            )
            .run();
    }
}

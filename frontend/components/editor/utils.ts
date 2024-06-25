import { Editor as TipTapEditor } from '@tiptap/vue-2';
import { findChildren, FocusPosition } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { Node as InternalNode, Node } from '@tiptap/pm/model';
import { CellSelection } from '@tiptap/pm/tables';
import { EditorContext } from '~/@types/app';
import { AssistantUtils } from '~/components/editor/assistant-utils';

export function isActive(state: EditorState, types: string[]): boolean {
    const nodes: string[] = [];
    const marks: string[] = [];
    types.forEach(type => {
        if (state.schema.nodes[type]) {
            nodes.push(type);
        }

        if (state.schema.marks[type]) {
            marks.push(type);
        }
    });
    return isNodeActive(state, nodes) || isMarkActive(state, marks);
}

export function isNodeActive(state: EditorState, names: string[]): boolean {
    const { from, to, empty } = state.selection;

    const nodeRanges: any[] = [];

    state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isText) {
            return;
        }

        const relativeFrom = Math.max(from, pos);
        const relativeTo = Math.min(to, pos + node.nodeSize);

        nodeRanges.push({
            node,
            from: relativeFrom,
            to: relativeTo,
        });
    });

    const selectionRange = to - from;
    const matchedNodeRanges = nodeRanges.filter(nodeRange => {
        if (!names.length) {
            return true;
        }

        return names.includes(nodeRange.node.type.name);
    });

    if (empty) {
        return !!matchedNodeRanges.length;
    }

    const range = matchedNodeRanges.reduce(
        (sum, nodeRange) => sum + nodeRange.to - nodeRange.from,
        0,
    );

    return range >= selectionRange;
}

export function isMarkActive(state: EditorState, names: string[]): boolean {
    const { empty, ranges } = state.selection;

    if (empty) {
        return !!(state.storedMarks || state.selection.$from.marks()).filter(
            mark => {
                if (!names.length) {
                    return true;
                }

                return names.includes(mark.type.name);
            },
        );
    }

    let selectionRange = 0;
    const markRanges: any[] = [];

    ranges.forEach(({ $from, $to }) => {
        const from = $from.pos;
        const to = $to.pos;

        state.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isText && !node.marks.length) {
                return;
            }

            const relativeFrom = Math.max(from, pos);
            const relativeTo = Math.min(to, pos + node.nodeSize);
            const range = relativeTo - relativeFrom;

            selectionRange += range;

            markRanges.push(
                ...node.marks.map(mark => ({
                    mark,
                    from: relativeFrom,
                    to: relativeTo,
                })),
            );
        });
    });

    if (selectionRange === 0) {
        return false;
    }

    // calculate range of matched mark
    const matchedRange = markRanges
        .filter(markRange => {
            if (!names.length) {
                return true;
            }

            return names.includes(markRange.mark.type.name);
        })
        .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);

    // calculate range of marks that excludes the searched mark
    // for example `code` doesn't allow any other marks
    const excludedRange = markRanges
        .filter(markRange => {
            if (!names.length) {
                return true;
            }

            return (
                !names.includes(markRange.mark.type.name) &&
                names.every(name => {
                    markRange.mark.type.excludes(name);
                })
            );
        })
        .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);

    // we only include the result of `excludedRange`
    // if there is a match at all
    const range =
        matchedRange > 0 ? matchedRange + excludedRange : matchedRange;

    return range >= selectionRange;
}

export class EditorUtils {
    editor: TipTapEditor;
    context: EditorContext;
    assistant: AssistantUtils;

    constructor(editor: TipTapEditor, ctx: EditorContext) {
        this.editor = editor;
        this.context = ctx;
        this.assistant = new AssistantUtils(this.editor, this.context);
    }

    setEditable(editable: boolean) {
        this.editor.setEditable(editable);
    }

    get isInActiveTab() {
        return (
            this.context.groupId ===
            this.context.store.getters['tabs/activeGroup'].id
        );
    }

    isActive(type: string | string[]) {
        if (!Array.isArray(type)) {
            type = [type];
        }
        isActive(this.editor.state, type);
    }

    focusEditor = (pos: FocusPosition) => {
        if (!this.context.nuxt.$utils.isMobile && !this.isInActiveTab) {
            return;
        }
        const blockNodes = ['image', 'mermaid-component', 'jira-issue'];
        this.context.nextTick(() => {
            if (pos === 'start') {
                const firstNode =
                    this.editor.view.state.doc.content.firstChild?.type.name;
                if (blockNodes.includes(firstNode as string)) {
                    this.editor.chain().focus(0).setNodeSelection(0).run();
                } else {
                    this.editor.commands.focus(1);
                }
            } else if (pos === 'end') {
                this.editor.commands.focus(pos);
            } else {
                if (typeof pos !== 'number') return;
                const node = this.editor.state.doc.nodeAt(pos);
                if (!node) {
                    this.editor.commands.focus(pos);
                    return;
                }
                if (blockNodes.includes(node?.type.name)) {
                    this.editor.chain().focus(pos).setNodeSelection(pos).run();
                } else {
                    this.editor.commands.focus(pos);
                }
            }
            this.editor.commands.scrollIntoView();
        });
    };

    blurEditor() {
        if (!this.context.nuxt.$utils.isMobile && !this.isInActiveTab) {
            return;
        }
        this.editor.commands.blur();
    }

    findTextPosition(text: string): number | null {
        let textPosition: number | null = null;
        this.editor.state.doc.descendants((node: Node, pos: number) => {
            if (textPosition) return false;
            if (!node.isText) return true;
            const textContent = node.textContent.toLowerCase();
            if (node.isText && textContent.includes(text)) {
                textPosition = pos + textContent.indexOf(text);
                return false;
            }
        });

        return textPosition;
    }

    focusEditorAtCoords(left: number, top: number) {
        if (!this.context.nuxt.$utils.isMobile && !this.isInActiveTab) {
            return;
        }
        const pos = this.editor.view.posAtCoords({ left, top });

        if (pos) {
            this.editor.commands.focus(pos.pos);
        } else {
            this.focusEditor('end');
        }
    }

    textBetween(
        fragment: any,
        from: number,
        to: number,
        blockSeparator: string,
        leafText?: string | ((node: Node) => string),
    ) {
        let text = '';
        let separated = true;
        fragment.nodesBetween(
            from,
            to,
            (node: any, pos: any) => {
                if (node.isText) {
                    text += node.text.slice(
                        Math.max(from, pos) - pos,
                        to - pos,
                    );
                    separated = !blockSeparator;
                } else if (node.isLeaf && leafText) {
                    text +=
                        typeof leafText === 'function'
                            ? leafText(node)
                            : leafText;
                    separated = !blockSeparator;
                } else if (!separated && node.isBlock) {
                    text += blockSeparator;
                    separated = true;
                }
            },
            0,
        );
        return text;
    }

    findNode(node: any, predicate: any): { child: any; pos: number | null } {
        let found: { child: any; pos: number | null } = {
            child: null,
            pos: null,
        };
        node?.descendants((child: any, pos: number) => {
            if (predicate(child)) found = { child, pos };
            if (found) return false;
        });
        return found;
    }

    updateNodeAttrsByPredicate(
        attrs: Record<string, any>,
        predicate: (node: any) => boolean,
    ) {
        const { pos, child } = this.findNode(this.editor.state.doc, predicate);
        if (pos === null) return;

        this.editor.view.dispatch(
            this.editor.state.tr.setNodeMarkup(pos, null, {
                ...child.attrs,
                ...attrs,
            }),
        );
    }

    findMultiple(
        node: any,
        predicate: any,
    ): { child: any; pos: number | null }[] {
        const found: { child: any; pos: number | null }[] = [];
        node?.descendants((child: any, pos: number) => {
            if (predicate(child)) found.push({ child, pos });
        });
        return found;
    }

    updateNodesAttrsByPredicate(
        attrs: Record<string, any>,
        predicate: (node: any) => boolean,
    ) {
        const found = this.findMultiple(this.editor.state.doc, predicate);
        if (!found.length) return;

        const tr = this.editor.state.tr;
        found.forEach(({ pos, child }) => {
            if (!pos) return;
            tr.setNodeMarkup(pos, null, {
                ...child.attrs,
                ...attrs,
            });
        });
        this.editor.view.dispatch(tr);
    }

    updateNodeAttrs(pos: number, attrs: Record<string, any>) {
        this.editor.view.dispatch(
            this.editor.state.tr.setNodeMarkup(pos, null, attrs),
        );
    }

    findTaskPosById(id: string): number | null {
        const a = this.findChildrenByAttr(
            this.editor.state.doc,
            (attrs: any) => attrs?.id === id,
        );

        if (!a.length) return null;

        return a[0].pos;
    }

    findEntityPos(predicate: any): { child: any; pos: number } {
        let found = { child: null, pos: 0 };
        this.editor.state.doc?.descendants((child: any, pos: number) => {
            if (predicate(child)) found = { child, pos };
            if (found) return false;
        });
        return found;
    }

    focusTask(id: string) {
        if (!this.isInActiveTab) {
            return;
        }
        const pos = this.findTaskPosById(id);
        if (!pos) return;
        this.editor?.commands.focus(pos);
        this.editor?.commands.setNodeSelection(pos);
        this.editor?.commands.scrollIntoView();
    }

    findChildrenByAttr(node: any, predicate: any) {
        return findChildren(node, child => !!predicate(child.attrs));
    }

    focusHeading(id: string) {
        if (!id || id === 'title') {
            return;
        }

        const [heading] = findChildren(
            this.editor.state.doc as any,
            ({ attrs }: any) => {
                return attrs.id === id;
            },
        ) || [null];

        const editor = document.getElementById('editor-wrapper');
        if (heading && editor) {
            try {
                const dom = this.editor.view?.domAtPos(heading.pos, 0);
                if (dom && dom.node) {
                    const parent =
                        dom.node.childNodes![Math.max(dom.offset, 0)]
                            .firstChild!.parentElement;

                    if (parent) {
                        editor.scrollTop = parent.offsetTop;
                    }
                }
            } catch (e) {
                console.log(e); // quietly ignore maybe?
            } finally {
                if (!this.editor?.isDestroyed) {
                    if (heading.pos > 0) {
                        this.editor.commands.focus(heading.pos, {
                            scrollIntoView: true,
                        });
                    } else {
                        this.editor.commands.focus('start', {
                            scrollIntoView: true,
                        });
                    }
                }
            }
        }
    }

    setLastFocusPosition(pos: number) {
        this.editor.storage.lastFocusPosition.value = pos;
    }

    isCellSelection(value: any): value is CellSelection {
        return value instanceof CellSelection;
    }

    isNodeFocused(nodeName: string) {
        const from = this.editor.state.selection.$from.pos;
        const to = this.editor.state.selection.$to.pos;
        if (from === to || Math.abs(from - to) > 1) return false;
        const anchorNode = this.editor.state.doc.nodeAt(from);
        if (!anchorNode || anchorNode.type.name !== nodeName) {
            return false;
        }

        return true;
    }

    getFocusedNode() {
        const from = this.editor.state.selection.$from.pos;
        const to = this.editor.state.selection.$to.pos;
        return (
            this.editor.state.doc.nodeAt(from) ||
            this.editor.state.doc.nodeAt(to)
        );
    }

    executeOnFocusedNodeOfType = (
        nodeName: string,
        fn: (node: InternalNode) => void,
    ): boolean => {
        if (!this.isNodeFocused(nodeName)) return false;
        const node = this.getFocusedNode();
        if (!node) return false;

        fn(node);
        return true;
    };
}

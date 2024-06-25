import { EditorState, Plugin } from '@tiptap/pm/state';
import {
    Editor,
    CommandManager,
    createChainableState,
    ExtendedRegExpMatchArray,
    PasteRule,
} from '@tiptap/core';

export type PasteRuleMatch = {
    index: number;
    text: string;
    replaceWith?: string;
    match?: RegExpMatchArray;
    data?: Record<string, any>;
};

export type PasteRuleFinder =
    | RegExp
    | ((
          text: string,
          event?: ClipboardEvent,
      ) => PasteRuleMatch[] | null | undefined);

export function isRegExp(value: any): value is RegExp {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}

export function isNumber(value: any): value is number {
    return typeof value === 'number';
}

const pasteRuleMatcherHandler = (
    text: string,
    find: PasteRuleFinder,
    event?: ClipboardEvent,
): ExtendedRegExpMatchArray[] => {
    if (isRegExp(find)) {
        return [...text.matchAll(find)];
    }

    const matches = find(text, event);

    if (!matches) {
        return [];
    }

    return matches.reverse().map(pasteRuleMatch => {
        const result: ExtendedRegExpMatchArray = [pasteRuleMatch.text];

        result.index = pasteRuleMatch.index;
        result.input = text;
        result.data = pasteRuleMatch.data;

        if (pasteRuleMatch.replaceWith) {
            if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
                console.warn(
                    '[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".',
                );
            }

            result.push(pasteRuleMatch.replaceWith);
        }

        return result;
    });
};

function run(config: {
    editor: Editor;
    state: EditorState;
    from: number;
    to: number;
    rule: PasteRule;
    pasteEvent: ClipboardEvent;
    dropEvent: DragEvent;
}): boolean {
    const { editor, state, from, to, rule, pasteEvent, dropEvent } = config;

    const { commands, chain, can } = new CommandManager({
        editor,
        state,
    });

    const handlers: (void | null)[] = [];

    let textBlocks: {
        positions: {
            from: number;
            to: number;
            textFrom: number;
            textTo: number;
        }[];
        text: string;
    } = {
        positions: [],
        text: '',
    };

    const findRange = (start: number, end: number) => {
        const startBlock =
            textBlocks.positions.find(block => start! === block.textFrom)! ??
            textBlocks.positions[0];
        const endBlock =
            textBlocks.positions.find(
                block => end > block.textFrom && end! <= block.textTo,
            )! ?? textBlocks.positions[textBlocks.positions.length - 1];

        return {
            from: startBlock.from,
            to: endBlock.to,
            textFrom: startBlock.textFrom,
            textTo: endBlock.textTo,
            blockFrom: startBlock.from,
            blockTo: endBlock.to,
        };
    };

    const executeRules = () => {
        if (!textBlocks.positions.length) return;
        const matches = pasteRuleMatcherHandler(
            textBlocks.text,
            rule.find,
            pasteEvent,
        );

        matches.reverse().forEach(match => {
            if (match.index === undefined) {
                return;
            }

            const matchingBlock = findRange(
                match.index,
                match.index + match[0]!.length,
            );

            const start = state.tr.mapping.map(matchingBlock.from);
            const end = state.tr.mapping.map(matchingBlock.to);
            const range = {
                ...matchingBlock,
                from: start,
                to: end,
            };

            try {
                const handler = rule.handler({
                    state,
                    range,
                    match,
                    commands,
                    chain,
                    can,
                    pasteEvent,
                    dropEvent,
                });

                handlers.push(handler);
            } catch (e) {
                console.log(e);
            }
        });
        textBlocks = {
            positions: [],
            text: '',
        };
    };

    state.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isTextblock || node.type.spec.code) {
            executeRules();
            return;
        }
        if (node.type.name !== 'paragraph') {
            executeRules();
            return;
        }

        const resolvedFrom = Math.max(from, pos);
        const resolvedTo = Math.min(to, pos + node.content.size);
        // const text = node.textContent;
        const text = node.textBetween(
            resolvedFrom - pos,
            resolvedTo - pos,
            undefined,
            '\uFFFC',
        );
        // if (textBlocks.from === -1) {
        //     textBlocks.from = resolvedFrom;
        // }

        textBlocks.text += text + '\n';
        textBlocks.positions.push({
            from: resolvedFrom,
            to: resolvedTo + 1,
            textFrom: textBlocks.text.length - text.length - 1,
            textTo: textBlocks.text.length,
        });
        return false;
        // textBlocks.to = Math.min(state.doc.nodeSize - 1, resolvedTo + 1);
    });
    executeRules();

    const success = handlers.every(handler => handler !== null);

    return success;
}

/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule’s
 * action.
 */
export function blockPasteRulesPlugin(props: {
    editor: Editor;
    rules: PasteRule[];
}): Plugin[] {
    const { editor, rules } = props;
    let dragSourceElement: Element | null = null;
    let isPastedFromProseMirror = false;
    let isDroppedFromProseMirror = false;
    let pasteEvent = new ClipboardEvent('paste');
    let dropEvent = new DragEvent('drop');

    const plugins = rules.map(rule => {
        return new Plugin({
            // we register a global drag handler to track the current drag source element
            view(view) {
                const handleDragstart = (event: DragEvent) => {
                    dragSourceElement = view.dom.parentElement?.contains(
                        event.target as Element,
                    )
                        ? view.dom.parentElement
                        : null;
                };

                window.addEventListener('dragstart', handleDragstart);

                return {
                    destroy() {
                        window.removeEventListener(
                            'dragstart',
                            handleDragstart,
                        );
                    },
                };
            },

            props: {
                handleDOMEvents: {
                    drop: (view, event: Event) => {
                        isDroppedFromProseMirror =
                            dragSourceElement === view.dom.parentElement;
                        dropEvent = event as DragEvent;

                        return false;
                    },

                    paste: (_view, event: Event) => {
                        const html = (
                            event as ClipboardEvent
                        ).clipboardData?.getData('text/html');

                        pasteEvent = event as ClipboardEvent;

                        isPastedFromProseMirror =
                            !!html?.includes('data-pm-slice');

                        return false;
                    },
                },
            },

            appendTransaction: (transactions, oldState, state) => {
                const transaction = transactions[0];
                const isPaste =
                    transaction.getMeta('uiEvent') === 'paste' &&
                    !isPastedFromProseMirror;
                const isDrop =
                    transaction.getMeta('uiEvent') === 'drop' &&
                    !isDroppedFromProseMirror;

                if (!isPaste && !isDrop) {
                    return;
                }

                // stop if there is no changed range
                const from = oldState.doc.content.findDiffStart(
                    state.doc.content,
                );
                const to = oldState.doc.content.findDiffEnd(state.doc.content);

                if (!isNumber(from) || !to || from === to.b) {
                    return;
                }

                // build a chainable state
                // so we can use a single transaction for all paste rules
                const tr = state.tr;
                const chainableState = createChainableState({
                    state,
                    transaction: tr,
                });

                const handler = run({
                    editor,
                    state: chainableState,
                    from: Math.max(from - 1, 0),
                    to: to.b - 1,
                    rule,
                    pasteEvent,
                    dropEvent,
                });

                // stop if there are no changes
                if (!handler || !tr.steps.length) {
                    return;
                }

                dropEvent = new DragEvent('drop');
                pasteEvent = new ClipboardEvent('paste');

                return tr;
            },
        });
    });

    return plugins;
}

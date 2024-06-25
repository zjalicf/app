import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { registerEditorExtension } from '~/components/editor/extensions';
import { EditorTypes } from '~/constants';

interface Result {
    from: number;
    to: number;
}

interface TextNodesWithPosition {
    text: string;
    pos: number;
}

interface SearchOptions {
    searchTerm: string;
    replaceTerm: string;
    results: Result[];
    searchResultClass: string;
    caseSensitive: boolean;
    disableRegex: boolean;
    selectedSearchResultClass: string;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        search: {
            /**
             * @description selects next result from resultset
             */
            selectNextResult: () => ReturnType;
            /**
             * @description selects prtevious result from resultset
             */
            selectPrevResult: () => ReturnType;
            /**
             * @description Set search term in extension.
             */
            setSearchTerm: (searchTerm: string) => ReturnType;
            /**
             * @description Set replace term in extension.
             */
            setReplaceTerm: (replaceTerm: string) => ReturnType;
            /**
             * @description Replace first instance of search result with given replace term.
             */
            replace: () => ReturnType;
            /**
             * @description Replace all instances of search result with given replace term.
             */
            replaceAll: () => ReturnType;
        };
    }
}

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance() {
        return Extension.create<SearchOptions>({
            name: 'search',

            addOptions() {
                return {
                    ...this.parent?.(),
                    searchTerm: '',
                    replaceTerm: '',
                    results: [],
                    searchResultClass: 'search-result',
                    selectedSearchResultClass: 'search-result-selected',
                    caseSensitive: false,
                    disableRegex: true,
                };
            },

            addStorage() {
                return {
                    searchResultsAmount: 0,
                    searchCurrentIndex: 0,
                    selectedNodePosition: { from: 0, to: 0 },
                };
            },

            addCommands() {
                return {
                    selectNextResult: () => () => {
                        this.storage.searchCurrentIndex++;
                        if (
                            this.storage.searchCurrentIndex >=
                            this.options.results.length
                        ) {
                            this.storage.searchCurrentIndex = 0;
                        }
                        this.storage.selectedNodePosition =
                            this.options.results[
                                this.storage.searchCurrentIndex
                            ];
                        return false;
                    },
                    selectPrevResult: () => () => {
                        this.storage.searchCurrentIndex--;
                        if (this.storage.searchCurrentIndex < 0) {
                            this.storage.searchCurrentIndex =
                                this.options.results.length - 1;
                        }
                        this.storage.selectedNodePosition =
                            this.options.results[
                                this.storage.searchCurrentIndex
                            ];
                        return false;
                    },
                    setSearchTerm:
                        (searchTerm: string) =>
                        ({ state, dispatch }) => {
                            this.options.searchTerm = searchTerm;
                            this.options.results = [];

                            updateView(state, dispatch);

                            return false;
                        },
                    setReplaceTerm:
                        (replaceTerm: string) =>
                        ({ state, dispatch }) => {
                            this.options.replaceTerm = replaceTerm;
                            this.options.results = [];

                            updateView(state, dispatch);

                            return false;
                        },
                    replace:
                        () =>
                        ({ state, dispatch }) => {
                            const { replaceTerm, results } = this.options;

                            replace(replaceTerm, results, { state, dispatch });

                            this.options.results.shift();

                            updateView(state, dispatch);

                            return false;
                        },
                    replaceAll:
                        () =>
                        ({ state, tr, dispatch }) => {
                            const { replaceTerm, results } = this.options;

                            replaceAll(replaceTerm, results, { tr, dispatch });

                            this.options.results = [];

                            updateView(state, dispatch);

                            return false;
                        },
                };
            },

            addProseMirrorPlugins() {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const extensionThis = this;

                return [
                    new Plugin({
                        key: new PluginKey('search'),
                        state: {
                            init() {
                                return DecorationSet.empty;
                            },
                            apply({ doc, docChanged }) {
                                const {
                                    searchTerm,
                                    searchResultClass,
                                    disableRegex,
                                    caseSensitive,
                                    selectedSearchResultClass,
                                } = extensionThis.options;
                                if (docChanged || searchTerm) {
                                    const {
                                        decorationsToReturn,
                                        results,
                                        newNodeSelection,
                                    } = processSearches(
                                        extensionThis,
                                        doc,
                                        regex(
                                            searchTerm,
                                            disableRegex,
                                            caseSensitive,
                                        ),
                                        searchResultClass,
                                        selectedSearchResultClass,
                                    );

                                    extensionThis.options.results = results;

                                    extensionThis.storage.searchResultsAmount =
                                        extensionThis.options.results.length;
                                    extensionThis.storage.selectedNodePosition =
                                        newNodeSelection;
                                    extensionThis.storage.searchCurrentIndex =
                                        results.indexOf(newNodeSelection);

                                    return decorationsToReturn;
                                }

                                extensionThis.options.results = [];
                                extensionThis.storage.searchResultsAmount = 0;
                                extensionThis.storage.selectedNodePosition =
                                    null;
                                extensionThis.storage.searchCurrentIndex = 0;

                                return DecorationSet.empty;
                            },
                        },
                        props: {
                            decorations(state) {
                                return this.getState(state);
                            },
                        },
                    }),
                ];
            },
        });
    },
});

const updateView = (state: EditorState, dispatch: any) => {
    dispatch(state.tr);
};

const regex = (
    s: string,
    disableRegex: boolean,
    caseSensitive: boolean,
): RegExp => {
    return RegExp(
        disableRegex ? s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') : s,
        caseSensitive ? 'gu' : 'gui',
    );
};

function findClosestMatchToSelection(
    lastSelection: { from: number; to: number },
    results: Result[],
) {
    if (!lastSelection) {
        return results[0];
    }
    const exactMatch = results.find(r => r.from === lastSelection.from);
    if (exactMatch) return exactMatch;
    const resultsSorted = results;
    resultsSorted.sort(a => {
        return Math.abs(a.from - lastSelection.from);
    });
    return resultsSorted[0];
}

function processSearches(
    localThis: any,
    doc: ProsemirrorNode,
    searchTerm: RegExp,
    searchResultClass: string,
    selectedSearchResultClass: string,
): {
    decorationsToReturn: DecorationSet;
    results: Result[];
    newNodeSelection: { from: number; to: number };
} {
    const decorations: Decoration[] = [];
    let textNodesWithPosition: TextNodesWithPosition[] = [];
    const results: Result[] = [];

    let index = 0;

    if (!searchTerm)
        return {
            decorationsToReturn: DecorationSet.empty,
            results: [],
            newNodeSelection: { from: 0, to: 0 },
        };

    doc?.descendants((node, pos) => {
        if (node.isText) {
            if (textNodesWithPosition[index]) {
                textNodesWithPosition[index] = {
                    text: textNodesWithPosition[index].text + node.text,
                    pos: textNodesWithPosition[index].pos,
                };
            } else {
                textNodesWithPosition[index] = {
                    text: `${node.text}`,
                    pos,
                };
            }
        } else {
            index += 1;
        }
    });

    textNodesWithPosition = textNodesWithPosition.filter(Boolean);

    for (let i = 0; i < textNodesWithPosition.length; i += 1) {
        const { text, pos } = textNodesWithPosition[i];

        const matches = [...text.matchAll(searchTerm)];

        for (let j = 0; j < matches.length; j += 1) {
            const m = matches[j];

            if (m[0] === '') break;

            if (m.index !== undefined) {
                results.push({
                    from: pos + m.index,
                    to: pos + m.index + m[0].length,
                });
            }
        }
    }

    const newSelection = findClosestMatchToSelection(
        localThis.storage.selectedNodePosition,
        results,
    );

    const newSelectedIndex = results.indexOf(newSelection);

    for (let i = 0; i < results.length; i += 1) {
        const r = results[i];
        if (i === newSelectedIndex) {
            decorations.push(
                Decoration.inline(r.from, r.to, {
                    class: selectedSearchResultClass,
                }),
            );
        } else {
            decorations.push(
                Decoration.inline(r.from, r.to, { class: searchResultClass }),
            );
        }
    }

    return {
        decorationsToReturn: DecorationSet.create(doc, decorations),
        results,
        newNodeSelection: newSelection,
    };
}

const replace = (
    replaceTerm: string,
    results: Result[],
    { state, dispatch }: any,
) => {
    const firstResult = results[0];

    if (!firstResult) return;

    const { from, to } = results[0];

    if (dispatch) dispatch(state.tr.insertText(replaceTerm, from, to));
};

const rebaseNextResult = (
    replaceTerm: string,
    index: number,
    lastOffset: number,
    results: Result[],
): [number, Result[]] | null => {
    const nextIndex = index + 1;

    if (!results[nextIndex]) return null;

    const { from: currentFrom, to: currentTo } = results[index];

    const offset = currentTo - currentFrom - replaceTerm.length + lastOffset;

    const { from, to } = results[nextIndex];

    results[nextIndex] = {
        to: to - offset,
        from: from - offset,
    };

    return [offset, results];
};

const replaceAll = (
    replaceTerm: string,
    results: Result[],
    { tr, dispatch }: any,
) => {
    let offset = 0;

    let ourResults = results.slice();

    if (!ourResults.length) return;

    for (let i = 0; i < ourResults.length; i += 1) {
        const { from, to } = ourResults[i];

        tr.insertText(replaceTerm, from, to);

        const rebaseNextResultResponse = rebaseNextResult(
            replaceTerm,
            i,
            offset,
            ourResults,
        );

        if (rebaseNextResultResponse) {
            offset = rebaseNextResultResponse[0];
            ourResults = rebaseNextResultResponse[1];
        }
    }

    dispatch(tr);
};

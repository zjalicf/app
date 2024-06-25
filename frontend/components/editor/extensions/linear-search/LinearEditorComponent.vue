<template>
    <node-view-wrapper ref="linearSearch" as="span" style="white-space: nowrap"
        ><img class="ProseMirror-separator" /><span
            ref="link"
            class="inline-document-link open"
            ><LinearIconRound size="16" class="icon" /><span
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
                    @keydown.backspace.stop="handleBackspace"
                    @keydown.esc.stop.prevent="removeLink"
                    @keydown.down.prevent.stop="handleKeyDown"
                    @keydown.up.prevent.stop="handleKeyUp"
                    @keydown.enter.prevent.stop="handleEnter"
                    @input="handleInput"
                    @blur="handleBlur"
                /> </span></span
        ><img class="ProseMirror-separator"
    /></node-view-wrapper>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { NodeViewWrapper } from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import { AcreomJiraIssue } from '~/components/task/model';
import { SearchServiceAction, ServiceKey } from '~/constants';
import GithubSuggestions from '~/components/github/GithubSuggestions.vue';
import LinearIconRound from '~/components/linear/icons/LinearIconRound.vue';
import { LinearIntegrationDataType } from '~/constants/linear';
import LinearSuggestions from '~/components/editor/extensions/linear-search/LinearSuggestions.vue';

@Component({
    name: 'GithubEditorComponent',
    components: {
        LinearIconRound,
        GithubIcon,
        NodeViewWrapper,
    },
})
export default class GithubEditorComponent extends Vue {
    node!: Node;
    editor!: any;
    deleteNode!: () => void;
    getPos!: () => number;
    shadowValue: string = '';
    value: string = '';
    results: any[] = [];
    selectedIndex: number = 0;
    placeholder: string = 'Search Linear Issues';

    $refs!: {
        input: HTMLInputElement;
        shadow: HTMLSpanElement;
        link: HTMLSpanElement;
    };

    removeLink(preventFocus?: boolean) {
        this.deleteNode();
        if (preventFocus) {
            this.editor.commands.focus(this.getPos());
        }
    }

    handleEnter() {
        this.handleIssueSelect(this.results[this.selectedIndex]);
    }

    handleBackspace() {
        if (this.value !== '') return;
        this.removeLink();
    }

    handleBlur() {
        this.removeLink(true);
    }

    handleInput(e: InputEvent): void | Promise<void> {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        this.value = target.value;

        this.shadowValue =
            this.value.length === 0 ? this.placeholder : this.value;
        this.recalculateWidth();

        if (this.value.trim().length <= 0) {
            this.selectedIndex = 0;
            this.results = [];
        }

        this.setResults();
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

    recalculateWidth() {
        this.$nextTick(() => {
            const width = this.$refs.shadow.offsetWidth!;
            this.$refs.input.style.width = `${Math.min(width, 473)}px`;
        });
    }

    mounted() {
        this.shadowValue = this.placeholder;
        this.$nextTick(() => {
            this.recalculateWidth();
            this.$refs.input.focus({
                preventScroll: true,
            });
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

    handleClick() {
        this.handleIssueSelect(this.results[this.selectedIndex]);
    }

    async setResults() {
        if (!this.value.length) return [];
        const activeVault = this.$store.getters['vault/active'];
        const [results] = await Promise.all([
            this.$serviceRegistry
                .invoke<{ documents: AcreomJiraIssue[] }>(
                    ServiceKey.SEARCH,
                    SearchServiceAction.QUERY,
                    {
                        query: this.value,
                        options: {
                            limit: 5,
                            fields: ['title'],
                            activeVault,
                            thisVaultOnly: true,
                            entity: [LinearIntegrationDataType.ISSUE],
                            skipCreateDailyDocIfNeeded: true,
                        },
                    },
                )
                .then(data => {
                    return this.$entities.linear.deserializeIssues(
                        data?.documents.map(entity => {
                            return this.$entities.linear.getById(entity.id);
                        }) ?? [],
                    );
                })
                .catch(() => this.results),
        ]);
        this.results = results;
        // const thisVaultDocs =
        //     results?.filter(({ vaultId }: any) => vaultId === activeVault.id) ??
        //     [];

        // this.results = [...thisVaultDocs.slice(0, 5)];
    }

    handleIssueSelect(issue: any) {
        const pos = this.getPos();
        this.editor.commands.command(({ tr, state }: any) => {
            const type = 'linear-link';

            const node = state.schema.nodes[type].create({
                id: issue.id,
                title: issue.title,
                url: issue.url,
                identifier: issue.identifier,
            });

            tr.replaceWith(pos, pos + 1, node);

            return true;
        });
        this.editor.commands.focus(pos + 1);

        this.$dropdown.hideAll();
    }

    beforeDestroy() {
        this.$dropdown.hideAll();
    }

    createPopper() {
        this.$dropdown.hideAll();
        if (this.value.trim().length === 0 || this.results.length === 0) return;

        this.$dropdown.show({
            parent: this.$refs.link,
            component: LinearSuggestions,
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
    padding: 2px 4px;
    cursor: default;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;

    &.open {
        padding-top: 3px;
    }

    &--wrapper {
        display: inline-flex;
    }

    &:hover:not(.open),
    &.has-focus {
        background: var(--editor-extension-document-link-bg-color__hover);
        user-select: none;
        border: 2px solid var(--accent-color);
        padding: 1px 2px;

        .icon {
            color: var(--editor-extension-document-link-icon-color__hover);
        }
    }

    > .icon {
        color: var(--editor-extension-document-link-icon-color);
        position: relative;
        top: -2px;
        display: inline;
        width: 16px;
        height: 16px;
        margin-right: 4px;
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

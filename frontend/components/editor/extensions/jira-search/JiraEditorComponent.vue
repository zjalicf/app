<template>
    <node-view-wrapper ref="jiraSearch" as="span" style="white-space: nowrap"
        ><img class="ProseMirror-separator" /><span
            ref="issues"
            class="jira-search-component"
            ><span class="jira-search-component__wrapper"
                ><JiraIcon size="16" class="icon" /><span
                    class="jira-search-component__input"
                    ><span
                        ref="shadow"
                        class="jira-search-component__input__shadow"
                        ><span style="visibility: hidden">{{
                            text || shadowValue || placeholder
                        }}</span></span
                    ><input
                        ref="input"
                        type="text"
                        autocomplete="off"
                        autocapitalize="off"
                        spellcheck="false"
                        :value="text"
                        :placeholder="placeholder"
                        @input="handleInput"
                        @keydown.esc="removeLink"
                        @keydown.backspace="handleBackspace"
                        @keydown.down.prevent.stop="handleKeyDown"
                        @keydown.up.prevent.stop="handleKeyUp"
                        @keydown.enter.prevent.stop="handleEnter"
                        @blur="handleBlur" /></span></span></span
        ><img class="ProseMirror-separator"
    /></node-view-wrapper>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { CalendarIcon } from '@vue-hero-icons/solid';
import { Node } from '@tiptap/pm/model';
import { NodeViewWrapper } from '@tiptap/vue-2';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { SearchServiceAction, ServiceKey, TabType } from '~/constants';
import { AcreomJiraIssue } from '~/components/task/model';
import { JiraIntegrationDataType } from '~/constants/jira';
import JiraSuggestions from '~/components/editor/extensions/apps/JiraSuggestions.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'JiraIssueComponent',
    components: {
        NodeViewWrapper,
        JiraIcon,
        CalendarIcon,
    },
})
export default class JiraIssueComponent extends Vue {
    open: boolean = true;
    text: string = '';
    placeholder: string = 'Search Jira Issues';
    shadowValue: string = '';

    getPos!: () => number;
    deleteNode!: () => void;
    selectedIndex: number = 0;
    node!: Node;
    editor!: any;
    canBlur: boolean = true;
    results: AcreomJiraIssue[] = [];

    @Prop({ default: false })
    selected!: boolean;

    $refs!: {
        input: HTMLInputElement;
        shadow: HTMLSpanElement;
        issues: HTMLElement;
    };

    recalculateWidth() {
        this.$nextTick(() => {
            const width = this.$refs.shadow.offsetWidth! + 2;
            this.$refs.input.style.width = `${Math.min(width, 473)}px`;
        });
    }

    handleInputSpecific() {
        this.shadowValue =
            this.text.length === 0 ? this.placeholder : this.text;
        this.recalculateWidth();
    }

    handleInput(e: InputEvent): void | Promise<void> {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        this.$emit('input', target.value);
        this.text = target.value;

        this.handleInputSpecific();

        if (this.text.trim().length <= 0) {
            this.selectedIndex = 0;
            this.results = [];

            // this.suggestions = [];
        }

        this.setResults();
        // this.debouncedSetSuggestion();
    }

    handleBlur() {
        this.removeLink(true);
    }

    handleEnter(event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        if (this.results.length === 0) return;
        if (!this.text.trim().length) {
            this.canBlur = true;
            return;
        }
        this.canBlur = false;

        this.handleIssueSelect(this.results[this.selectedIndex]);
    }

    handleClick() {
        this.canBlur = false;
        this.handleIssueSelect(this.results[this.selectedIndex]);
    }

    // @Watch('text')
    async setResults() {
        if (!this.text.length) return [];
        const activeVault = this.$store.getters['vault/active'];
        const [results] = await Promise.all([
            this.$serviceRegistry
                .invoke<{ documents: AcreomJiraIssue[] }>(
                    ServiceKey.SEARCH,
                    SearchServiceAction.QUERY,
                    {
                        query: this.text,
                        options: {
                            fields: ['title'],
                            activeVault,
                            thisVaultOnly: true,
                            entity: JiraIntegrationDataType.ISSUE,
                            skipCreateDailyDocIfNeeded: true,
                        },
                    },
                )
                .then(data => data?.documents)
                .catch(() => this.results),
        ]);
        const thisVaultDocs =
            results?.filter(({ vaultId }: any) => vaultId === activeVault.id) ??
            [];

        this.results = [...thisVaultDocs.slice(0, 5)];
    }

    createPopper() {
        this.$dropdown.hideAll();
        if (
            this.text.trim().length === 0 ||
            !this.open ||
            this.results.length === 0
        )
            return;
        this.$dropdown.show({
            parent: this.$refs.issues,
            component: JiraSuggestions,
            retainFocus: true,
            backdrop: false,
            // placement: 'bottom-start',
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

    handleIssueSelect(issue: AcreomJiraIssue) {
        const pos = this.getPos();
        this.editor.commands.command(({ tr, state }: any) => {
            const type = 'jira-link';

            const id = issue.id;
            const entity = this.$entities.jira.getById(id);

            const node = state.schema.nodes[type].create({
                id: entity.key,
                title: entity.text,
                key: entity.key,
                url: entity.url,
            });

            tr.replaceWith(pos, pos + 1, node);

            return true;
        });
        this.editor.commands.focus(pos + 1);
        this.$dropdown.hideAll();
        const activeTab = this.$tabs.activeTab();
        if (!activeTab) return;
        this.$tracking.trackEventV2(TrackingType.EDITOR, {
            action: TrackingAction.INSERT_JIRA_ISSUE,
            source: TrackingActionSource.AUTOCOMPLETE,
            sourceMeta:
                activeTab.type === TabType.MY_DAY
                    ? TrackingActionSourceMeta.MY_DAY
                    : TrackingActionSourceMeta.PAGE,
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

    removeLink(preventFocus?: boolean) {
        this.deleteNode();
        if (preventFocus) {
            this.editor.commands.focus(this.getPos());
        }
    }

    handleBackspace() {
        if (this.text !== '') return;
        this.removeLink();
    }

    mounted() {
        this.recalculateWidth();
        this.$nextTick(() => {
            this.$refs.input.focus({
                preventScroll: true,
            });
        });
        this.shadowValue = this.placeholder;
    }
}
</script>

<style lang="scss" scoped>
.jira-search-component {
    img {
        user-select: none;
    }

    &__wrapper {
        background: var(--editor-extension-document-link-bg-color);
        border-radius: 6px;
        padding: 2px 4px;
        cursor: default;
        -webkit-box-decoration-break: clone;
        -o-box-decoration-break: clone;
        box-decoration-break: clone;

        .icon {
            top: -2px;
            position: relative;
            display: inline;
            margin-right: 4px;
            flex-shrink: 0;
        }
    }

    &__input {
        &__shadow {
            position: absolute;
            visibility: hidden;
            overflow: hidden;
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            max-width: 473px;
            white-space: pre;
        }

        input {
            position: relative;
            outline: none;
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            width: 0;
            max-width: 473px;

            &::placeholder {
                color: var(--editor-extension-placeholder-color);
            }
        }
    }
}
</style>
